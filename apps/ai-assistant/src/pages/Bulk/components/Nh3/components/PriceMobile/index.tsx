import React, { useMemo } from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import MobileTitle from '../../../MobileTitle';
import EChart from '../../../Echart';

import { fmt } from '@/components/types';
import { buildNh3PriceOption, getDirectionIcon, type LineSeries } from './nh3PriceOptionMobile';

import { useNh3NationwideData } from '../../../context/nh3NationwideContext';
import { useCnStock, useCnStockTableModel, type TableRow } from '../../../hooks/useCnStock';
import { dirOf } from '@/utils/utils';

import styles from '../../../mobile.module.less';

interface PriceMobileProps {
  title?: string; // 可覆盖后端 DataTitle
}

const PriceMobile: React.FC<PriceMobileProps> = ({ title: titleProp }) => {
  // 1) 上下文取 NH3 的“全国合成氨价格走势”块
  const { amnCnPrice } = useNh3NationwideData();

  // 2) 统一解析（支持括号拆 badge、动态 DataChart/DataForm）
  const parsed = useCnStock(amnCnPrice);
  const { tableRows = [], hbRow, columnsMeta = [] } = useCnStockTableModel(parsed) ?? {};

  // 3) 文案：全部兜空字符串
  const title = parsed?.title ?? titleProp ?? '';
  const unitText = parsed?.unit ?? '';
  const sourceText = parsed?.source ?? '';

  // 4) 图表：由 DataChart → LineSeries（无后端时空数组）
  const datesForChart: string[] = useMemo(() => {
    return Array.isArray(parsed?.dates) ? parsed!.dates! : [];
  }, [parsed]);

  const seriesForChart: LineSeries[] = useMemo(() => {
    if (Array.isArray(parsed?.dates) && Array.isArray(parsed?.stacks)) {
      return parsed!.stacks!.map((s) => ({
        name: s.name,
        points: parsed!.dates!.map((d, i) => ({
          date: d,
          // 用 undefined 让 ECharts 断线而不是 0
          value: Number.isFinite(s.values[i]) ? (s.values[i] as number) : undefined,
        })),
      }));
    }
    return [];
  }, [parsed]);

  const option = useMemo(
    () =>
      buildNh3PriceOption({
        dates: datesForChart,
        baseSeries: seriesForChart,
      }),
    [datesForChart, seriesForChart],
  );

  // 5) 表格列（左侧日期 + 动态列，括号徽标）
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
      dataIndex: c.name, // useCnStock 已把行字段映射为 name
      align: 'center' as const,
      render: (v: unknown) => {
        const num = Number(v);
        return Number.isFinite(num) ? fmt(num) : '—';
      },
    }));

    return [leftCol, ...dataCols];
  }, [columnsMeta]);

  // 6) Summary 行：第3行作为“周环比”覆盖；没有则显示“环比”
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
        {/* 图表（DataChart） */}
        <EChart
          ariaLabel={title || '合成氨价格折线图'}
          option={option}
          className={styles['price-mobile-echart']}
        />

        {/* 表格（仅 DataForm 的第 1、2 行；第 3 行用于 Summary“周环比”） */}
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
                      const dir = dirOf(num); // 'up' | 'down' | 'flat'
                      return (
                        <Table.Summary.Cell
                          key={c.name}
                          index={idx + 1}
                          align="center"
                          className={styles['summary-cell-hb-bg']}
                        >
                          <span className={[styles.delta, styles[`delta--${dir}`]].join(' ')}>
                            {getDirectionIcon(dir)} {dir !== 'flat' && fmt(Math.abs(num))}
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

export default PriceMobile;
