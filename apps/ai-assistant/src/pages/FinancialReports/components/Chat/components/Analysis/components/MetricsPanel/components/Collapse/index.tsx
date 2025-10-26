import { useSmoothCollapse } from '@/pages/FinancialReports/hooks/useSmoothCollapse';
import React, { useRef } from 'react';

export interface CollapseProps {
  open: boolean;
  className?: string;
  style?: React.CSSProperties;
  durationExpand?: number;
  durationCollapse?: number;
  easing?: string;
  children: React.ReactNode;
}

/** 只负责动画；视觉样式由传入的 className（你的 .collapse）控制 */
const Collapse: React.FC<CollapseProps> = ({
  open,
  className,
  style,
  durationExpand,
  durationCollapse,
  easing,
  children,
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useSmoothCollapse(wrapRef, innerRef, { expand: open, durationExpand, durationCollapse, easing });

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{
        height: 0,
        opacity: 0,
        overflow: 'hidden',
        willChange: 'height, opacity',
        transform: 'translateZ(0)',
        contain: 'layout paint',
        ...style,
      }}
      aria-hidden={!open}
    >
      <div ref={innerRef}>{children}</div>
    </div>
  );
};

export default Collapse;
