import React, { useEffect, useRef } from 'react';
import cn from 'classnames';
import styles from './index.module.less';

export type DrawerPlacement = 'right' | 'left' | 'top' | 'bottom';

export interface DrawerProps {
  /** 是否打开 */
  open: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 标题节点 */
  title?: React.ReactNode;
  /** 内容 */
  children?: React.ReactNode;
  /** 抽屉宽度/高度（取决于 placement） */
  size?: number | string;
  /** 抽屉方向 */
  placement?: DrawerPlacement;
  /** 是否展示遮罩 */
  mask?: boolean;
  /** 点击遮罩是否可关闭 */
  maskClosable?: boolean;
  /** 是否允许 ESC 关闭 */
  keyboard?: boolean;
  /** 打开时是否锁定 body 滚动 */
  lockScroll?: boolean;
  /** 自定义类名/样式（外层容器） */
  className?: string;
  style?: React.CSSProperties;
  /** 头部/内容/底部类名，便于覆写 */
  headerClassName?: string;
  bodyClassName?: string;
  footer?: React.ReactNode;
}

/**
 * 通用 Drawer 组件（无依赖，API 类似 antd）
 * - 支持四个方向、遮罩、ESC、点击遮罩关闭、滚动锁定
 * - 支持 className/style 覆盖
 */
const FinancialReportsDrawer: React.FC<DrawerProps> = ({
  open,
  onClose,
  title,
  children,
  size = 720,
  placement = 'right',
  mask = true,
  maskClosable = true,
  keyboard = true,
  lockScroll = true,
  className,
  style,
  headerClassName,
  bodyClassName,
  footer,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // 锁定 body 滚动
  useEffect(() => {
    if (!lockScroll) return;
    if (open) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [open, lockScroll]);

  // ESC 关闭
  useEffect(() => {
    if (!open || !keyboard) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [open, keyboard, onClose]);

  // 尺寸样式
  const panelStyle: React.CSSProperties =
    placement === 'left' || placement === 'right' ? { width: size } : { height: size };

  return (
    <div
      className={cn(styles.wrapper, open && styles.open, className)}
      style={style}
      aria-hidden={!open}
    >
      {mask && (
        <div
          className={cn(styles.mask, open && styles.maskShow)}
          onClick={() => (maskClosable ? onClose() : undefined)}
        />
      )}

      <div
        ref={containerRef}
        className={cn(styles.panel, styles[placement], open && styles.panelShow)}
        style={panelStyle}
        role="dialog"
        aria-modal
      >
        <div className={cn(styles.header, headerClassName)}>
          <div className={styles.title}>{title}</div>
          <button type="button" aria-label="close" className={styles.close} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={cn(styles.body, bodyClassName)}>{children}</div>

        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </div>
    </div>
  );
};

export default FinancialReportsDrawer;
