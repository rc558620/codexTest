import { RefObject, useEffect } from 'react';

interface Options {
  /** 滚过多少像素后变为实底（默认 120px） */
  thresholdPx?: number;
}

/**
 * 当滚动超过阈值时给 header 加上 .is-solid 类名，否则移除。
 * 通过 IntersectionObserver，不绑 scroll，不抖动，性能好。
 *
 * 用法：
 *  const rootRef = useRef<HTMLDivElement|null>(null);
 *  const headerRef = useRef<HTMLDivElement|null>(null);
 *  const sentRef = useRef<HTMLDivElement|null>(null);
 *  useHeaderSolidOnScroll(rootRef, headerRef, sentRef, { thresholdPx: 120 });
 */
export function useHeaderSolidOnScroll(
  scrollRef: RefObject<HTMLElement>,
  headerRef: RefObject<HTMLElement>,
  sentinelRef: RefObject<HTMLElement>,
  opts: Options = {},
) {
  useEffect(() => {
    const root = scrollRef.current ?? null;
    const header = headerRef.current ?? null;
    const sentinel = sentinelRef.current ?? null;
    if (!root || !header || !sentinel) return;

    const thresholdPx = typeof opts.thresholdPx === 'number' ? opts.thresholdPx : 120;

    // 观察“哨兵”元素是否还在视口顶部阈值区域内
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        // 当哨兵仍在视口内（顶端以上区域）——> header 透明
        // 当哨兵离开（滚过阈值）——> header 实底
        if (e.isIntersecting) {
          header.classList.remove('is-solid');
        } else {
          header.classList.add('is-solid');
        }
      },
      {
        root, // 以你的滚动容器为根（通常是 .maid-root）
        rootMargin: `-${thresholdPx}px 0px 0px 0px`, // 提前 thresholdPx 触发
        threshold: 0,
      },
    );

    io.observe(sentinel);

    return () => {
      io.disconnect();
    };
  }, [scrollRef, headerRef, sentinelRef, opts?.thresholdPx]);
}
