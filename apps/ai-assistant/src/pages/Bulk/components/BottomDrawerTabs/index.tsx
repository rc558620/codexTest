/* eslint-disable react/prop-types */
import React, { memo, useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
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

/** 视觉常量：小短条 27px */
const INDICATOR_W = 27;

const BottomDrawerTabs: React.FC<SlideSegmentProps> = memo(
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

    /** 指示器 left，初始化给 9 保证首帧“看起来正好对齐” */
    const [indicatorLeft, setIndicatorLeft] = useState<number>(9);

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

    /** 根据按钮位置计算指示器 left（不等分、不占满） */
    const updateIndicator = useCallback(() => {
      const root = rootRef.current;
      const btn = btnRefs.current[activeIndex];
      if (!root || !btn) return;

      const rootRect = root.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      const center = btnRect.left - rootRect.left + btnRect.width / 2;
      const left = center - INDICATOR_W / 2;

      // 关键：四舍五入到整数像素，避免 8.5px 这类“半像素”
      setIndicatorLeft(Math.max(0, Math.round(left)));
    }, [activeIndex]);

    // 用 layoutEffect，避免首帧抖动；监听 resize 保持同步
    useLayoutEffect(() => {
      updateIndicator();
      const onResize = () => updateIndicator();
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }, [updateIndicator]);

    // items 或选中项变化时，同步一次
    useLayoutEffect(() => {
      updateIndicator();
    }, [items, activeIndex, updateIndicator]);

    return (
      <div ref={rootRef} className={`bdtabs ${className ?? ''}`} style={style}>
        <ul className="bdtabs__list">
          {items.map((it, i) => {
            const isActive = i === activeIndex;
            return (
              <li key={it.key} className="bdtabs__item-wrap">
                <button
                  ref={(el) => setBtnRef(i, el)}
                  type="button"
                  className={`bdtabs__item${isActive ? ' bdtabs__item--active' : ''}${
                    it.disabled ? ' bdtabs__item--disabled' : ''
                  }`}
                  disabled={it.disabled}
                  onClick={() => !it.disabled && handleSelect(it.key)}
                >
                  <span className="bdtabs__label">{it.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <span
          className="bdtabs__indicator"
          style={{ left: indicatorLeft, width: INDICATOR_W }}
          aria-hidden="true"
        />
      </div>
    );
  },
);

BottomDrawerTabs.displayName = 'BottomDrawerTabs';
export default BottomDrawerTabs;
export type { SegmentItem as SlideSegmentItem };
