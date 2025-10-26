import { useEffect, useMemo, useRef, useState } from 'react';

interface Opts {
  targetSelector?: string; // 目标元素（默认 .maid-inputbar）
  margin?: number; // 与可视底边间距
  maxLift?: number; // 最大上移
  fallbackResize?: boolean;
}

export function useKeyboardLift({
  targetSelector = '.maid-inputbar',
  margin = 8,
  maxLift = 240,
  fallbackResize = true,
}: Opts = {}) {
  const [lift, setLift] = useState(0);
  const [open, setOpen] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const vv = (window as any).visualViewport as VisualViewport | undefined;

    const getTarget = () => (document.querySelector(targetSelector) as HTMLElement | null) ?? null;

    const measure = () => {
      const el = getTarget();
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const vh = vv ? vv.height : window.innerHeight;
      const vBottom = (vv ? vv.offsetTop : 0) + vh;

      const need = Math.max(0, Math.ceil(rect.bottom + margin - vBottom));
      const next = Math.min(need, maxLift);

      setLift(next);
      setOpen(next > 0);
    };

    const schedule = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(measure);
    };

    if (vv) {
      vv.addEventListener('resize', schedule);
      vv.addEventListener('scroll', schedule);
    }
    if (fallbackResize || !vv) {
      window.addEventListener('resize', schedule);
      window.addEventListener('scroll', schedule, true);
    }
    window.addEventListener('focusin', schedule);
    window.addEventListener('focusout', () => {
      requestAnimationFrame(() => {
        setLift(0);
        setOpen(false);
      });
    });

    schedule();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (vv) {
        vv.removeEventListener('resize', schedule);
        vv.removeEventListener('scroll', schedule);
      }
      if (fallbackResize || !vv) {
        window.removeEventListener('resize', schedule);
        window.removeEventListener('scroll', schedule, true);
      }
      window.removeEventListener('focusin', schedule);
    };
  }, [targetSelector, margin, maxLift, fallbackResize]);

  // 同时把上移量写进 CSS 变量，LESS 用它补等量的 padding-top
  const pageStyle = useMemo<React.CSSProperties>(() => {
    const y = Math.max(0, Math.round(lift));
    return {
      transform: `translate3d(0, ${-y}px, 0)`,
      // 供样式中使用：var(--kbd-lift)
      ['--kbd-lift' as any]: `${y}px`,
    };
  }, [lift]);

  return { pageStyle, keyboardOpen: open, lift };
}
