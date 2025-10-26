import React, { useMemo } from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import MobileTitle from '../../../MobileTitle';
import EChart from '../../../Echart';
import { fmt } from '@/components/types';

import { useCoalNationwideData } from '../../../context/coalNationwideContext';

// 通用解析 hooks
import { useCnStock, useCnStockTableModel, type TableRow } from '../../../hooks/useCnStock';

import {
  buildSevenSamplesOption,
  getDirectionIcon,
  type LineSeries,
} from './sevenSamplesOptionMobile';

import styles from '../../../mobile.module.less';

interface PriceProps {
  title?: string; // 可覆盖后端 DataTitle
}

const YgSamplePricesMobile: React.FC<PriceProps> = ({ title: titleProp }) => {
  const { samplePrices } = useCoalNationwideData(); // 西南7个样本价格（CokeSampPrice）

  // 统一解析：标题/单位/来源/列/图数据/DataForm
  const parsed = useCnStock(samplePrices);
  const { tableRows = [], hbRow, columnsMeta = [] } = useCnStockTableModel(parsed) ?? {};

  const title = parsed?.title ?? titleProp ?? '';
  const unitText = parsed?.unit ?? '';
  const sourceText = parsed?.source ?? '';

  /* ============== 图表：DataChart -> LineSeries（动态） ============== */
  const datesForChart = useMemo(() => parsed?.dates ?? [], [parsed?.dates]);

  const seriesForChart: LineSeries[] = useMemo(() => {
    if (!parsed?.dates || !parsed?.stacks) return [];
    return parsed.stacks.map((s) => ({
      name: s.name,
      points: parsed.dates!.map((d, i) => ({
        date: d,
        value: Number.isFinite(Number(s.values[i])) ? (s.values[i] as number) : null,
      })),
    }));
  }, [parsed?.dates, parsed?.stacks]);

  const option = useMemo(
    () => buildSevenSamplesOption({ dates: datesForChart, baseSeries: seriesForChart }),
    [datesForChart, seriesForChart],
  );

  /* ============== 表格：DataForm 仅第 1、2 行；第 3 行用于 Summary ============== */
  const cols: ColumnsType<TableRow> = useMemo(() => {
    const first: ColumnsType<TableRow>[number] = {
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
      align: 'center',
      render: (v: unknown) => {
        const num = Number(v);
        return Number.isFinite(num) ? fmt(num) : '—';
      },
    }));

    return [first, ...dataCols];
  }, [columnsMeta]);

  const hbLabel: string = (hbRow?.['日期'] as string) || '';
  const dirFrom = (n: number) => (n > 0 ? 'up' : n < 0 ? 'down' : 'flat');

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
                      const valid = Number.isFinite(num);
                      const dir = valid ? dirFrom(num) : 'flat';
                      return (
                        <Table.Summary.Cell
                          key={c.name}
                          index={idx + 1}
                          align="center"
                          className={styles['summary-cell-hb-bg']}
                        >
                          {valid ? (
                            <span className={[styles.delta, styles[`delta--${dir}`]].join(' ')}>
                              {getDirectionIcon(dir)} {dir !== 'flat' && fmt(Math.abs(num))}
                            </span>
                          ) : (
                            <span className={styles.delta}>—</span>
                          )}
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

export default YgSamplePricesMobile;
