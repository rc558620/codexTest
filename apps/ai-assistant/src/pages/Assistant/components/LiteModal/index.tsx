import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import styles from './index.module.less';

export interface LiteModalProps {
  /** 是否打开 */
  open: boolean;
  /** 关闭回调（遮罩点击 / ESC） */
  onClose?: () => void;

  /** 关闭后是否销毁内容（默认：false） */
  destroyOnClose?: boolean;
  /** 即使关闭也提前渲染一次 */
  forceRender?: boolean;

  /** 点击遮罩是否可关闭（默认：true） */
  maskClosable?: boolean;
  /** 是否允许按 ESC 关闭（默认：true） */
  closeOnEsc?: boolean;

  /** 动画时长（ms，默认：240） */
  motionDuration?: number;

  /** 自定义容器；false 时不走 Portal，直接原地渲染（默认：document.body） */
  getContainer?: HTMLElement | false;

  /** 层级（默认：1000） */
  zIndex?: number;

  /** 样式与类名（支持与 CSS Modules 合并） */
  className?: string; // 内容容器 class
  style?: React.CSSProperties; // 内容容器 style
  maskClassName?: string;
  maskStyle?: React.CSSProperties;
  wrapClassName?: string; // 外层包裹（用于定位）
  wrapStyle?: React.CSSProperties;

  /** 生命周期回调 */
  onAfterOpen?: () => void;
  onAfterClose?: () => void;

  /** 内容 */
  children?: React.ReactNode;
}

/**
 * 极简 Modal：遮罩 + 内容
 */
const LiteModal: React.FC<LiteModalProps> = ({
  open,
  onClose,
  destroyOnClose = false,
  forceRender = false,
  maskClosable = true,
  closeOnEsc = true,
  motionDuration = 240,
  getContainer = typeof document !== 'undefined' ? document.body : false,
  zIndex = 1000,
  className,
  style,
  maskClassName,
  maskStyle,
  wrapClassName,
  wrapStyle,
  onAfterOpen,
  onAfterClose,
  children,
}) => {
  const [mounted, setMounted] = useState<boolean>(open || !!forceRender);
  const [visible, setVisible] = useState<boolean>(open);
  const closeTimerRef = useRef<number | null>(null);

  // 控制挂载 & 动画
  useEffect(() => {
    if (open) {
      if (!mounted) setMounted(true);
      const t = window.requestAnimationFrame(() => {
        setVisible(true);
        onAfterOpen && onAfterOpen();
      });
      return () => window.cancelAnimationFrame(t);
    }

    setVisible(false);
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      if (destroyOnClose) {
        setMounted(false);
      }
      onAfterClose && onAfterClose();
    }, motionDuration) as unknown as number;

    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ESC 关闭
  useEffect(() => {
    if (!closeOnEsc || !open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose && onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeOnEsc, open, onClose]);

  // 阻止滚动穿透
  useEffect(() => {
    if (open) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [open]);

  const handleMaskClick = () => {
    if (maskClosable) onClose && onClose();
  };

  const content =
    mounted || forceRender ? (
      <div
        className={classNames(
          styles['lite-modal-wrap'],
          wrapClassName,
          visible ? styles['lite-modal-wrap--enter'] : styles['lite-modal-wrap--leave'],
        )}
        style={
          {
            zIndex,
            ...(wrapStyle || {}),
            // 用 CSS 变量把动画时长传给样式层
            ['--motion-duration' as any]: `${motionDuration}ms`,
          } satisfies React.CSSProperties
        }
        aria-hidden={!open}
      >
        <div
          className={classNames(styles['lite-modal-mask'], maskClassName, {
            [styles['lite-modal-mask--visible']]: visible,
          })}
          style={maskStyle}
          onClick={handleMaskClick}
        />
        <div
          className={classNames(styles['lite-modal'], className, {
            [styles['lite-modal--visible']]: visible,
          })}
          style={style}
          onClick={(e) => e.stopPropagation()}
        >
          {destroyOnClose ? (open ? children : null) : children}
        </div>
      </div>
    ) : null;

  // Portal 或原地渲染
  const shouldPortal = getContainer !== false && !!getContainer;
  const container = useMemo(() => {
    if (getContainer && getContainer !== document.body) {
      return getContainer;
    }
    return document.body;
  }, [getContainer]);

  return shouldPortal ? ReactDOM.createPortal(content, container!) : content;
};

export default LiteModal;
