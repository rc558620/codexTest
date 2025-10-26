import React, { useMemo, useState, useRef, useLayoutEffect, useCallback } from 'react';
import classNames from 'classnames';
import './index.less';

export interface OutlineTabOption {
  label: React.ReactNode;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface OutlineTabsProps {
  options: OutlineTabOption[];
  value?: string; // 受控
  defaultValue?: string; // 非受控（不传默认第一项）
  onChange?: (val: string) => void;
  className?: string;
  style?: React.CSSProperties;

  /** 单个按钮高度（px） */
  height?: number; // 默认 56
  /** 下划线宽度（px） */
  barWidth?: number; // 默认 42
  /** 按钮水平间距（px） */
  gap?: number; // 默认 24
}

const OutlineTabs: React.FC<OutlineTabsProps> = ({
  options,
  value,
  defaultValue,
  onChange,
  className,
  style,
  height = 56,
  barWidth = 42,
  gap = 24,
}) => {
  const first = useMemo(() => options[0]?.value ?? '', [options]);
  const init = value ?? defaultValue ?? first;
  const [inner, setInner] = useState(init);
  const active = value ?? inner;

  const rootRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const setActive = useCallback(
    (v: string) => {
      if (value === undefined) setInner(v);
      onChange?.(v);
    },
    [value, onChange],
  );

  const applyBar = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;

    // 写入尺寸变量
    root.style.setProperty('--ot-height', `${height}px`);
    root.style.setProperty('--ot-gap', `${gap}px`);
    root.style.setProperty('--ot-bar-w', `${barWidth}px`);

    const idx = options.findIndex((o) => o.value === active);
    const btn = idx >= 0 ? btnRefs.current[idx] : null;
    if (!btn) return;

    const rb = root.getBoundingClientRect();
    const bb = btn.getBoundingClientRect();

    const x = bb.left - rb.left + (bb.width - barWidth) / 2;
    root.style.setProperty('--ot-bar-x', `${x}px`);
  }, [active, options, height, barWidth, gap]);

  useLayoutEffect(() => {
    applyBar();
    const ro = new ResizeObserver(() => applyBar());
    if (rootRef.current) ro.observe(rootRef.current);
    btnRefs.current.forEach((el) => el && ro.observe(el));
    return () => ro.disconnect();
  }, [applyBar]);

  return (
    <div
      ref={rootRef}
      className={classNames('otabs', className)}
      style={style}
      role="tablist"
      aria-label="业务品类切换"
    >
      {/* 动画下划线 */}
      <span className="otabs__bar" aria-hidden />

      {options.map((opt, i) => {
        const isActive = opt.value === active;
        return (
          <button
            key={opt.value}
            ref={(el) => {
              btnRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            disabled={opt.disabled}
            className={classNames('otabs__btn', {
              'is-active': isActive,
              'is-disabled': opt.disabled,
            })}
            onClick={() => !opt.disabled && setActive(opt.value)}
          >
            {opt.icon && <span className="otabs__icon">{opt.icon}</span>}
            <span className="otabs__label">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default OutlineTabs;
