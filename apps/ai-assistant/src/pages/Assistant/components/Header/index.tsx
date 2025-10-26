import React from 'react';
import classNames from 'classnames';
import styles from '../../index.module.less';

import Assistant_dh from '@/assets/images/Assistant/Assistant-dh@2x.png';
import Assistant_application from '@/assets/images/Assistant/Assistant-application@2x.png';
import Assistant_jia from '@/assets/images/Assistant/Assistant-jia@2x.png';
import Assistant_history from '@/assets/images/Assistant/Assistant-history@2x.png';

type TabKey = 'dialogue' | 'apps';

export interface HeaderProps {
  className?: string;
  style?: React.CSSProperties;
  headerRef?: React.Ref<HTMLDivElement>;
  onAdd?: () => void;
  onHistory?: () => void;
  /** 当前激活的标签：对话 | AI应用 */
  activeTab: TabKey;
  /** 标签切换回调 */
  onTabChange?: (tab: TabKey) => void;
}

export const Header: React.FC<HeaderProps> = ({
  className,
  style,
  headerRef,
  onAdd,
  onHistory,
  activeTab,
  onTabChange,
}) => (
  <div ref={headerRef} className={classNames(styles['maid-header'], className)} style={style}>
    <div className={styles['maid-header__left']}>
      <button
        type="button"
        className={classNames(styles['maid-tab'], styles['maid-header__back'], {
          [styles['is-active']]: activeTab === 'dialogue',
          [styles['is-inactive']]: activeTab !== 'dialogue',
        })}
        aria-pressed={activeTab === 'dialogue'}
        onClick={() => onTabChange?.('dialogue')}
      >
        <img className={styles['maid-dh']} src={Assistant_dh} alt="" /> 对话
      </button>

      <button
        type="button"
        className={classNames(styles['maid-tab'], styles['maid-header__title'], {
          [styles['is-active']]: activeTab === 'apps',
          [styles['is-inactive']]: activeTab !== 'apps',
        })}
        aria-pressed={activeTab === 'apps'}
        onClick={() => onTabChange?.('apps')}
      >
        <img className={styles['maid-application']} src={Assistant_application} alt="" />
        AI应用创新空间
      </button>
    </div>

    <div className={styles['maid-header__actions']} aria-label="actions">
      <button className={styles.iconbtn} aria-label="add" onClick={onAdd}>
        <img className={styles['maid-jia']} src={Assistant_jia} alt="新建" />
      </button>
      <button className={styles.iconbtn} aria-label="history" onClick={onHistory}>
        <img className={styles['maid-history']} src={Assistant_history} alt="历史记录" />
      </button>
    </div>
  </div>
);
