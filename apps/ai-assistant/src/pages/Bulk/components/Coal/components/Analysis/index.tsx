// src/pages/Bulk/components/Analysis/index.tsx
import React, { CSSProperties, memo, useMemo } from 'react';
import IconTitle from '../../../IconTitle';
import styles from './index.module.less';
import { cx } from '@/utils/utils';

export interface MajorEventAnalysisProps {
  blocks?: {
    DataTitle?: string;
    WeeklyNews?: {
      Title?: string; // ← 后端：本周要闻
      Date?: string;
      NewsDetail?: Array<{
        Id?: number | string;
        Date?: string;
        Title?: string;
        Content?: string;
      }>;
    };
    FollowItems?: {
      Class?: string; // ← 后端：后续关注
      FollowItems?: Array<{
        Id?: number | string;
        Date?: string;
        Title?: string;
        Content?: string;
      }>;
    };
  };
  verticalMarqueeHeight?: number;
  title?: string; // 兜底标题
  className?: string;
  style?: CSSProperties;
}

const Analysis: React.FC<MajorEventAnalysisProps> = memo(
  ({ blocks, title: titleProp, verticalMarqueeHeight, style, className }) => {
    const vm = useMemo(() => {
      if (!blocks || typeof blocks !== 'object') return null;

      const title = String(blocks?.DataTitle ?? titleProp ?? '');

      // 区块标题改为用后端
      const newsTitle = String(blocks?.WeeklyNews?.Title ?? '');
      const followTitle = String(blocks?.FollowItems?.Class ?? '');

      const range = String(blocks?.WeeklyNews?.Date ?? '');

      const events = Array.isArray(blocks?.WeeklyNews?.NewsDetail)
        ? blocks!.WeeklyNews!.NewsDetail!.map((n) => ({
            headline: String(n?.Title ?? ''),
            detail: n?.Content ? String(n.Content) : undefined,
          }))
        : [];

      const follow = Array.isArray(blocks?.FollowItems?.FollowItems)
        ? blocks!.FollowItems!.FollowItems!.map((f) => ({
            date: String(f?.Date ?? ''),
            text: String(f?.Title ?? ''),
          }))
        : [];

      const half = Math.ceil(follow.length / 2);
      const colA = follow.slice(0, half);
      const colB = follow.slice(half);

      return { title, newsTitle, followTitle, range, events, colA, colB };
    }, [blocks, titleProp]);

    if (!vm) return null;
    return (
      <div className={cx(styles.card, styles['card--panel'], className)} style={style}>
        <div className={styles.head}>
          <IconTitle title={vm.title} />
          <div className={styles.content_ai_right}>内容均由AI生成，仅供参考</div>
        </div>

        <div className={styles['bulk-analysis__card']}>
          {/* 抬头：左“后端给的要闻标题”，右“日期范围” */}
          <div className={styles['bulk-analysis__range-row']}>
            <div className={styles['bulk-analysis__range-title']}>{vm.newsTitle}</div>
            {vm.range && <div className={styles['bulk-analysis__range-date']}>{vm.range}</div>}
          </div>

          {/* 要闻列表 */}
          <div
            className={styles['bulk-analysis__events']}
            style={{ height: verticalMarqueeHeight }}
          >
            {vm?.events?.length > 0 &&
              vm.events.map((row, idx) => (
                <div className={styles['bulk-analysis__event']} key={idx}>
                  <div className={styles['bulk-analysis__event-head']}>{row.headline}</div>
                  {row.detail && (
                    <div className={styles['bulk-analysis__event-detail']}>{row.detail}</div>
                  )}
                </div>
              ))}
          </div>

          {/* 后续关注 */}
          <div className={styles['bulk-analysis__follow']}>
            <div className={styles['bulk-analysis__follow-title']}>{vm.followTitle}：</div>
            <div className={styles['bulk-analysis__follow-body']}>
              <div className={styles['bulk-analysis__follow-grid']}>
                {[vm.colA, vm.colB].map((col, ci) => (
                  <ul className={styles['bulk-analysis__follow-col']} key={ci}>
                    {col.map((it, i) => (
                      <li className={styles['bulk-analysis__follow-item']} key={`${ci}-${i}`}>
                        <div className={styles['bulk-analysis__follow-date']}>
                          {it.date}
                          <span className={styles['bulk-analysis__follow-text']}>{it.text}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

Analysis.displayName = 'Analysis';
export default Analysis;
