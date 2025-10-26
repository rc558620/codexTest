import React from 'react';
import styles from './index.module.less';
import RadarCard from './components/RadarCard';
import MetricsPanel from './components/MetricsPanel';
import { MetricItem, AnalysisBlock } from './types';
import { RadarAxesItem, RadarSeriesKV } from './components/RadarCard/types';

export interface GroupFinanceAnalysisProps {
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  metrics: MetricItem[]; // 右侧指标卡列表（按照分组展示）
  paragraphs: AnalysisBlock[]; // 下方文字段落
  RadarCardData: RadarSeriesKV[];
  RadarCardAxes: RadarAxesItem[];
}

/** 页面模块：云天化集团财务分析 */
const GroupFinanceAnalysis: React.FC<GroupFinanceAnalysisProps> = ({
  className,
  style,
  title = '云天化集团财务分析',
  metrics,
  paragraphs,
  RadarCardAxes,
  RadarCardData,
}) => {
  return (
    <section className={`${styles.wrap} ${className ?? ''}`} style={style}>
      <h3 className={styles.pageTitle}>{title}</h3>

      <div className={styles.topRow}>
        {/* 左侧雷达图 */}
        <RadarCard data={RadarCardData} axes={RadarCardAxes} />

        {/* 右侧指标卡 */}
        <MetricsPanel items={metrics} />
      </div>

      {/* 下方文字说明 */}
      <div className={styles.textArea}>
        {paragraphs.map((blk, idx) => (
          <article key={`blk-${idx}`} className={styles.block}>
            <h4 className={styles.blockTitle}>{blk.title}</h4>
            {blk.summary ? <p className={styles.summary}>{blk.summary}</p> : null}
            <ul className={styles.list}>
              {blk.bullets.map((p, i) => (
                <li key={`p-${i}`} className={styles.li}>
                  {p}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
};

export default GroupFinanceAnalysis;
