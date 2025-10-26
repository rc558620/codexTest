import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import styles from './index.module.less';

import { useViewportVH } from './hooks/useViewportVH';

import { Header } from './components/Header';
import { useNavigate } from 'react-router-dom';
import CommandModal, { CommandModalRef } from './components/Dialogue/components/CommandModal';
import Dialogue from './components/Dialogue';
import Applys from './components/Applys';

interface BasicProps {
  className?: string;
  style?: React.CSSProperties;
}

type TabKey = 'dialogue' | 'apps';

const MobileAIDashboard: React.FC<BasicProps> = ({ className, style }) => {
  const navigate = useNavigate();
  const { keyboardOpen } = useViewportVH();
  const commandRef = useRef<CommandModalRef | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);

  const [activeTab, setActiveTab] = useState<TabKey>('dialogue'); // 默认显示“对话”

  return (
    <div
      ref={rootRef}
      className={classNames(styles['maid-root'], className, { [styles['kbd-open']]: keyboardOpen })}
      style={style}
    >
      <Header
        headerRef={headerRef}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAdd={() => {
          // TODO: 打开新建弹窗/路由
          // commandRef.current?.open?.();
        }}
        onHistory={() => {
          navigate('/AssistantHistory');
        }}
      />

      {/* 内容滑动切换：左=对话；右=AI应用创新空间 */}
      <div className={styles['maid-switch']}>
        <div
          className={classNames(styles['maid-switch__track'], {
            [styles['is-right']]: activeTab === 'apps',
          })}
          role="group"
          aria-roledescription="slide switcher"
          aria-label="内容切换"
        >
          <section className={styles['maid-switch__pane']} aria-hidden={activeTab !== 'dialogue'}>
            <Dialogue />
          </section>

          <section className={styles['maid-switch__pane']} aria-hidden={activeTab !== 'apps'}>
            <Applys />
          </section>
        </div>
      </div>

      <CommandModal ref={commandRef} />
    </div>
  );
};

export default MobileAIDashboard;
