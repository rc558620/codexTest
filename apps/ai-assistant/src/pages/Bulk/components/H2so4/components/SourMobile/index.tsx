import React, { useMemo } from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import MobileTitle from '../../../MobileTitle';
import EChart from '../../../Echart';
import { fmt } from '@/components/types';

import { useH2so4NationwideData } from '../../../context/h2so4NationwideContext';
import { useCnStock, useCnStockTableModel, type TableRow } from '../../../hooks/useCnStock';

import { buildSourOption, arrow, dirClass, type StackSeries } from './sourOptionMobile';

import styles from '../../../mobile.module.less';

interface SourProps {
  title?: string;
  maxBars?: number; // 新增限制参数
}

const DEFAULT_MAX_BARS = 10; // 默认显示10个柱子

const SourMobile: React.FC<SourProps> = ({ title: titleProp, maxBars: maxBarsProp }) => {
  const maxBars = maxBarsProp ?? DEFAULT_MAX_BARS;

  // 1) 取上下文块
  const { slfacSwProd } = useH2so4NationwideData();

  // 2) 解析
  const parsed = useCnStock(slfacSwProd);

  const LINE_NAME = parsed?.ChartLine;
  const { tableRows = [], hbRow, columnsMeta = [] } = useCnStockTableModel(parsed) ?? {};

  // 3) 文案
  const title = parsed?.title ?? titleProp ?? '';
  const unitText = parsed?.unit ?? '';
  const sourceText = parsed?.source ?? '';

  // 4) 统一计算 “最后 N 条” 的索引区间，并据此切片：dates/bars/line 三者保持一致
  const { datesForChart, barsForChart, lineForChart } = useMemo(() => {
    if (!Array.isArray(parsed?.dates) || !Array.isArray(parsed?.stacks)) {
      return {
        datesForChart: [] as string[],
        barsForChart: [] as StackSeries[],
        lineForChart: [] as Array<number | null>,
      };
    }

    const total = parsed!.dates!.length;
    const count = Math.min(maxBars, total);
    const start = Math.max(0, total - count); // 取最后 N 条

    // 日期（展示用：去掉年份）
    const slicedDates = parsed!.dates!.slice(start);
    const datesWithoutYear = slicedDates.map((date) => {
      if (typeof date !== 'string') return '';
      if (date.includes('-') || date.includes('/')) return date.slice(5); // 'YYYY-MM-DD' -> 'MM-DD'
      return date;
    });

    // 柱状：除去 line 系列之外的所有 stacks，按相同 start 切片
    const stacks = parsed!.stacks!;
    const bars = stacks
      .filter((s) => s.name !== LINE_NAME)
      .map((b) => {
        const values = (b.values ?? []).slice(start).map((v) => {
          const num = Number(v);
          return Number.isFinite(num) ? num : 0;
        });
        return { name: b.name, values } satisfies StackSeries;
      });

    // 折线：若找不到对应 name，则生成同长度的 null
    const line = stacks.find((s) => s.name === LINE_NAME);
    const lineValues: Array<number | null> = line
      ? (line.values ?? []).slice(start).map((v) => {
          const num = Number(v);
          return Number.isFinite(num) ? num : null;
        })
      : Array(count).fill(null);

    return {
      datesForChart: datesWithoutYear,
      barsForChart: bars,
      lineForChart: lineValues,
    };
  }, [parsed, maxBars, LINE_NAME]);

  // 5) ECharts option
  const option = useMemo(
    () =>
      buildSourOption({
        dates: datesForChart,
        bars: barsForChart,
        lineName: LINE_NAME,
        lineValues: lineForChart,
      }),
    [datesForChart, barsForChart, LINE_NAME, lineForChart],
  );

  // 6) 表格列
  const cols: ColumnsType<TableRow> = useMemo(() => {
    const leftCol = {
      title: '日期',
      dataIndex: '日期',
      width: 100,
      fixed: 'left' as const,
      align: 'center' as const,
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
                      const cls = dirClass(num); // 'up' | 'down' | 'flat'
                      return (
                        <Table.Summary.Cell
                          key={c.name}
                          index={idx + 1}
                          align="center"
                          className={styles['summary-cell-hb-bg']}
                        >
                          <span className={[styles.delta, styles[`delta--${cls}`]].join(' ')}>
                            {cls === 'flat' ? (
                              '—'
                            ) : (
                              <>
                                {arrow(num)} {fmt(Math.abs(num))}
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

export default SourMobile;
