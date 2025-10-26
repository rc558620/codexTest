import React, { useMemo } from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import MobileTitle from '../../../MobileTitle';
import EChart from '../../../Echart';

import { fmt } from '@/components/types';

// H2SO4 上下文
import { useH2so4NationwideData } from '../../../context/h2so4NationwideContext';

// 通用解析 Hook
import { useCnStock, useCnStockTableModel, type TableRow } from '../../../hooks/useCnStock';

// 动态 ECharts builder
import { buildSaDcpOption, icon, type LineSeries } from './saDcpOptionMobile';

import styles from '../../../mobile.module.less';

interface AveragePriceMobileProps {
  hideRightAxis?: boolean;
}

const AveragePriceMobile: React.FC<AveragePriceMobileProps> = ({ hideRightAxis = true }) => {
  const { slfacCnPrice } = useH2so4NationwideData();

  const parsed = useCnStock(slfacCnPrice);
  const { tableRows = [], hbRow, columnsMeta = [] } = useCnStockTableModel(parsed) ?? {};

  const title = parsed?.title ?? '';
  const unitText = parsed?.unit ?? '';
  const sourceText = parsed?.source ?? '';

  /* ============== 图表：由 DataChart → LineSeries（无后端时空数组） ============== */
  const datesForChart: string[] = useMemo(() => {
    return Array.isArray(parsed?.dates) ? parsed!.dates! : [];
  }, [parsed]);

  const seriesForChart: LineSeries[] = useMemo(() => {
    if (Array.isArray(parsed?.dates) && Array.isArray(parsed?.stacks)) {
      return parsed!.stacks!.map((s) => ({
        name: s.name,
        points: parsed!.dates!.map((d, i) => ({
          date: d,
          // 用 null 让 ECharts 中断绘制而不是连线；避免 0 误导
          value: Number.isFinite(s.values[i]) ? (s.values[i] as number) : null,
        })),
      }));
    }
    return [];
  }, [parsed]);

  const option = useMemo(
    () =>
      buildSaDcpOption({
        dates: datesForChart,
        baseSeries: seriesForChart,
        hideRightAxis,
      }),
    [datesForChart, seriesForChart, hideRightAxis],
  );

  /* ============== 表格：仅第 1、2 行；第 3 行做“周环比/周对比” ============== */
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
      dataIndex: c.name,
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
        <EChart ariaLabel={title} option={option} className={styles['price-mobile-echart']} />

        <div className={styles['mobile-box-table-box']}>
          <Table<TableRow>
            className={[styles.table, styles['table--compact']].join(' ')}
            size="small"
            pagination={false}
            rowKey="key"
            columns={cols}
            dataSource={tableRows}
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

                      const dir = num > 0 ? 'up' : num < 0 ? 'down' : 'flat';

                      return (
                        <Table.Summary.Cell
                          key={c.name}
                          index={idx + 1}
                          align="center"
                          className={styles['summary-cell-hb-bg']}
                        >
                          <span className={[styles.delta, styles[`delta--${dir}`]].join(' ')}>
                            {dir === 'flat' ? (
                              '—'
                            ) : (
                              <>
                                {icon(num)} {fmt(Math.abs(num))}
                              </>
                            )}
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

export default AveragePriceMobile;
