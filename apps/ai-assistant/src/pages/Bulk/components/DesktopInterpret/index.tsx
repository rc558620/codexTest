import React, { useState, forwardRef, useImperativeHandle } from 'react';
import WeeklyNewsCard from './components/WeeklyNewsCard';
import FadeDrawer from '../FadeDrawer';
import styles from './index.module.less';

export interface DesktopInterpretRef {
  open: () => void;
  close: () => void;
}

export interface WeeklyNewsItem {
  key: string;
  className: string;
  supplyTitle: string;
  supplyContent: string;
  demandTitle: string;
  demandContent: string;
  costTitle?: string; // ✅ 新增
  costContent?: string; // ✅ 新增
  overviewTitle: string;
  overviewContent: string;
}

interface DesktopInterpretProps {
  title?: string; // DataAnalysis.DataTitle
  items: WeeklyNewsItem[]; // 已格式化的数组
}

const DesktopInterpret = forwardRef<DesktopInterpretRef, DesktopInterpretProps>(
  ({ title, items }, ref) => {
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
      <FadeDrawer
        open={open}
        onClose={() => setOpen(false)}
        mask
        maskClosable
        destroyOnClose={false}
        contentClassName={styles['interpret-desktop-drawer__content']}
      >
        <div className={styles['interpret-desktop']}>
          <h2 className={styles['interpret-desktop-title']}>{title}</h2>
          <div className={styles['interpret-desktop-content']}>
            {Array.isArray(items) &&
              items.map((it) => (
                <WeeklyNewsCard
                  key={it.key}
                  badge={it.className}
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
      </FadeDrawer>
    );
  },
);

DesktopInterpret.displayName = 'DesktopInterpret';
export default DesktopInterpret;
