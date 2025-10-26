// RadarCard.tsx
import React, { useMemo } from 'react';
import styles from './index.module.less';
import { buildRadarOption, type RadarSeriesKV, type RadarAxesItem } from './types';
import EChart from '../../../Echarts';

export interface RadarCardProps {
  className?: string;
  style?: React.CSSProperties;
  data?: RadarSeriesKV[]; // 父组件可传
  axes?: RadarAxesItem[]; // 父组件可传（可选）
}

const RadarCard: React.FC<RadarCardProps> = ({ className, style, data, axes }) => {
  const option = useMemo(() => buildRadarOption(undefined, data, axes), [data, axes]);
  return (
    <div className={`${styles.card} ${className ?? ''}`} style={style}>
      <EChart option={option} ariaLabel="财务指标雷达图" className={styles.radarEcharts} />
    </div>
  );
};

export default RadarCard;
