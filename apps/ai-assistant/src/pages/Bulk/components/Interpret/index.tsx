import React, { useState, forwardRef, useImperativeHandle } from 'react';
import BottomDrawer from '../BottomDrawer';
import WeeklyNewsCard from './components/WeeklyNewsCard';
import styles from './index.module.less';

export interface InterpretRef {
  open: () => void;
  close: () => void;
}

export interface WeeklyNewsItem {
  key: string;
  class: string;
  supplyTitle: string;
  supplyContent: string;
  demandTitle: string;
  demandContent: string;
  costTitle?: string; // ✅ 新增
  costContent?: string; // ✅ 新增
  overviewTitle: string;
  overviewContent: string;
}

interface InterpretProps {
  title?: string; // DataAnalysis.DataTitle
  items: WeeklyNewsItem[]; // 已格式化的数组
}

const Interpret = forwardRef<InterpretRef, InterpretProps>(({ title, items }, ref) => {
  const [open, setOpen] = useState(false);

  useImperativeHandle(
    ref,
    () => ({
      open: () => setOpen(true),
      close: () => setOpen(false),
    }),
    [],
  );

  return (
    <BottomDrawer
      open={open}
      onClose={() => setOpen(false)}
      height="80vh"
      mask
      maskClosable
      destroyOnClose={false}
      contentClassName={styles['my-drawer__content']}
    >
      <div className={styles['interpret-mobile']}>
        <h2 className={styles['interpret-mobile-title']}>{title}</h2>

        <div className={styles['interpret-mobile-content']}>
          {Array.isArray(items) &&
            items.length > 0 &&
            items.map((it, index) => (
              <WeeklyNewsCard
                key={it?.key || `interpret-item-${index}`}
                badge={it.class}
                supplyTitle={it.supplyTitle}
                supplyText={it.supplyContent}
                demandTitle={it.demandTitle}
                demandText={it.demandContent}
                overviewTitle={it.overviewTitle}
                summaryText={it.overviewContent}
                costTitle={it.costTitle}
                costContent={it.costContent}
              />
            ))}
        </div>
      </div>
    </BottomDrawer>
  );
});

Interpret.displayName = 'Interpret';
export default Interpret;
