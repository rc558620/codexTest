import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import './elevate-modal.less';

// ... 省略 import
export interface ElevateModalProps {
  open: boolean;
  onClose?: () => void;

  /** 尺寸控制（默认自适应内容） */
  width?: number | string;
  height?: number | string;
  maxWidth?: number | string;

  /** z-index（默认 1000） */
  zIndex?: number;

  /** 是否渲染到 body，避免祖先 transform 影响定位 */
  portalToBody?: boolean;

  /** 遮罩与交互 */
  mask?: boolean; // 显示遮罩
  maskClosable?: boolean; // 点遮罩关闭
  keyboard?: boolean; // ESC 关闭

  /** 是否在关闭时销毁内容。默认 false（不开启销毁，提高二次开启性能） */
  destroyOnClose?: boolean;

  /** 首次打开再渲染（懒渲染），默认 true */
  lazyMount?: boolean;

  /** 自定义关闭图标（不传则用默认） */
  closeIcon?: React.ReactNode;

  /** 自定义容器 */
  getContainer?: () => HTMLElement;

  /** ARIA */
  ariaLabel?: string;

  children?: React.ReactNode;
}
const ElevateModal: React.FC<ElevateModalProps> = (props) => {
  const {
    open,
    onClose,
    width,
    height,
    maxWidth = '90vw',
    zIndex = 1000,
    portalToBody = true,
    mask = true,
    maskClosable = true,
    keyboard = true,
    destroyOnClose = false,
    lazyMount = true,
    closeIcon,
    getContainer,
    ariaLabel,
    children,
  } = props;

  const [hasEverOpened, setHasEverOpened] = useState<boolean>(!lazyMount);
  useEffect(() => {
    if (open) setHasEverOpened(true);
  }, [open, lazyMount]);
  const shouldMount = destroyOnClose ? open : hasEverOpened;

  const container = useMemo(() => {
    if (getContainer) return getContainer();
    return portalToBody ? document.body : null;
  }, [getContainer, portalToBody]);

  const lastActiveRef = useRef<HTMLElement | null>(null);
  const close = useCallback(() => {
    onClose?.();
  }, [onClose]);

  // ✅ 不再把焦点放到“关闭按钮”，而是放到“面板容器”（避免按钮出现圆圈）
  const panelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (open) {
      lastActiveRef.current = (document.activeElement as HTMLElement) || null;
      // 如需无可见焦点，直接不 focus；若要可达性，可聚焦到面板，但我们取消 outline（见样式）
      requestAnimationFrame(() => panelRef.current?.focus());
    } else if (lastActiveRef.current) {
      lastActiveRef.current.focus?.();
      lastActiveRef.current = null;
    }
  }, [open]);

  // ESC 关闭
  useEffect(() => {
    if (!keyboard) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        close();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [keyboard, open, close]);

  // ❌ 原来放在“遮罩”上的点击
  // const onMaskClick = ...

  // ✅ 改为放在 wrap 上；只有点到 wrap 自身（非面板区域）才关闭
  const onWrapClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!mask || !maskClosable) return;
    if (e.target === e.currentTarget) close();
  };

  const rootCls = ['emodal', open ? 'emodal--open' : 'emodal--close'].join(' ');
  const maskCls = ['emodal__mask', mask ? 'is-show' : 'is-hide'].join(' ');
  const panelStyle: React.CSSProperties = { width, height, maxWidth };

  const defaultCloseIcon = (
    <span className="emodal__close-icon" aria-hidden>
      <svg viewBox="0 0 20 20" width="20" height="20" focusable="false">
        <path
          d="M5 5 L15 15 M15 5 L5 15"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </span>
  );

  const contentNode = (
    <div
      className={rootCls}
      style={{ zIndex }}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      aria-hidden={!open}
    >
      {mask && <div className={maskCls} />}

      {/* ✅ 把点击关闭放到 wrap 上 */}
      <div className="emodal__wrap" onClick={onWrapClick}>
        {/* ✅ 面板可聚焦以承接焦点，但我们 CSS 里会禁用 outline */}
        <div ref={panelRef} className="emodal__panel" style={panelStyle} tabIndex={-1}>
          <button type="button" className="emodal__close" onClick={close} aria-label="关闭">
            <span className="emodal__close-icon">{closeIcon ?? defaultCloseIcon}</span>
          </button>

          <div className="emodal__body">{hasEverOpened ? children : null}</div>
        </div>
      </div>
    </div>
  );

  if (!shouldMount) return null;
  if (portalToBody) return ReactDOM.createPortal(contentNode, container || document.body);
  return contentNode;
};

export default ElevateModal;
