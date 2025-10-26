import React, { useMemo } from 'react';
import MobileTitle from '../../../MobileTitle';
import EChart from '../../../Echart';
import { SADC_DATES, SADC_PRICE_SERIES, SADC_PRICE_TABLE } from '../../../../mock';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { fmt } from '@/components/types';
import { buildSaDcpOption, dirClass, icon, type LineSeries } from './saDcpOptionMobile';

interface AveragePriceMobileProps {
  title: string;
  dates?: string[];
  series?: LineSeries[];
  tableRows?: Row[];
  hideRightAxis?: boolean;
}

export interface Row {
  key: string;
  日期: string;
  硫酸均价: number;
  '云南硫铁矿（驰宏锌锗）出厂价': number;
  '磷酸氢钙17%': number;
}

const columns: ColumnsType<Row> = [
  { title: '日期', dataIndex: '日期', width: 50, fixed: 'left', align: 'center' },
  { title: '硫酸均价', dataIndex: '硫酸均价', align: 'center', render: (v) => fmt(v) },
  {
    title: (
      <div style={{ lineHeight: 1.2 }}>
        <div>云南硫铁矿</div>
        <div>（驰宏锌锗）出厂价</div>
      </div>
    ),
    dataIndex: '云南硫铁矿（驰宏锌锗）出厂价',
    align: 'center',
    render: (v) => fmt(v),
  },
  { title: '磷酸氢钙17%', dataIndex: '磷酸氢钙17%', align: 'center', render: (v) => fmt(v) },
];

const AveragePriceMobile: React.FC<AveragePriceMobileProps> = ({
  title,
  dates = SADC_DATES,
  series = SADC_PRICE_SERIES as unknown as LineSeries[],
  tableRows = SADC_PRICE_TABLE as unknown as Row[],
  hideRightAxis = false,
}) => {
  const option = useMemo(
    () => buildSaDcpOption({ dates, baseSeries: series, hideRightAxis }),
    [dates, series, hideRightAxis],
  );

  const rows = tableRows;
  const prev = rows?.[0];
  const last = rows?.[1];

  const diffSA = prev && last ? +(last['硫酸均价'] - prev['硫酸均价']).toFixed(2) : 0;
  const diffPyrite =
    prev && last
      ? +(last['云南硫铁矿（驰宏锌锗）出厂价'] - prev['云南硫铁矿（驰宏锌锗）出厂价']).toFixed(2)
      : 0;
  const diffDcp = prev && last ? +(last['磷酸氢钙17%'] - prev['磷酸氢钙17%']).toFixed(2) : 0;

  // ✅ 用 map 生成 Summary Cell
  const summaryItems = useMemo(
    () => [
      { key: '硫酸均价', diff: diffSA },
      { key: '云南硫铁矿（驰宏锌锗）出厂价', diff: diffPyrite },
      { key: '磷酸氢钙17%', diff: diffDcp },
    ],
    [diffSA, diffPyrite, diffDcp],
  );

  const renderDelta = (v: number) => (v === 0 ? '—' : `${icon(v)} ${fmt(Math.abs(v))}`);
  return (
    <div className="mobile-box">
      <div className="mobile-box-flex">
        <div className="mobile-box-flex-left">
          <MobileTitle title={title} />
        </div>
        <span className="mobile-box-flex-right">单位：元/吨 数据来源：百川</span>
      </div>
      <div className="mobile-box-table">
        <EChart ariaLabel="全国煤炭价格折线图" option={option} className="price-mobile-echart" />
        <Table<Row>
          className="table table--compact"
          size="small"
          pagination={false}
          rowKey="key"
          columns={columns}
          dataSource={rows}
          scroll={{ x: 'max-content' }}
          summary={() =>
            rows.length >= 2 ? (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} align="center" className="summary-cell-hb-bg">
                    <span className="hb_color">周对比</span>
                  </Table.Summary.Cell>

                  {summaryItems.map((item, i) => (
                    <Table.Summary.Cell
                      key={item.key}
                      index={i + 1}
                      align="center"
                      className="summary-cell-hb-bg"
                    >
                      <span className={`delta delta--${dirClass(item.diff)}`}>
                        {renderDelta(item.diff)}
                      </span>
                    </Table.Summary.Cell>
                  ))}
                </Table.Summary.Row>
              </Table.Summary>
            ) : null
          }
        />
      </div>
    </div>
  );
};

export default AveragePriceMobile;
