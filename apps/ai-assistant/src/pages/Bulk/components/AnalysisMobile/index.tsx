import React, { memo, useMemo } from 'react';
import type { CSSProperties } from 'react';
import MobileTitle from '../MobileTitle';
import styles from './index.module.less';

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
  title?: string; // 兜底标题
  className?: string;
  style?: CSSProperties;
}

const MajorEventAnalysis: React.FC<MajorEventAnalysisProps> = memo(
  ({ blocks, title: titleProp, className, style }) => {
    console.log('blocks', blocks);
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
      <section className={[styles.bea, className].filter(Boolean).join(' ')} style={style}>
        <div className={styles.bea__header}>
          <MobileTitle title={vm.title} tip="内容均由AI生成，仅供参考" />
        </div>

        <div className={styles.bea_box}>
          <div className={styles.bea__card}>
            {/* 抬头：左“后端给的要闻标题”，右“日期范围” */}
            <div className={styles.bea__range_row}>
              <div className={styles.bea__range_title}>{vm.newsTitle}</div>
              {vm.range && <div className={styles.bea__range_date}>{vm.range}</div>}
            </div>

            {/* 要闻列表 */}
            <div className={styles.bea__events}>
              {vm.events.map((ev, i) => (
                <div className={styles.bea__event} key={`bea-event-${i}`}>
                  <div className={styles.bea__event_head}>{ev.headline}</div>
                  {ev.detail && <div className={styles.bea__event_detail}>{ev.detail}</div>}
                </div>
              ))}
            </div>

            {/* 后续关注（标题条用后端字段；样式里有底色；日期在上、文本在下） */}
            <div className={styles.bea__follow}>
              <div className={styles.bea__follow_title}>{vm.followTitle}：</div>
              <div className={styles.bea__follow_body}>
                <div className={styles.bea__follow_grid}>
                  {[vm.colA, vm.colB].map((col, ci) => (
                    <ul className={styles.bea__follow_col} key={`bea-follow-col-${ci}`}>
                      {col.map((it, i) => (
                        <li className={styles.bea__follow_item} key={`bea-follow-item-${ci}-${i}`}>
                          <div className={styles.bea__follow_date}>{it.date}</div>
                          <div className={styles.bea__follow_text}>{it.text}</div>
                        </li>
                      ))}
                    </ul>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  },
);

MajorEventAnalysis.displayName = 'MajorEventAnalysis';
export default MajorEventAnalysis;
