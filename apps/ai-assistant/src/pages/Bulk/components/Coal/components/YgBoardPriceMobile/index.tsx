import React, { useMemo } from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import MobileTitle from '../../../MobileTitle';
import EChart from '../../../Echart';
import { fmt } from '@/components/types';
import { useCoalNationwideData } from '../../../context/coalNationwideContext';

// 通用解析 Hook（已支持括号→badge，DataChart/DataForm 动态解析）
import { useCnStock, useCnStockTableModel, type TableRow } from '../../../hooks/useCnStock';

// 动态 ECharts builder
import {
  buildYgPlatePriceOption,
  getDirectionIcon,
  type LineSeries,
} from './ygPlatePriceMobileOption';
import { dirOf } from '@/utils/utils';

import styles from '../../../mobile.module.less';

interface YgBoardPriceMobileProps {
  title?: string; // 可覆盖后端 DataTitle
}

const YgBoardPriceMobile: React.FC<YgBoardPriceMobileProps> = ({ title: titleProp }) => {
  const { swPrice } = useCoalNationwideData(); // ← 后端块：西南煤炭价格走势（CokeSwPrice）

  // 统一解析（动态列、拆括号为 badge、DataChart/DataForm）
  const parsed = useCnStock(swPrice);
  const { tableRows = [], hbRow, columnsMeta = [] } = useCnStockTableModel(parsed) ?? {};

  // 标题/单位/来源：优先用后端；无则安全空文案
  const title = parsed?.title ?? titleProp ?? '';
  const unitText = parsed?.unit ?? '';
  const sourceText = parsed?.source ?? '';

  /* ================= 图表：由 DataChart → LineSeries ================= */
  const datesForChart: string[] = useMemo(() => {
    return Array.isArray(parsed?.dates) ? parsed!.dates! : [];
  }, [parsed]);

  const seriesForChart: LineSeries[] = useMemo(() => {
    if (Array.isArray(parsed?.stacks) && Array.isArray(parsed?.dates)) {
      return parsed!.stacks!.map((s) => ({
        name: s.name,
        points: parsed!.dates!.map((d, i) => ({
          date: d,
          value: Number.isFinite(Number(s.values[i])) ? (s.values[i] as number) : null,
        })),
      }));
    }
    // 后端无数据：使用空数组（不做任何兜底）
    return [];
  }, [parsed]);

  const option = useMemo(
    () =>
      buildYgPlatePriceOption({
        dates: datesForChart,
        baseSeries: seriesForChart,
      }),
    [datesForChart, seriesForChart],
  );

  /* ================= 表格：仅渲染 DataForm 的第1、2行；第3行为“环比/周对比” ================= */
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
      dataIndex: c.name, // useCnStock 已把每列字段名映射为 name
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
                      const valid = Number.isFinite(num);
                      const dir = valid ? dirOf(num) : 'flat';

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

export default YgBoardPriceMobile;
