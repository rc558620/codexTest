import React, { useMemo } from 'react';
import MobileTitle from '../../../MobileTitle';
import EChart from '../../../Echart';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { fmt } from '@/components/types';

import { useH2so4NationwideData } from '../../../context/h2so4NationwideContext';
import { useCnStock, useCnStockTableModel } from '../../../hooks/useCnStock';

import { buildYnGxH2so4Option, getDirIcon, toDir, type LineSeries } from './yngxH2so4OptionMobile';

import styles from '../../../mobile.module.less';

interface YnGxH2SO4PriceProps {
  title?: string;
}

const AveragePriceMobile: React.FC<YnGxH2SO4PriceProps> = ({ title: titleProp }) => {
  // 1) 从上下文拿“云南及广西价格”块
  const { slfacYnPrice } = useH2so4NationwideData();

  // 2) 通用解析（title/unit/source/dates/series/table）
  const parsed = useCnStock(slfacYnPrice);
  const { tableRows = [], hbRow, columnsMeta = [] } = useCnStockTableModel(parsed) ?? {};

  const title = parsed?.title ?? titleProp ?? '';
  const unitText = parsed?.unit ?? '';
  const sourceText = parsed?.source ?? '';

  // 3) 折线图数据
  const dates: string[] = useMemo(() => {
    return Array.isArray(parsed?.dates) ? parsed!.dates! : [];
  }, [parsed]);

  const series: LineSeries[] = useMemo(() => {
    type Raw =
      | { name: string; points?: Array<{ date: string; value: number | null }>; values?: number[] }
      | any;

    const raw: Raw[] =
      (Array.isArray((parsed as any)?.series) && (parsed as any).series) ||
      (Array.isArray((parsed as any)?.lines) && (parsed as any).lines) ||
      (Array.isArray((parsed as any)?.stacks) && (parsed as any).stacks) ||
      [];

    return raw.map((s) => {
      if (Array.isArray(s.points)) {
        return { name: s.name, points: s.points as Array<{ date: string; value: number | null }> };
      }
      const vals: any[] = Array.isArray(s.values) ? s.values : [];
      return {
        name: s.name,
        points: dates.map((d, i) => {
          const v = Number(vals[i]);
          return { date: d, value: Number.isFinite(v) ? v : null };
        }),
      };
    });
  }, [parsed, dates]);

  // 4) echarts option
  const option = useMemo(
    () => buildYnGxH2so4Option({ dates, baseSeries: series }),
    [dates, series],
  );

  // 5) 表格列（动态）
  const cols: ColumnsType<Record<string, any>> = useMemo(() => {
    const leftCol = {
      title: '日期',
      dataIndex: '日期',
      width: 90,
      fixed: 'left' as const,
      align: 'center' as const,
    };
    const dataCols: ColumnsType<Record<string, any>> = (columnsMeta ?? []).map((c) => ({
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

  // 6) 汇总行
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

        <Table<Record<string, any>>
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
                    const dir = toDir(num); // 'up' | 'down' | 'flat'
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
                              {getDirIcon(dir)} {fmt(Math.abs(num))}
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
  );
};

export default AveragePriceMobile;
