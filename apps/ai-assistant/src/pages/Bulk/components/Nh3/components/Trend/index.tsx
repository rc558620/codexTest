// src/pages/Bulk/components/Price/index.tsx
import React, { useMemo, useRef } from 'react';
import EChart from '../../../Echart';
import { DATES, PRICE_SERIES_NH3_INTL } from '../../../../mock'; // 作为默认值
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { fmt, delta } from '@/components/types';
import { useFullscreen } from '@/utils/fullscreen';
import IconTitle from '../../../IconTitle';
import { FullscreenOutlined } from '@yth/icons';

import { buildNh3IntlOption, getDirectionIcon, type LineSeries } from './nh3IntlOption';

interface PriceProps {
  title: string;
  dates?: string[]; // ← 父组件传接口 dates
  series?: LineSeries[]; // ← 父组件传接口 series（name/points）
}

// ---- 表格行类型 ----
interface Row {
  key: string;
  时间: string;
  中东FOB: number;
  印度CFR: number;
  坦帕CFR: number;
  中国CFR: number;
}

const Trend: React.FC<PriceProps> = ({
  title,
  dates = DATES,
  series = PRICE_SERIES_NH3_INTL as unknown as LineSeries[],
}) => {
  // 1) echarts 配置：完全吃入参
  const option = useMemo(() => buildNh3IntlOption({ dates, baseSeries: series }), [dates, series]);

  // 2) 表格数据：同样使用传入的 series
  const seriesMap = useMemo(
    () => Object.fromEntries(series.map((s) => [s.name, s.points] as const)),
    [series],
  );

  const rows: Row[] = useMemo(
    () =>
      dates.map((d, i) => ({
        key: d,
        时间: d,
        中东FOB: seriesMap['中东FOB']?.[i]?.value ?? 0,
        印度CFR: seriesMap['印度CFR']?.[i]?.value ?? 0,
        坦帕CFR: seriesMap['坦帕CFR']?.[i]?.value ?? 0,
        中国CFR: seriesMap['中国CFR']?.[i]?.value ?? 0,
      })),
    [dates, seriesMap],
  );

  const cols: ColumnsType<Row> = [
    { title: '时间', dataIndex: '时间', width: 120, fixed: 'left', align: 'center' },
    { title: '中东FOB', dataIndex: '中东FOB', align: 'center', render: (v) => fmt(v) },
    { title: '印度CFR', dataIndex: '印度CFR', align: 'center', render: (v) => fmt(v) },
    { title: '坦帕CFR', dataIndex: '坦帕CFR', align: 'center', render: (v) => fmt(v) },
    { title: '中国CFR', dataIndex: '中国CFR', align: 'center', render: (v) => fmt(v) },
  ];

  const L = rows.length;
  const lastRow = rows[L - 1];
  const prevRow = rows[L - 2];

  // 全屏
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { toggleFullscreen } = useFullscreen(containerRef);

  return (
    <div ref={containerRef} className="card card--panel">
      <div className="card__head">
        <IconTitle title={title} />
        <div className="card__meta">
          <div className="card__meta_item">
            <span className="unit">单位：元/吨 | 数据来源：百川、CCTD</span>
            <FullscreenOutlined className="icon-fullscreen" onClick={toggleFullscreen} />
          </div>
        </div>
      </div>

      <div className="card__box">
        {/* 如果你的 <EChart> 封装没有观察 props 变化，可加 key 强制重建 */}
        {/* <EChart key={dates.at(-1)} ... /> */}
        <EChart ariaLabel="合成氨/尿素价格折线图" option={option} className="nh3_price" />

        <Table<Row>
          className="table table--compact"
          size="small"
          pagination={false}
          rowKey="key"
          columns={cols}
          dataSource={rows}
          summary={() =>
            L >= 2 ? (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} align="center" className="summary-cell-hb-bg">
                    <span className="hb_color">周对比</span>
                  </Table.Summary.Cell>
                  {(['中东FOB', '印度CFR', '坦帕CFR', '中国CFR'] as const).map((k, idx) => {
                    const d = delta(lastRow[k], prevRow[k]); // { v, dir }
                    return (
                      <Table.Summary.Cell
                        key={k}
                        index={idx + 1}
                        align="center"
                        className="summary-cell-hb-bg"
                      >
                        <span className={`delta delta--${d.dir}`}>
                          {d.v === 0 ? '—' : `${getDirectionIcon(d.dir)} ${fmt(Math.abs(d.v))}`}
                        </span>
                      </Table.Summary.Cell>
                    );
                  })}
                </Table.Summary.Row>
              </Table.Summary>
            ) : null
          }
        />
      </div>
    </div>
  );
};

export default Trend;
