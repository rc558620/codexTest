import React, { useState } from 'react';
import styles from './index.module.less';

import { Action } from '../types';
import AiInput, { AiInputAction, AiInputActionEnum, AiInputParams } from '../AiInput';
import { message } from '@yth/ui';

interface KnowledgeRepositoryAskProps {
  onChangeToMainContent?: (action: Action, params?: { content?: string; action: string }) => void;
}

const KnowledgeRepositoryAsk: React.FC<KnowledgeRepositoryAskProps> = ({
  onChangeToMainContent,
}) => {
  const [renderQuestions] = useState<React.ReactNode>(null);

  const onChangeInput = (action: AiInputAction, config?: AiInputParams) => {
    if (action !== AiInputActionEnum.InputAnswer) {
      return;
    }
    if (!config?.text?.trim()) {
      message.error('请输入问题');
      return;
    }
    onChangeToMainContent?.('AiRequest', { content: config.text, action });
  };

  // 右侧模态框
  const [open, setOpen] = useState(false);
  console.log(open);

  return (
    <div className={styles.knowledgeContent}>
      <div className={styles.aiAssistantSection}>
        <h1 className={styles.assistantTitle}>知识库问答</h1>
        <p className={styles.assistantDescription}>支持最多引用5个知识库用于问答</p>
        <AiInput renderQuestions={renderQuestions} onChange={onChangeInput} />
        <div className={styles.suggestTitle}>
          <span>引用的知识库</span>
          <div className={styles.suggestMore} onClick={() => setOpen(true)}>
            +添加知识库
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeRepositoryAsk;
