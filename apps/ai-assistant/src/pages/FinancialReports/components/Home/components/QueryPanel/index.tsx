import React, { useMemo, useState } from 'react';
import cn from 'classnames';
import styles from './index.module.less';
import { safeStr } from '@/utils/utils.ts';
import arrow from '@/assets/images/FinancialReports/arrow@2x.png';
import Datasets from '@/assets/images/FinancialReports/Dataset@2x.png';
import look from '@/assets/images/FinancialReports/lookB.svg';
import send from '@/assets/images/FinancialReports/send@2x.png';

export interface QueryPanelProps {
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  openDataset?: () => void;
}

const KPI_CANDIDATES = ['流动资产', '非流动资产', '营业收入', '现金'] as const;
const DIM_CANDIDATES = ['日期', '公司'] as const;

const QueryPanel: React.FC<QueryPanelProps> = ({
  className,
  style,
  title = '已选数据集： 云天化财务主表',
  openDataset,
}) => {
  const [value, setValue] = useState('');

  // ✅ 筛选区状态（mock）
  const [kpi, setKpi] = useState<string>('流动资产'); // 单选
  const [dims, setDims] = useState<string[]>(['日期', '公司']); // 多选高亮（默认两项）

  const toggleDim = (d: string) => {
    setDims((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  };

  const onSubmit = () => {
    if (!value.trim()) return;
    // TODO: 触发查询
    console.log('query', { kpi, dims, q: value.trim() });
  };

  // 用于占位提示
  const placeholder = useMemo(() => {
    const d = dims.length ? dims.join('、') : '请选择维度';
    return `已选择指标「${kpi}」维度「${d}」，现在可以提问…`;
  }, [kpi, dims]);

  return (
    <div className={cn(styles.panel, className)} style={style}>
      {/* 头部（渐变） */}
      <div className={styles.header}>
        <div className={styles.dataset}>
          <span className={styles.title}>{safeStr(title)}</span>
          <img className={styles.datasets} src={Datasets} alt="" />
          <img className={styles.datasets} src={look} alt="" onClick={() => openDataset?.()} />
        </div>
        <img className={styles.tip} src={arrow} alt="" />
      </div>

      {/* ✅ 筛选区（关键指标 & 分析维度） */}
      <div className={styles.filters}>
        {/* 关键指标 */}
        <div className={styles.filterRow}>
          <span className={styles.label}>关键指标</span>
          <div className={styles.chips}>
            {KPI_CANDIDATES.map((name) => (
              <button
                key={name}
                type="button"
                className={cn(styles.chip, styles.chipBlue, kpi === name && styles.chipBlueActive)}
                onClick={() => setKpi(name)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* 分析维度 */}
        <div className={styles.filterRow}>
          <span className={styles.label}>分析维度</span>
          <div className={styles.chips}>
            {DIM_CANDIDATES.map((name) => {
              const active = dims.includes(name);
              return (
                <button
                  key={name}
                  type="button"
                  className={cn(styles.chip, styles.chipAmber, active && styles.chipAmberActive)}
                  onClick={() => toggleDim(name)}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 提问区 */}
      <div className={styles.body}>
        <textarea
          className={styles.input}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={800}
        />
        <button className={styles.send} onClick={onSubmit} disabled={!value.trim()}>
          <img className={styles.sends} src={send} alt="" />
        </button>
      </div>
    </div>
  );
};

export default QueryPanel;
