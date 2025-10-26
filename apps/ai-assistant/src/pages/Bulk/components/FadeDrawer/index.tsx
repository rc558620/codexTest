import React, { useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import './index.less';
import closePc from '@/assets/images/close-pc@2x.png';

export interface BottomDrawerProps {
  open: boolean;
  onClose?: () => void;
  height?: number | string;
  mask?: boolean;
  maskClosable?: boolean;
  destroyOnClose?: boolean;
  className?: string;
  contentClassName?: string;
  style?: React.CSSProperties;
  zIndex?: number;
  afterOpenChange?: (nextOpen: boolean) => void;
  getContainer?: () => HTMLElement;
  children?: React.ReactNode;
}

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

const FadeDrawer: React.FC<BottomDrawerProps> = ({
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

  if (destroyOnClose && !open) return null;

  const handleMaskClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!mask || !maskClosable) return;
    if (e.target === e.currentTarget) onClose?.();
  };

  const rootCls = ['fade-drawer', open ? 'fade-drawer--open' : 'fade-drawer--close', className]
    .filter(Boolean)
    .join(' ');
  const maskCls = ['fade-drawer__mask', open ? 'is-show' : ''].join(' ');
  const panelCls = ['fade-drawer__panel', contentClassName].filter(Boolean).join(' ');

  const node = (
    <div
      className={rootCls}
      style={{ zIndex, ...style }}
      aria-hidden={!open}
      aria-modal={open}
      role="dialog"
    >
      {mask && <div className={maskCls} onClick={handleMaskClick} />}
      <div className={panelCls} style={{ height }}>
        <div className="fade-drawer__content">{children}</div>
        {onClose && (
          <button type="button" className="fade-drawer__close" onClick={onClose} aria-label="关闭">
            <img src={closePc} alt="" />
          </button>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(node, container);
};

FadeDrawer.displayName = 'FadeDrawer';
export default FadeDrawer;
