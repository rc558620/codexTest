// src/pages/Bulk/components/Price/index.tsx
import React, { useMemo, useRef } from 'react';
import EChart from '../../../Echart';
import { DATES_SALES_SW, SALES_STACK_SW, SALES_TABLE_SW } from '../../../../mock';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { fmt } from '@/components/types';
import { useFullscreen } from '@/utils/fullscreen';
import IconTitle from '../../../IconTitle';
import { FullscreenOutlined } from '@yth/icons';

import {
  arrow,
  buildSalesStackOption,
  DEFAULT_SALES_COLOR,
  dirClass,
  type StackBarSeries,
} from './salesStackOption';

interface SalesProps {
  title: string;
  dates?: string[];
  series?: StackBarSeries[]; // ← 接口数据（堆叠）
  colors?: Record<string, string>; // ← 可覆写颜色
  order?: string[]; // ← 可指定堆叠顺序（从下到上）
  gridBg?: string; // ← 背景色
  barWidth?: number | string; // ← 柱宽
  barCategoryGap?: number | string; // ← 类目间距
  tableRows?: Row[]; // ← 可选：表格数据也可外部传
}

interface Row {
  key: string;
  日期: string;
  云南解化: number;
  四川泸天化: number;
  广安玖源: number;
  重庆建峰: number;
  云南越聚: number;
}

const cols: ColumnsType<Row> = [
  { title: '日期', dataIndex: '日期', width: 120, fixed: 'left', align: 'center' },
  { title: '云南解化', dataIndex: '云南解化', align: 'center', render: (v) => fmt(v) },
  { title: '四川泸天化', dataIndex: '四川泸天化', align: 'center', render: (v) => fmt(v) },
  { title: '广安玖源', dataIndex: '广安玖源', align: 'center', render: (v) => fmt(v) },
  { title: '重庆建峰', dataIndex: '重庆建峰', align: 'center', render: (v) => fmt(v) },
  { title: '云南越聚', dataIndex: '云南越聚', align: 'center', render: (v) => fmt(v) },
];

const Sales: React.FC<SalesProps> = ({
  title,
  dates = DATES_SALES_SW,
  series = SALES_STACK_SW as unknown as StackBarSeries[],
  colors = DEFAULT_SALES_COLOR,
  order = ['云南解化', '四川泸天化', '广安玖源', '重庆建峰', '云南越聚'],
  gridBg = '#ffffff',
  barWidth = 18,
  barCategoryGap = '42%',
  tableRows = SALES_TABLE_SW as unknown as Row[],
}) => {
  // 1) 生成 echarts option（只依赖 props）
  const option = useMemo(
    () =>
      buildSalesStackOption({
        dates,
        stackSeries: series,
        colors,
        order,
        gridBg,
        barWidth,
        barCategoryGap,
      }),
    [dates, series, colors, order, gridBg, barWidth, barCategoryGap],
  );

  // 2) 表格/周对比（保持你原有逻辑）
  const data = tableRows;
  const prev = data[0];
  const last = data[1];
  const diff: Record<keyof Row, number> = {
    key: 0,
    日期: 0,
    云南解化: last.云南解化 - prev.云南解化,
    四川泸天化: last.四川泸天化 - prev.四川泸天化,
    广安玖源: last.广安玖源 - prev.广安玖源,
    重庆建峰: last.重庆建峰 - prev.重庆建峰,
    云南越聚: last.云南越聚 - prev.云南越聚,
  };

  const containerRef = useRef<HTMLDivElement | null>(null);
  const { toggleFullscreen } = useFullscreen(containerRef);

  return (
    <div ref={containerRef} className="card card--panel">
      <div className="card__head">
        <IconTitle title={title} />
        <div className="card__meta">
          <div className="card__meta_item">
            <span className="unit">单位：吨/天 数据来源：电询</span>
            <FullscreenOutlined className="icon-fullscreen" onClick={toggleFullscreen} />
          </div>
        </div>
      </div>

      <div className="card__box">
        {/* 若你的 <EChart> 封装没有监听 option 变化，可加 key 强制重建 */}
        {/* <EChart key={dates.at(-1)} ... /> */}
        <EChart ariaLabel="西南液氨主要厂家外销量" option={option} className="nh3_price" />

        <Table
          className="table table--compact"
          size="small"
          pagination={false}
          rowKey="key"
          columns={cols}
          dataSource={data}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} align="center" className="summary-cell-hb-bg">
                  <span className="hb_color">周对比</span>
                </Table.Summary.Cell>
                {(['云南解化', '四川泸天化', '广安玖源', '重庆建峰', '云南越聚'] as const).map(
                  (k, i) => (
                    <Table.Summary.Cell
                      key={k}
                      index={i + 1}
                      align="center"
                      className="summary-cell-hb-bg"
                    >
                      <span className={`delta delta--${dirClass(diff[k])}`}>
                        {diff[k] === 0 ? (
                          '—'
                        ) : (
                          <>
                            <>{arrow(diff[k])}</> {fmt(Math.abs(diff[k]))}
                          </>
                        )}
                      </span>
                    </Table.Summary.Cell>
                  ),
                )}
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </div>
    </div>
  );
};

export default Sales;
