import React, { useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import './index.less';

export interface BottomDrawerProps {
  /** 是否打开 */
  open: boolean;
  /** 关闭回调（点击遮罩或外部控制） */
  onClose?: () => void;

  /** 面板高度，支持 px / vh / %，默认 65vh */
  height?: number | string;
  /** 是否显示遮罩，默认 true */
  mask?: boolean;
  /** 点击遮罩是否可关闭，默认 true */
  maskClosable?: boolean;
  /** 关闭时是否销毁子节点，默认 false */
  destroyOnClose?: boolean;

  /** 自定义样式/类名/zIndex */
  className?: string;
  contentClassName?: string;
  style?: React.CSSProperties;
  zIndex?: number;

  /** 打开状态变化回调 */
  afterOpenChange?: (nextOpen: boolean) => void;

  /** 自定义挂载容器，默认 body */
  getContainer?: () => HTMLElement;
  children?: React.ReactNode;
}

const toCssSize = (v?: number | string, fallback = '65vh'): string => {
  if (v == null) return fallback;
  return typeof v === 'number' ? `${v}px` : v;
};

const useLockBodyScroll = (lock: boolean) => {
  const prev = useRef<string | null>(null);
  useEffect(() => {
    const { body } = document;
    if (lock) {
      prev.current = body.style.overflow;
      body.style.overflow = 'hidden';
    } else if (prev.current !== null) {
      body.style.overflow = prev.current;
      prev.current = null;
    }
    return () => {
      if (prev.current !== null) {
        body.style.overflow = prev.current;
        prev.current = null;
      }
    };
  }, [lock]);
};

const BottomDrawer: React.FC<BottomDrawerProps> = ({
  open,
  onClose,
  height,
  mask = true,
  maskClosable = true,
  destroyOnClose = false,
  className,
  contentClassName,
  style,
  zIndex = 1000,
  afterOpenChange,
  getContainer,
  children,
}) => {
  useLockBodyScroll(open);

  useEffect(() => {
    afterOpenChange?.(open);
  }, [open, afterOpenChange]);

  const container = useMemo(() => (getContainer ? getContainer() : document.body), [getContainer]);

  // 不渲染任何内容（destroyOnClose 且未打开）
  if (destroyOnClose && !open) return null;

  const handleMaskClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!mask || !maskClosable) return;
    // 仅当点击在 mask 自身（而不是 panel）时关闭
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  const cssHeight = toCssSize(height);
  const rootCls = ['bdrawer', open ? 'bdrawer--open' : 'bdrawer--close', className]
    .filter(Boolean)
    .join(' ');
  const maskCls = ['bdrawer__mask', open ? 'is-show' : ''].join(' ');
  const panelCls = ['bdrawer__panel', contentClassName].filter(Boolean).join(' ');

  const node = (
    <div
      className={rootCls}
      style={{ zIndex, ...style }}
      aria-hidden={!open}
      aria-modal={open}
      role="dialog"
    >
      {/* 遮罩 */}
      {mask && <div className={maskCls} onClick={handleMaskClick} />}

      {/* 面板（无 header） */}
      <div className={panelCls} style={{ height: cssHeight }}>
        {/* 安全区内边距 + 可滚动内容区 */}
        <div className="bdrawer__scroll">{children}</div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(node, container);
};

BottomDrawer.displayName = 'BottomDrawer';
export default BottomDrawer;
