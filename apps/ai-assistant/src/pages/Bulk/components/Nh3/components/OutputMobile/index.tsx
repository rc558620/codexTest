import React, { useMemo } from 'react';
import MobileTitle from '../../../MobileTitle';
import EChart from '../../../Echart';
import { DATES_OUTPUT, PRICE_SERIES_OUTPUT, WEEKS_OUTPUT, OUTPUT_TABLE } from '../../../../mock';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { fmt } from '@/components/types';
import { buildOutputOption, dirClass, icon, type LineSeries } from './outputOptionMobile';

interface OutputProps {
  title: string;
  dates?: string[]; // ← 父组件传接口 dates
  series?: LineSeries[]; // ← 父组件传接口 series（name/points）
}

/** ------- 表格 -------- */
type WeekKey = (typeof WEEKS_OUTPUT)[number]['key'];
type Row = { key: string; 日期: string } & Record<WeekKey, number> & { wow?: number };

const weekCols: ColumnsType<Row> = WEEKS_OUTPUT.map((w) => ({
  title: (
    <div style={{ textAlign: 'center', lineHeight: 1.2 }}>
      <div>{w.title}</div>
      <div>（{w.range}）</div>
    </div>
  ),
  dataIndex: w.key,
  key: w.key,
  align: 'center' as const,
  width: 110,
  render: (v: number) => fmt(v),
}));

const cols: ColumnsType<Row> = [
  { title: '日期', dataIndex: '日期', width: 50, fixed: 'left', align: 'center' },
  ...weekCols,
  {
    title: '周对比',
    key: 'wow',
    dataIndex: 'wow',
    width: 60,
    align: 'center',
    render: (_, row) => {
      const lastWeek = WEEKS_OUTPUT[WEEKS_OUTPUT.length - 1];
      const prevWeek = WEEKS_OUTPUT[WEEKS_OUTPUT.length - 2];
      const last = row[lastWeek.key];
      const prev = row[prevWeek.key];
      const diff = +(last - prev).toFixed(2);
      // ✅ 修复 “— 0” 双符号：为 0 仅展示 “—”
      return (
        <span className={`delta delta--${dirClass(diff)}`}>
          {diff === 0 ? '—' : `${icon(diff)} ${fmt(Math.abs(diff))}`}
        </span>
      );
    },
  },
];

const OutputMobile: React.FC<OutputProps> = ({
  title,
  dates = DATES_OUTPUT,
  series = PRICE_SERIES_OUTPUT as unknown as LineSeries[],
}) => {
  // 只要 dates 或 series 变化，就重新生成 ECharts 配置
  const option = useMemo(() => buildOutputOption({ dates, baseSeries: series }), [dates, series]);

  // 表格仍用现有 mock（如需也随接口更新，可再加 props 表示）
  const data: Row[] = OUTPUT_TABLE as unknown as Row[];
  return (
    <div className="mobile-box">
      <div className="mobile-box-flex">
        <div className="mobile-box-flex-left">
          <MobileTitle title={title} />
        </div>
        <span className="mobile-box-flex-right">单位：万吨 数据来源：电询</span>
      </div>
      <div className="mobile-box-table">
        <EChart ariaLabel="全国煤炭价格折线图" option={option} className="price-mobile-echart" />
        <Table
          className="table table--compact"
          size="small"
          pagination={false}
          rowKey="key"
          columns={cols}
          dataSource={data}
          scroll={{ x: 'max-content' }}
        />
      </div>
    </div>
  );
};

export default OutputMobile;
