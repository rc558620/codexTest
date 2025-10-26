import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { LineChart, BarChart, RadarChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  MarkPointComponent,
  MarkLineComponent,
  RadarComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import styles from './index.module.less';
import { cx } from '@/utils/utils';

echarts.use([
  LineChart,
  BarChart,
  RadarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  MarkPointComponent,
  MarkLineComponent,
  RadarComponent,
  CanvasRenderer,
]);

interface Props {
  option: echarts.EChartsCoreOption;
  className?: string;
  ariaLabel?: string;
}

const EChart: React.FC<Props> = ({ option, className, ariaLabel }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const inst = useRef<echarts.EChartsType | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current, undefined, { renderer: 'canvas' });
    inst.current = chart;
    const onResize = () => chart.resize();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      chart.dispose();
    };
  }, []);

  useEffect(() => {
    inst.current?.setOption(option, { notMerge: true, lazyUpdate: true });
  }, [option]);

  return (
    <div ref={ref} role="img" aria-label={ariaLabel} className={cx(styles.chart, className)} />
  );
};

export default EChart;
