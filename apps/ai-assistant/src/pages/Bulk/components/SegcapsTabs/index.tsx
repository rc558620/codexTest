// SlideSegment.tsx
import React, { memo } from 'react';
import type { CSSProperties } from 'react';
import './index.less';

export interface SegmentItem {
  key: string;
  label: React.ReactNode;
  disabled?: boolean;
}
export interface SlideSegmentProps {
  value?: string;
  items: readonly SegmentItem[];
  onChange?: (key: string) => void;
  className?: string;
  style?: CSSProperties;
}

const SlideSegment: React.FC<SlideSegmentProps> = memo(
  ({ value, items, onChange, className, style }) => {
    return (
      <div className={`segcaps ${className ?? ''}`} style={style}>
        <ul className="segcaps__list">
          {items.map((it) => {
            const active = value === it.key;
            const disabled = !!it.disabled;
            return (
              <li
                key={it.key}
                className={`segcaps__item${
                  active ? ' segcaps__item--active' : ''
                }${disabled ? ' segcaps__item--disabled' : ''}`}
                role="button"
                aria-pressed={active}
                aria-disabled={disabled}
                tabIndex={disabled ? -1 : 0}
                onClick={() => {
                  if (!disabled) onChange?.(it.key);
                }}
              >
                <span className="segcaps__label">{it.label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  },
);

SlideSegment.displayName = 'SlideSegment';
export default SlideSegment;
export type { SegmentItem as SlideSegmentItem };
