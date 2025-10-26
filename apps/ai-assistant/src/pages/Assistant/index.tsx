import React, { useRef, useState, useCallback, memo } from 'react';
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

// 通过 React.memo 避免在父组件切换 tab 时无谓重渲染
const MemoDialogue = memo(Dialogue);
const MemoApplys = memo(Applys);

const MobileAIDashboard: React.FC<BasicProps> = ({ className, style }) => {
  const navigate = useNavigate();
  const { keyboardOpen } = useViewportVH();
  const commandRef = useRef<CommandModalRef | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);

  const [activeTab, setActiveTab] = useState<TabKey>('dialogue'); // 默认显示“对话”

  // 稳定的回调，确保 MemoDialogue 的 props 引用不变，从而不重复渲染
  const openCommand = useCallback(() => {
    commandRef.current?.open();
  }, []);

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
        onAdd={() => {}}
        onHistory={() => {
          navigate('/AssistantHistory');
        }}
      />

      {/* 始终挂载两块内容；通过 hidden / aria-hidden 控制可见性，实现“带缓存” */}
      <section
        role="tabpanel"
        aria-labelledby="tab-dialogue"
        aria-hidden={activeTab !== 'dialogue'}
        hidden={activeTab !== 'dialogue'}
      >
        <MemoDialogue openCommand={openCommand} />
      </section>

      <section
        role="tabpanel"
        aria-labelledby="tab-apps"
        aria-hidden={activeTab !== 'apps'}
        hidden={activeTab !== 'apps'}
      >
        <MemoApplys />
      </section>

      {/* 内容滑动切换：左=对话；右=AI应用创新空间（保留原注释，未来可能启用） */}
      {/* <div className={styles['maid-switch']}>
        <div
          className={classNames(styles['maid-switch__track'], {
            [styles['is-right']]: activeTab === 'apps',
          })}
          role="group"
          aria-roledescription="slide switcher"
          aria-label="内容切换"
        >
          <section className={styles['maid-switch__pane']} aria-hidden={activeTab !== 'dialogue'}>
            <Dialogue openCommand={() => commandRef.current?.open()} />
          </section>

          <section className={styles['maid-switch__pane']} aria-hidden={activeTab !== 'apps'}>
            <Applys />
          </section>
        </div>
      </div> */}

      <CommandModal ref={commandRef} />
    </div>
  );
};

export default MobileAIDashboard;
