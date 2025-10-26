import React, { useState } from 'react';
import RecentConversations from './components/RecentConversations';
import styles from './index.module.less';
import minLogoIcon from '../../../assets/pc/small-logo.png';
import leftAiIcon from '../../../assets/pc/left-ai.png';
import leftKnowledgeIcon from '../../../assets/pc/left-knowledge.png';
import { Action } from '../types';
import classNames from 'classnames';

interface IProps {
  onChangeToMainContent?: (
    action: Action,
    params?: { action: 'history'; content: { id: number; text: string } },
  ) => void;
}

const AiAssistantPage: React.FC<IProps> = ({ onChangeToMainContent }) => {
  const [expandedSections, setExpandedSections] = useState('');

  const toggleSection = (section: Action) => {
    setExpandedSections(section);
    onChangeToMainContent?.(section);
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarWrap}>
        <div className={styles.sidebarHeader}>
          <img src={minLogoIcon} alt="云天化AI Logo" className={styles.logo} />
          <span className={styles.title}> 云天化AI</span>
        </div>
        <button className={styles.newConversationBtn} onClick={() => toggleSection('MainContent')}>
          开启新对话
        </button>
        <div className={styles.sectionMain}>
          <div
            className={classNames(
              styles.sectionHeader,
              expandedSections === 'KnowledgeRepository' ? styles.active : '',
            )}
            onClick={() => toggleSection('KnowledgeRepository')}
          >
            <div>
              <img src={leftKnowledgeIcon} style={{ width: '20px', height: '20px' }} alt="" />
              <span>知识库</span>
            </div>
          </div>
          <div className={styles.section}>
            <div
              className={classNames(
                styles.sectionHeader,
                expandedSections === 'InnovationSpace' ? styles.active : '',
              )}
              onClick={() => toggleSection('InnovationSpace')}
            >
              <div>
                <img src={leftAiIcon} style={{ width: '20px', height: '20px' }} alt="" />
                <span> AI应用创新空间</span>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span> 最近对话</span>
          </div>
          <RecentConversations
            onRecentConversation={(params) =>
              onChangeToMainContent?.('AiRequest', { action: 'history', content: params })
            }
          />
          <div
            className={styles.sectionMore}
            onClick={() => onChangeToMainContent?.('RecentConversations')}
          >
            查看更多&gt;&gt;
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiAssistantPage;
