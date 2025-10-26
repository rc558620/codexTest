import React from 'react';
import classNames from 'classnames';
import styles from './index.module.less';

interface Props {
  open: boolean;
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmSheet: React.FC<Props> = ({ open, title, onCancel, onConfirm }) => {
  return (
    <div className={classNames(styles['hs-mask'], { [styles.open]: open })} aria-hidden={!open}>
      <div className={styles['hs-backdrop']} onClick={onCancel} />
      <section
        className={classNames(styles['hs-sheet'], { [styles.open]: open })}
        role="dialog"
        aria-modal="true"
        aria-label="确认删除"
      >
        <h3 className={styles['hs-title']}>{title}</h3>
        <div className={styles['hs-actions']}>
          <button
            className={classNames(styles['hs-btn'], styles['hs-btn--cancel'])}
            onClick={onCancel}
          >
            取消
          </button>
          <button
            className={classNames(styles['hs-btn'], styles['hs-btn--danger'])}
            onClick={onConfirm}
          >
            删除
          </button>
        </div>
      </section>
    </div>
  );
};

export default ConfirmSheet;
