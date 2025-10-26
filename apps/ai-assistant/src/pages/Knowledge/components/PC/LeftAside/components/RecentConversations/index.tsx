import React, { useEffect, useState } from 'react';
import { historyList } from '../../../../../api';
import styles from './index.module.less';

interface IProps {
  onRecentConversation: (params: { id: number; text: string }) => void;
}

const RecentConversations: React.FC<IProps> = ({ onRecentConversation }) => {
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
    onRecentConversation({ id, text });
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
          {/* <EllipsisOutlined /> */}
        </div>
      ))}
    </div>
  );
};

export default RecentConversations;
