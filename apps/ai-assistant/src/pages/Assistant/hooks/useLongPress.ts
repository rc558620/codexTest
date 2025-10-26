// src/pages/History/hooks/useLongPress.ts
import { useEffect, useRef } from 'react';

interface Options {
  delay?: number; // 长按时长
  moveThreshold?: number; // 移动阈值
  preventContextMenu?: boolean;
}

export function useLongPress(onLongPress: () => void, optsOrDelay?: number | Options) {
  const opts: Options =
    typeof optsOrDelay === 'number' ? { delay: optsOrDelay } : (optsOrDelay ?? {});

  const delay = opts.delay ?? 520;
  const threshold = opts.moveThreshold ?? 8;
  const preventCtx = opts.preventContextMenu ?? true;

  const timerRef = useRef<number | null>(null);
  const pressing = useRef(false);
  const triggered = useRef(false); // 这次按压是否已触发过长按
  const startX = useRef(0);
  const startY = useRef(0);

  const clearTimer = () => {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => clearTimer, []);

  // 一次性阻断本次长按后的 click（捕获阶段，抢在 document 之前）
  const installOneShotClickBlocker = () => {
    const blocker = (ev: MouseEvent) => {
      ev.preventDefault();
      ev.stopPropagation();
      window.removeEventListener('click', blocker, true);
    };
    window.addEventListener('click', blocker, true);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    pressing.current = true;
    triggered.current = false;
    startX.current = e.clientX;
    startY.current = e.clientY;

    const el = e.currentTarget as HTMLElement;
    el.classList.add('lp-no-select'); // 禁止选中/系统菜单

    try {
      el.setPointerCapture?.(e.pointerId);
    } catch {}

    clearTimer();
    timerRef.current = window.setTimeout(() => {
      if (!pressing.current) return;
      triggered.current = true;
      installOneShotClickBlocker(); // ⬅️ 吃掉随后的“长按后 click”
      onLongPress();
    }, delay);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!pressing.current) return;
    const dx = Math.abs(e.clientX - startX.current);
    const dy = Math.abs(e.clientY - startY.current);
    if (dx > threshold || dy > threshold) {
      pressing.current = false;
      clearTimer();
      (e.currentTarget as HTMLElement).classList.remove('lp-no-select');
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {}
    }
  };

  const end = (e: React.PointerEvent<HTMLElement>) => {
    pressing.current = false;
    clearTimer();
    (e.currentTarget as HTMLElement).classList.remove('lp-no-select');
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {}

    // 某些浏览器会在 pointerup 之后马上派发 click，
    // 我们已经在触发长按时安装了 blocker；这里无需额外处理。
    // 如果需要更保险，也可以在已触发长按时再装一次：
    if (triggered.current) installOneShotClickBlocker();
  };

  const onContextMenu = (e: React.MouseEvent) => {
    if (preventCtx) e.preventDefault();
  };
  const onSelectStart = (e: React.SyntheticEvent) => e.preventDefault();
  const onDragStart = (e: React.DragEvent) => e.preventDefault();

  return {
    bind: {
      onPointerDown,
      onPointerMove,
      onPointerUp: end,
      onPointerCancel: end,
      onContextMenu,
      onSelectStart,
      onDragStart,
    },
    clear: clearTimer,
  };
}
