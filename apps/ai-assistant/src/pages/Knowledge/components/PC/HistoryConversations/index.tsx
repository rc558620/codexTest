import React, { useEffect, useState } from 'react';
import { historyList, deleteHistoryById } from '../../../api';
import styles from './index.module.less';
import { EllipsisOutlined } from '@yth/icons';
import modal from 'antd/es/modal';
import { message } from '@yth/ui';

const HistoryConversations: React.FC = () => {
  const [recentConversations, setRecentConversations] = useState<
    Array<{ text: string; id: number }>
  >([]);
  useEffect(() => {
    historyList({
      pageNum: 1,
      pageSize: 10,
      userId: '',
      conversationId: '',
    }).then((res) => {
      setRecentConversations(res.records.map((e) => ({ text: e.question, id: e.id })));
    });
  }, []);
  const selectConversation = (id: number, text: string) => {
    modal.confirm({
      title: '是否删除该对话？',
      content: text,
      cancelText: '取消',
      okText: '确定',
      async onOk() {
        await deleteHistoryById(id);
        message.info(`已删除该对话`);
        setRecentConversations(recentConversations.filter((e) => e.id !== id));
      },
    });
  };
  return (
    <div className={styles.conversationList}>
      {recentConversations.map((conversation, index) => (
        <div
          key={index}
          className={styles.conversationItem}
          onClick={() => selectConversation(conversation.id, conversation.text)}
        >
          <div className={styles.conversationText} title={conversation.text}>
            {conversation.text}
          </div>
          <EllipsisOutlined />
        </div>
      ))}
    </div>
  );
};

export default HistoryConversations;
