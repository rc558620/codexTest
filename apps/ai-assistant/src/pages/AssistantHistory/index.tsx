import React, { useEffect, useMemo, useState } from 'react';
import styles from './index.module.less';

import ConfirmSheet from './components/ConfirmSheet';
import HistoryRow, { HistoryItem } from './components/HistoryRow';

const initialData: HistoryItem[] = [
  { id: 'a1', text: '云天化2025年半年度净利润约27.61亿元，同比下降2.81%', date: '最近七天' },
  { id: 'a2', text: '云天化2025年半年度净利润约27.61亿元，同比下降2.81%', date: '最近七天' },
  { id: 'a3', text: '云天化2025年半年度净利润约27.61亿元，同比下降2.81%', date: '最近七天' },
  { id: 'b1', text: '云天化2025年半年度净利润约27.61亿元，同比下降2.81%', date: '2025.09.12' },
];

function useGrouped(list: HistoryItem[]) {
  return useMemo(() => {
    const map = new Map<string, HistoryItem[]>();
    list.forEach((i) => {
      if (!map.has(i.date)) map.set(i.date, []);
      map.get(i.date)!.push(i);
    });
    return Array.from(map.entries());
  }, [list]);
}

const HistoryPage: React.FC = () => {
  const [data, setData] = useState<HistoryItem[]>(initialData);
  const groups = useGrouped(data);

  const [openId, setOpenId] = useState<string>(''); // 当前展开的 id
  const [confirmId, setConfirmId] = useState<string>(''); // 待确认删除的 id

  // ✅ 点击页面上“除删除按钮外”的任何元素，都关闭展开
  useEffect(() => {
    if (!openId) return;
    const onDocClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      // 注意：这里使用 data-attribute，避免 CSS Modules 哈希带来的选择器失效
      if (el.closest('[data-history-delete="true"]')) return;
      setOpenId('');
    };
    document.addEventListener('click', onDocClick, true); // 捕获阶段
    return () => document.removeEventListener('click', onDocClick, true);
  }, [openId]);

  const askDelete = (id: string) => setConfirmId(id);
  const cancelDelete = () => setConfirmId('');
  const confirmDelete = () => {
    setData((prev) => prev.filter((i) => i.id !== confirmId));
    setOpenId('');
    setConfirmId('');
  };

  return (
    <div className={styles['history-root']}>
      <header className={styles['history-header']}>
        <button
          className={styles['history-back']}
          onClick={() => window.history.back()}
          aria-label="返回"
        >
          ‹
        </button>
        <h1 className={styles['history-title']}>历史对话</h1>
        <button className={`${styles['history-back']} ${styles.visible}`} aria-hidden>
          -
        </button>
      </header>

      <main className={styles['history-body']}>
        {groups.map(([date, items]) => (
          <section className={styles['history-section']} key={date}>
            <h3 className={styles['history-date']}>{date}</h3>
            <ul className={styles['history-list']}>
              {items.map((it) => (
                <HistoryRow
                  key={it.id}
                  item={it}
                  isOpen={openId === it.id}
                  onOpen={setOpenId}
                  onAskDelete={askDelete}
                />
              ))}
            </ul>
          </section>
        ))}
      </main>

      <ConfirmSheet
        open={!!confirmId}
        title="删除后，该对话将不可恢复。确认要删除吗"
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default HistoryPage;
