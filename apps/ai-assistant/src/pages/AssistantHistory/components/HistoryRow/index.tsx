import React from 'react';
import classNames from 'classnames';
import { useLongPress } from '@/pages/Assistant/hooks/useLongPress';
import styles from '../../index.module.less';

export interface HistoryItem {
  id: string;
  text: string;
  date: string;
}

const TrashIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
    <path
      d="M9 3h6l1 2h4v2H4V5h4l1-2Zm-3 6h2v8H6V9Zm4 0h2v8h-2V9Zm4 0h2v8h-2V9Zm-7 12h10a2 2 0 0 0 2-2V7H5v12a2 2 0 0 0 2 2Z"
      fill="currentColor"
    />
  </svg>
);

interface Props {
  item: HistoryItem;
  isOpen: boolean;
  onOpen: (id: string) => void; // 传 id 打开，传 '' 关闭
  onAskDelete: (id: string) => void; // 打开确认
}

const HistoryRow: React.FC<Props> = ({ item, isOpen, onOpen, onAskDelete }) => {
  const { bind } = useLongPress(() => onOpen(item.id));

  return (
    <li className={classNames(styles['history-item'], { [styles['is-open']]: isOpen })} {...bind}>
      {/* 删除按钮放在“下层”，由气泡遮挡；长按时气泡左滑露出它 */}
      <button
        className={styles['history-item__delete']}
        data-history-delete="true"
        aria-label="删除"
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onAskDelete(item.id);
        }}
      >
        <TrashIcon />
      </button>

      <div
        className={styles['history-item__bubble']}
        onClick={() => isOpen && onOpen('')} // 点击气泡也能收起
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (isOpen) onOpen('');
          }
        }}
      >
        <span className={styles['history-item__text']}>{item.text}</span>
      </div>
    </li>
  );
};

export default HistoryRow;
