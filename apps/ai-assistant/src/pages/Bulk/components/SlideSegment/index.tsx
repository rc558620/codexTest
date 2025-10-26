import React, { useMemo, useRef, useState, useLayoutEffect, useCallback } from 'react';
import classNames from 'classnames';
import './index.less';

export interface SlideOption {
  label: string;
  value: string;
  disabled?: boolean;
}
export interface SlideSegmentProps {
  options: SlideOption[] | [];
  value?: string;
  defaultValue?: string;
  onChange?: (val: string) => void;
  className?: string;
  style?: React.CSSProperties;
  height?: number; // 统一高度
  hPadding?: number; // 左右内边距
}

const SlideSegment: React.FC<SlideSegmentProps> = ({
  options,
  value,
  defaultValue,
  onChange,
  className,
  style,
  height = 42,
  hPadding = 18,
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

  const applySlider = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;

    // 1) 用 props.height 直接写入 CSS 变量，确保 42 生效
    root.style.setProperty('--seg-h', `${height}px`);

    // 2) 定位滑块
    const idx = options.findIndex((o) => o.value === active);
    const target = idx >= 0 ? btnRefs.current[idx] : null;
    if (!target) return;

    const rb = root.getBoundingClientRect();
    const tb = target.getBoundingClientRect();
    root.style.setProperty('--seg-x', `${tb.left - rb.left}px`);
    root.style.setProperty('--seg-w', `${tb.width}px`);
  }, [active, options, height]);

  useLayoutEffect(() => {
    applySlider();
    const ro = new ResizeObserver(() => applySlider());
    if (rootRef.current) ro.observe(rootRef.current);
    btnRefs.current.forEach((el) => el && ro.observe(el));
    return () => ro.disconnect();
  }, [applySlider]);

  return (
    <div
      ref={rootRef}
      className={classNames('slide-seg', className)}
      style={style}
      role="tablist"
      aria-label="区域切换"
    >
      <div className="slide-seg__thumb" aria-hidden />

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
            className={classNames('slide-seg__item', {
              'is-active': isActive,
              'is-disabled': opt.disabled,
            })}
            onClick={() => !opt.disabled && setActive(opt.value)}
            // 高度不再写死，用 CSS 变量统一控制；只保留左右 padding
            style={{ padding: `0 ${hPadding}px` }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

export default SlideSegment;
