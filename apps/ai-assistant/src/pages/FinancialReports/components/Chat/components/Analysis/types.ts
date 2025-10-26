export interface RadarIndicator {
  name: string;
  max: number;
}

export interface RadarSeries {
  /** 例如：2025年中报 */
  name: string;
  /** 对应 indicator 顺序的数值；单位按实际自定义（百分比用数值即可） */
  value: number[];
}

export interface AnalysisBlock {
  title: string; // 一、盈利能力
  summary: string; // 小结行（可选）
  bullets: string[]; // 正文多段
}
export type MetricKey = 'profit' | 'growth' | 'turnover' | 'cash' | 'debt';

export interface MetricItem {
  key: MetricKey;
  title: string; // 主标题：盈利能力
  subtitle: string; // 副标题：加权净资产收益率ROE
  valueBlue: number; // 2025年中报
  valuePurple: number; // 行业均值
}

export interface MetricsPanelProps {
  items: MetricItem[];
  className?: string;
  style?: React.CSSProperties;
  defaultActiveKey?: MetricKey | null; // 默认展开项
  blueColor?: string; // 与雷达图一致
  purpleColor?: string; // 与雷达图一致
  onChange?: (key: MetricKey | null) => void;
}
