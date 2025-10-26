// src/pages/Bulk/components/Price/index.tsx
import React, { useMemo, useRef } from 'react';
import EChart from '../../../Echart';
import { DATES_SULFUR, PRICE_SERIES_SULFUR, TABLE_ROWS_SULFUR } from '../../../../mock';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { fmt } from '@/components/types';
import { useFullscreen } from '@/utils/fullscreen';
import IconTitle from '../../../IconTitle';
import { FullscreenOutlined } from '@yth/icons';

import { buildSulfurOption, getDirIcon, toClass, type LineSeries } from './sulfurOption';

interface SpotPriceProps {
  title: string;
  dates?: string[];
  series?: LineSeries[]; // 3 条曲线
  tableRows?: Row[]; // 表格两行
}

interface Row {
  key: string;
  日期: string;
  港口库存: number;
  CFR中国现货高端价_$: number;
  镇江港固体现货价: number;
}

const cols: ColumnsType<Row> = [
  { title: '日期', dataIndex: '日期', width: 120, fixed: 'left', align: 'center' },
  { title: '港口库存', dataIndex: '港口库存', align: 'center', render: (v) => fmt(v) },
  {
    title: 'CFR中国现货高端价/$',
    dataIndex: 'CFR中国现货高端价_$',
    align: 'center',
    render: (v) => fmt(v),
  },
  {
    title: '镇江港固体现货价',
    dataIndex: '镇江港固体现货价',
    align: 'center',
    render: (v) => fmt(v),
  },
];

const SpotPrice: React.FC<SpotPriceProps> = ({
  title,
  dates = DATES_SULFUR,
  series = PRICE_SERIES_SULFUR as unknown as LineSeries[],
  tableRows = TABLE_ROWS_SULFUR as unknown as Row[],
}) => {
  // 1) ECharts 完全由 props 驱动：父组件一变 -> option 重算 -> EChart 更新
  const option = useMemo(() => buildSulfurOption({ dates, baseSeries: series }), [dates, series]);

  // 2) 表格也吃 props
  const data: Row[] = tableRows;
  const prev = data[0];
  const last = data[1];

  const diffs =
    prev && last
      ? {
          港口库存: +(last.港口库存 - prev.港口库存).toFixed(2),
          CFR中国现货高端价_$: +(last.CFR中国现货高端价_$ - prev.CFR中国现货高端价_$).toFixed(2),
          镇江港固体现货价: +(last.镇江港固体现货价 - prev.镇江港固体现货价).toFixed(2),
        }
      : { 港口库存: 0, CFR中国现货高端价_$: 0, 镇江港固体现货价: 0 };

  const containerRef = useRef<HTMLDivElement | null>(null);
  const { toggleFullscreen } = useFullscreen(containerRef);

  return (
    <div ref={containerRef} className="card card--panel">
      <div className="card__head">
        <IconTitle title={title} />
        <div className="card__meta">
          <div className="card__meta_item">
            <span className="unit">单位：万吨、$/吨、元/吨 | 数据来源：百川</span>
            <FullscreenOutlined className="icon-fullscreen" onClick={toggleFullscreen} />
          </div>
        </div>
      </div>

      <div className="card__box">
        {/* 如果你的 <EChart> 内部未使用 notMerge，可加 key 强制刷新：key={dates.at(-1)} */}
        <EChart ariaLabel="硫磺港口库存/CFR现货/镇江港现货" option={option} className="nh3_price" />

        <Table<Row>
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

                {(['港口库存', 'CFR中国现货高端价_$', '镇江港固体现货价'] as const).map((k, i) => {
                  const diff = diffs[k];
                  const dir = toClass(diff);
                  return (
                    <Table.Summary.Cell
                      key={k}
                      index={i + 1}
                      align="center"
                      className="summary-cell-hb-bg"
                    >
                      <span className={`delta delta--${dir}`}>
                        {/* ⚠️ 修复“— 重复”：为 0 时只渲染一个 “—” */}
                        {diff === 0 ? (
                          '—'
                        ) : (
                          <>
                            {getDirIcon(dir)} {fmt(Math.abs(diff))}
                          </>
                        )}
                      </span>
                    </Table.Summary.Cell>
                  );
                })}
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </div>
    </div>
  );
};

export default SpotPrice;
