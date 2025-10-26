import React, { memo, useMemo, useState, useCallback, useRef, useEffect } from 'react';
import type { CSSProperties } from 'react';
import './index.less';

export interface PillItem {
  readonly key: string;
  readonly label: React.ReactNode;
  readonly disabled?: boolean;
}

export interface PillSegmentProps {
  readonly value?: string;
  readonly defaultValue?: string;
  readonly items: readonly PillItem[];
  readonly onChange?: (key: string) => void;
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly gap?: number; // 选项间距(px)，默认 24
}

function cx(...p: Array<string | false | undefined>): string {
  return p.filter(Boolean).join(' ');
}

const PillSegment: React.FC<PillSegmentProps> = memo(
  ({ value, defaultValue, items, onChange, className, style, gap = 5 }) => {
    const firstEnabledKey = useMemo(
      () => items.find((it) => !it.disabled)?.key ?? items[0]?.key ?? '',
      [items],
    );

    const [inner, setInner] = useState<string>(defaultValue ?? firstEnabledKey);
    const activeKey = value ?? inner;

    const listRef = useRef<HTMLUListElement | null>(null);
    const btnRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const setBtnRef = useCallback((i: number, el: HTMLButtonElement | null) => {
      btnRefs.current[i] = el;
    }, []);

    const [indicator, setIndicator] = useState<{ x: number; w: number; h: number }>({
      x: 0,
      w: 0,
      h: 0,
    });

    const handleSelect = useCallback(
      (key: string) => {
        if (key === activeKey) return;
        if (value === undefined) setInner(key);
        onChange?.(key);
      },
      [activeKey, onChange, value],
    );

    const updateIndicator = useCallback(() => {
      const idx = items.findIndex((it) => it.key === activeKey);
      const btn = btnRefs.current[idx];
      const list = listRef.current;
      if (!btn || !list) return;
      const listRect = list.getBoundingClientRect();
      const rect = btn.getBoundingClientRect();
      setIndicator({
        x: rect.left - listRect.left,
        w: rect.width,
        h: rect.height,
      });
    }, [activeKey, items]);

    useEffect(() => {
      updateIndicator();
      const onResize = () => updateIndicator();
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }, [updateIndicator]);

    useEffect(() => {
      updateIndicator();
    }, [items, activeKey, updateIndicator]);

    return (
      <div className={cx('pill-seg', className)} style={style}>
        <ul className="pill-seg__list" style={{ columnGap: gap }} ref={listRef}>
          {/* 滑动胶囊背景 */}
          <li
            className="pill-seg__bg"
            aria-hidden="true"
            style={{
              width: indicator.w,
              height: indicator.h,
              transform: `translate(${indicator.x}px, -50%)`,
            }}
          />
          {items.map((it, i) => {
            const isActive = it.key === activeKey;
            return (
              <li key={it.key} className="pill-seg__item-wrap">
                <button
                  ref={(el) => setBtnRef(i, el)}
                  type="button"
                  className={cx(
                    'pill-seg__item',
                    isActive && 'pill-seg__item--active',
                    it.disabled && 'pill-seg__item--disabled',
                  )}
                  disabled={it.disabled}
                  onClick={() => !it.disabled && handleSelect(it.key)}
                >
                  <span className="pill-seg__label">{it.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  },
);

PillSegment.displayName = 'PillSegment';

export default PillSegment;
