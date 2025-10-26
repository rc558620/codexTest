import React, { useImperativeHandle, useState, forwardRef } from 'react';
import classNames from 'classnames';
import LiteModal from '../../../LiteModal';
import styles from './index.module.less';

export interface CommandModalRef {
  open: () => void;
  close: () => void;
  toggle: () => void;
  /** 如果需要外部完全控制，也可以直接设定布尔值 */
  setOpen: (next: boolean) => void;
}

export interface CommandModalProps {
  /** 初始是否打开（默认 false） */
  defaultOpen?: boolean;
  /** 打开状态变化回调（可选） */
  onOpenChange?: (open: boolean) => void;
}

const items = ['今日集团要闻', '我的公休假', '帮我查询某人的联系方式'];

const CommandModal = forwardRef<CommandModalRef, CommandModalProps>(
  ({ defaultOpen = false, onOpenChange }, ref) => {
    const [open, setOpen] = useState<boolean>(defaultOpen);

    useImperativeHandle(
      ref,
      () => ({
        open: () => {
          setOpen(true);
          onOpenChange?.(true);
        },
        close: () => {
          setOpen(false);
          onOpenChange?.(false);
        },
        toggle: () => {
          setOpen((prev) => {
            const next = !prev;
            onOpenChange?.(next);
            return next;
          });
        },
        setOpen: (next: boolean) => {
          setOpen(next);
          onOpenChange?.(next);
        },
      }),
      [onOpenChange],
    );

    return (
      <LiteModal
        open={open}
        onClose={() => {
          setOpen(false);
          onOpenChange?.(false);
        }}
        motionDuration={240}
        maskClosable
        closeOnEsc
        destroyOnClose
        zIndex={1200}
        className={styles['command-modal']}
        style={{ padding: 16, minWidth: 300 }}
      >
        <section className={classNames(styles['qc-wrap'])} aria-label="quick-commands">
          <h3 className={styles['qc-title']}>随身问令，你来说我照办</h3>

          <div className={styles['qc-list']}>
            {items.map((t) => (
              <button key={t} type="button" className={styles['qc-chip']} aria-label={t}>
                <span className={styles['qc-chip__txt']}>{t}</span>
              </button>
            ))}
          </div>
        </section>
      </LiteModal>
    );
  },
);

CommandModal.displayName = 'CommandModal';

export default CommandModal;
