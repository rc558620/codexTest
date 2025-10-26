import React, { useEffect, useMemo, useRef } from 'react';

const PLAYED_IDS = new Set<string>(); // 页面级缓存（跨卸载/重挂载）

export interface CountUpProps {
  value: number;
  durationMs?: number;
  decimals?: number;
  format?: (n: number) => string;
  className?: string;
  autoplay?: boolean;
  /** 是否只播放一次（默认 false） */
  playOnce?: boolean;
  /** 播放唯一标识：同 id 只播放一次（建议传） */
  id?: string;
}

const CountUp: React.FC<CountUpProps> = ({
  value,
  durationMs = 1000,
  decimals = 0,
  format,
  className,
  autoplay = true,
  playOnce = false,
  id,
}) => {
  const spanRef = useRef<HTMLSpanElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTsRef = useRef<number | null>(null);
  const fromRef = useRef<number>(0);
  const toRef = useRef<number>(0);
  const playingRef = useRef<boolean>(autoplay);

  const fmt = useMemo(() => {
    if (format) return format;
    return (n: number) => n.toFixed(decimals);
  }, [decimals, format]);

  useEffect(() => {
    // 若要求只播放一次且该 id 已播放过，则直接静态展示
    if (playOnce && id && PLAYED_IDS.has(id)) {
      if (spanRef.current) spanRef.current.textContent = fmt(Number.isFinite(value) ? value : 0);
      return;
    }

    toRef.current = Number.isFinite(value) ? value : 0;

    const currentText = spanRef.current?.textContent ?? '';
    const parsed = Number(currentText.replace(/,/g, ''));
    const current = Number.isFinite(parsed) ? parsed : 0;
    fromRef.current = current;

    startTsRef.current = null;
    playingRef.current = true;

    // ✅ 修复点 1：在“开始动画”前就标记为已播放（防止中途卸载导致下次重复动画）
    if (playOnce && id) {
      PLAYED_IDS.add(id);
    }

    const step = (ts: number) => {
      if (!playingRef.current) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }
      if (startTsRef.current == null) startTsRef.current = ts;
      const elapsed = ts - (startTsRef.current || ts);
      const t = Math.min(1, elapsed / Math.max(1, durationMs));
      const next = fromRef.current + (toRef.current - fromRef.current) * t;

      if (spanRef.current) spanRef.current.textContent = fmt(next);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        if (spanRef.current) spanRef.current.textContent = fmt(toRef.current);
        rafRef.current = null;
        // （保留原逻辑）再次标记无副作用
        if (playOnce && id) PLAYED_IDS.add(id);
      }
    };

    if (spanRef.current) spanRef.current.textContent = fmt(fromRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      startTsRef.current = null;
    };
  }, [value, durationMs, fmt, playOnce, id]);

  return <span ref={spanRef} className={className} />;
};

export default CountUp;
