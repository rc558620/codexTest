import { useEffect, useLayoutEffect, useRef } from 'react';

export interface UseSmoothCollapseOptions {
  expand: boolean;
  durationExpand?: number; // 默认 260ms
  durationCollapse?: number; // 默认 220ms
  easing?: string; // 默认 cubic-bezier(.2,.8,.2,1)
}

/** height+opacity 折叠：双 rAF、令牌/兜底、展开后复位 auto、暂停 RO 避免“二次动画” */
export function useSmoothCollapse(
  wrapRef: React.RefObject<HTMLDivElement>,
  innerRef: React.RefObject<HTMLDivElement>,
  opts: UseSmoothCollapseOptions,
) {
  const {
    expand,
    durationExpand = 260,
    durationCollapse = 220,
    easing = 'cubic-bezier(.2,.8,.2,1)',
  } = opts;

  const tokenRef = useRef(0);
  const runningRef = useRef(false);
  const raf1 = useRef<number | null>(null);
  const raf2 = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const cachedH = useRef(0);
  const roRef = useRef<ResizeObserver | null>(null);

  const cancelPending = (): void => {
    if (raf1.current !== null) {
      cancelAnimationFrame(raf1.current);
    }
    if (raf2.current !== null) {
      cancelAnimationFrame(raf2.current);
    }
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }
    raf1.current = null;
    raf2.current = null;
    timeoutRef.current = null;
  };

  // 目标高度（你的 .collapse 已经 padding:0，所以这里直接用 inner.scrollHeight）
  const measureTarget = (): number => {
    const inner = innerRef.current;
    if (!inner) return 0;
    return inner.scrollHeight;
  };

  // 初始化：缓存高度 + RO（动画时暂不响应）
  useLayoutEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;

    const measure = (): void => {
      cachedH.current = measureTarget();
    };
    measure();

    const ro = new ResizeObserver(() => {
      if (runningRef.current) return;
      measure();
    });
    ro.observe(inner);
    roRef.current = ro;

    return () => {
      ro.disconnect();
    };
  }, []);

  const finish = (isExpand: boolean, myToken: number): void => {
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return;
    if (myToken !== tokenRef.current) return;

    wrap.style.transition = '';
    wrap.style.willChange = '';
    if (isExpand) {
      wrap.style.height = 'auto'; // 展开后自适应
      cachedH.current = measureTarget(); // 同步缓存
    }
    runningRef.current = false;
    if (roRef.current) {
      roRef.current.observe(inner); // 恢复监听
    }
  };

  const animate = (isExpand: boolean): void => {
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return;

    tokenRef.current += 1;
    const myToken = tokenRef.current;
    runningRef.current = true;

    if (roRef.current) {
      roRef.current.unobserve(inner);
    }
    cancelPending();

    const target = `${cachedH.current || measureTarget()}px`;

    wrap.style.transition = 'none';
    wrap.style.overflow = 'hidden';
    wrap.style.willChange = 'height, opacity';

    if (isExpand) {
      // 0 -> target
      wrap.style.height = '0px';
      wrap.style.opacity = '0';

      raf1.current = requestAnimationFrame(() => {
        raf2.current = requestAnimationFrame(() => {
          if (myToken !== tokenRef.current) return;

          wrap.style.transition = `height ${durationExpand}ms ${easing}, opacity ${Math.min(durationExpand - 40, 260)}ms ease`;
          wrap.style.height = target;
          wrap.style.opacity = '1';

          const onEnd = (e: TransitionEvent) => {
            if (e.propertyName !== 'height') return;
            wrap.removeEventListener('transitionend', onEnd);
            finish(true, myToken);
          };
          wrap.addEventListener('transitionend', onEnd, { once: true });

          timeoutRef.current = window.setTimeout(() => {
            finish(true, myToken);
          }, durationExpand + 60);
        });
      });
    } else {
      // current/auto -> 0
      const start = wrap.style.height && wrap.style.height !== 'auto' ? wrap.style.height : target;
      wrap.style.height = start;
      wrap.style.opacity = '1';
      // 触发布局，确保起点生效
      wrap.getBoundingClientRect();

      raf1.current = requestAnimationFrame(() => {
        if (myToken !== tokenRef.current) return;

        wrap.style.transition = `height ${durationCollapse}ms ${easing}, opacity ${Math.min(durationCollapse - 20, 220)}ms ease`;
        wrap.style.height = '0px';
        wrap.style.opacity = '0';

        const onEnd = (e: TransitionEvent) => {
          if (e.propertyName !== 'height') return;
          wrap.removeEventListener('transitionend', onEnd);
          finish(false, myToken);
        };
        wrap.addEventListener('transitionend', onEnd, { once: true });

        timeoutRef.current = window.setTimeout(() => {
          finish(false, myToken);
        }, durationCollapse + 60);
      });
    }
  };

  useEffect(() => {
    animate(expand);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expand]);
}
