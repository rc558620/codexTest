import React, { useMemo } from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import MobileTitle from '../../../MobileTitle';
import EChart from '../../../Echart';
import { fmt } from '@/components/types';
import { buildInventoryOption, getDirectionSymbol } from './inventoryMobileOption';

import { useCoalNationwideData } from '../../../context/coalNationwideContext';

// 通用解析 Hook（支持括号→badge，DataChart/DataForm 动态解析）
import { useCnStock, useCnStockTableModel, type TableRow } from '../../../hooks/useCnStock';
import { dirOf } from '@/utils/utils';

import styles from '../../../mobile.module.less';

interface InventoryMobileProps {
  title?: string;
}

const InventoryMobile: React.FC<InventoryMobileProps> = ({ title: titleProp }) => {
  const { cnStock } = useCoalNationwideData();

  // 解析后端块（可复用）
  const parsed = useCnStock(cnStock);
  const { tableRows = [], hbRow, columnsMeta = [] } = useCnStockTableModel(parsed) ?? {};

  // 文案：优先后端；后端无值给空文案，避免报错
  const title = parsed?.title ?? titleProp ?? '';
  const unitText = parsed?.unit ?? '';
  const sourceText = parsed?.source ?? '';

  // 图表：完全使用后端；后端无值时走空数组（不做任何 mock 兜底）
  const datesForChart = useMemo(
    () => (Array.isArray(parsed?.dates) ? parsed!.dates! : []),
    [parsed],
  );
  const stacksForChart = useMemo(
    () => (Array.isArray(parsed?.stacks) ? parsed!.stacks! : []),
    [parsed],
  );
  const legendOrder = useMemo(
    () =>
      Array.isArray(parsed?.legendOrder) ? parsed!.legendOrder! : stacksForChart.map((s) => s.name),
    [parsed, stacksForChart],
  );

  const option = useMemo(
    () =>
      buildInventoryOption({
        dates: datesForChart,
        stacks: stacksForChart,
        legendOrder,
        smooth: true,
      }),
    [datesForChart, stacksForChart, legendOrder],
  );

  // 表头 + 渲染：使用 badge 切成两部分显示
  const cols: ColumnsType<TableRow> = useMemo(() => {
    const leftCol: ColumnsType<TableRow>[number] = {
      title: '日期',
      dataIndex: '日期',
      width: 100,
      fixed: 'left',
      align: 'center',
    };

    const dataCols: ColumnsType<TableRow> = (columnsMeta ?? []).map((c) => ({
      title: (
        <div className={styles['th-wrap']}>
          <div className={styles['th-main']}>{c.name}</div>
          {c.badge ? <div className={styles['th-badge']}>{c.badge}</div> : null}
        </div>
      ),
      dataIndex: c.name, // 行里使用 name 作为字段
      align: 'center' as const,
      render: (v: unknown) => {
        const num = Number(v);
        return Number.isFinite(num) ? fmt(num) : '—';
      },
    }));

    return [leftCol, ...dataCols];
  }, [columnsMeta]);

  const hbLabel: string = (hbRow?.['日期'] as string) || '';

  return (
    <div className={styles['mobile-box']}>
      <div className={styles['mobile-box-flex']}>
        <div className={styles['mobile-box-flex-left']}>
          <MobileTitle title={title} />
        </div>
        <span className={styles['mobile-box-flex-right']}>
          {unitText} {sourceText}
        </span>
      </div>

      <div className={styles['mobile-box-table']}>
        {/* 图表：DataChart（后端无数据时为空图，不报错） */}
        <EChart ariaLabel={title} option={option} className={styles['price-mobile-echart']} />

        {/* 表格：仅 DataForm 的第 1、2 行；第 3 行用于 Summary（环比/周对比） */}
        <div className={styles['mobile-box-table-box']}>
          <Table<TableRow>
            className={[styles.table, styles['table--compact']].join(' ')}
            size="small"
            pagination={false}
            columns={cols}
            dataSource={tableRows} // 后端无数据 => []
            rowKey="key"
            scroll={{ x: 'max-content' }}
            summary={() =>
              hbRow ? (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell
                      index={0}
                      align="center"
                      className={styles['summary-cell-hb-bg']}
                    >
                      <span className={styles.hb_color}>{hbLabel}</span>
                    </Table.Summary.Cell>

                    {(columnsMeta ?? []).map((c, idx) => {
                      const raw = hbRow[c.name];
                      const num = Number(raw);
                      if (!Number.isFinite(num)) {
                        return (
                          <Table.Summary.Cell
                            key={c.name}
                            index={idx + 1}
                            align="center"
                            className={styles['summary-cell-hb-bg']}
                          >
                            <span className={styles.delta}>—</span>
                          </Table.Summary.Cell>
                        );
                      }
                      const dir = dirOf(num); // 'up' | 'down' | 'flat'
                      return (
                        <Table.Summary.Cell
                          key={c.name}
                          index={idx + 1}
                          align="center"
                          className={styles['summary-cell-hb-bg']}
                        >
                          <span className={[styles.delta, styles[`delta--${dir}`]].join(' ')}>
                            {getDirectionSymbol(dir)} {dir !== 'flat' && fmt(Math.abs(num))}
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
    </div>
  );
};

export default InventoryMobile;
