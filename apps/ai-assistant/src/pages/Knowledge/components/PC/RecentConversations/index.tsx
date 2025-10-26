import React, { useEffect, useState } from 'react';
import { historyList, deleteHistoryById } from '../../../api';
import styles from './index.module.less';
import { EllipsisOutlined, SearchOutlined } from '@yth/icons';
import { message, Modal } from '@yth/ui';

const RecentConversations: React.FC = () => {
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
    Modal.confirm({
      title: '是否删除该对话？',
      content: text,
      cancelText: '取消',
      okText: '确定',
      centered: true,
      async onOk() {
        await deleteHistoryById(id);
        message.info(`已删除该对话`);
        setRecentConversations(recentConversations.filter((e) => e.id !== id));
      },
    });
  };
  return (
    <div className={styles.recentConversations}>
      <div className={styles.title}>历史对话</div>
      <div className={styles.searchBar}>
        <SearchOutlined style={{ fontSize: '16px' }} />
        <input type="text" placeholder="搜索历史对话" className={styles.searchInput} />
      </div>
      <div className={styles.recentDay}>最近七天</div>
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
    </div>
  );
};

export default RecentConversations;
