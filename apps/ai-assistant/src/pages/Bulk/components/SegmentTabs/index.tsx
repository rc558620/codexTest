/* eslint-disable react/prop-types */
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import './index.less';

export interface SegmentItem {
  readonly key: string;
  readonly label: React.ReactNode;
  readonly disabled?: boolean;
}

export interface SlideSegmentProps {
  readonly value?: string;
  readonly defaultValue?: string; // 非受控默认值
  readonly items: readonly SegmentItem[];
  readonly onChange?: (key: string) => void;
  readonly className?: string;
  readonly style?: CSSProperties;
}

/** 视觉常量：小短条 44px，高度 4px，与截图一致 */
const INDICATOR_W = 24;

const SlideSegment: React.FC<SlideSegmentProps> = memo(
  ({ value, defaultValue, items, onChange, className, style }) => {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const btnRefs = useRef<Array<HTMLButtonElement | null>>([]);

    const firstEnabledKey = useMemo(
      () => items.find((it) => !it.disabled)?.key ?? items[0]?.key ?? '',
      [items],
    );

    const [innerValue, setInnerValue] = useState<string>(defaultValue ?? firstEnabledKey);
    const activeKey = value ?? innerValue;
    const activeIndex = Math.max(
      0,
      items.findIndex((it) => it.key === activeKey),
    );

    const [indicatorLeft, setIndicatorLeft] = useState<number>(0);

    const setBtnRef = useCallback((i: number, el: HTMLButtonElement | null) => {
      btnRefs.current[i] = el;
    }, []);

    const handleSelect = useCallback(
      (key: string) => {
        if (key === activeKey) return;
        if (value === undefined) setInnerValue(key);
        onChange?.(key);
      },
      [activeKey, onChange, value],
    );

    /** 根据实际按钮位置计算指示器 left（不等分、不占满） */
    const updateIndicator = useCallback(() => {
      const root = rootRef.current;
      const btn = btnRefs.current[activeIndex];
      if (!root || !btn) return;

      const rootRect = root.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      const left = btnRect.left - rootRect.left + btnRect.width / 2 - INDICATOR_W / 2;
      setIndicatorLeft(Math.max(0, left));
    }, [activeIndex]);

    useEffect(() => {
      updateIndicator();
      // 视口变化/字体大小变化时刷新
      const onResize = () => updateIndicator();
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }, [updateIndicator]);

    useEffect(() => {
      // items 变化或受控值变化时刷新
      updateIndicator();
    }, [items, activeIndex, updateIndicator]);

    return (
      <div ref={rootRef} className={`slide-segment ${className ?? ''}`} style={style}>
        <ul className="slide-segment__list">
          {items.map((it, i) => {
            const isActive = i === activeIndex;
            return (
              <li key={it.key} className="slide-segment__item-wrap">
                <button
                  ref={(el) => setBtnRef(i, el)}
                  type="button"
                  className={`slide-segment__item${
                    isActive ? ' slide-segment__item--active' : ''
                  }${it.disabled ? ' slide-segment__item--disabled' : ''}`}
                  disabled={it.disabled}
                  onClick={() => !it.disabled && handleSelect(it.key)}
                >
                  <span className="slide-segment__label">{it.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <span
          className="slide-segment__indicator"
          style={{ left: indicatorLeft, width: INDICATOR_W }}
          aria-hidden="true"
        />
      </div>
    );
  },
);

SlideSegment.displayName = 'SlideSegment';
export default SlideSegment;
export type { SegmentItem as SlideSegmentItem };
