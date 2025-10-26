import React, { useMemo } from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import MobileTitle from '../../../MobileTitle';
import EChart from '../../../Echart';
import { fmt } from '@/components/types';

// 上下文：NH3 全国页（与 Coal 的用法一致）
import { useNh3NationwideData } from '../../../context/nh3NationwideContext';

// 通用解析 Hook：支持括号→badge、DataChart/DataForm 动态解析
import { useCnStock, useCnStockTableModel, type TableRow } from '../../../hooks/useCnStock';

// 动态 ECharts builder（见下一个文件）
import { buildTendencyOption, type LineSeries, dirClass, arrow } from './tendencyOptionMobile';

import styles from '../../../mobile.module.less';

interface TendencyProps {
  title?: string; // 可覆盖后端 DataTitle
  colorMap?: Record<string, string>; // 可选：固定某些系列的颜色
  markAtRatio?: number; // 可选：标注位置（0~1），默认 0.62
}

const TendencyMobile: React.FC<TendencyProps> = ({ title: titleProp, colorMap, markAtRatio }) => {
  const { amnSwPrice } = useNh3NationwideData(); // ← 后端块：西南合成氨价格走势

  // 统一解析（动态列、拆括号为 badge、DataChart/DataForm）
  const parsed = useCnStock(amnSwPrice);
  const { tableRows = [], hbRow, columnsMeta = [] } = useCnStockTableModel(parsed) ?? {};

  // 标题/单位/来源：优先后端，其次 props，最后空串
  const title = parsed?.title ?? titleProp ?? '';
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
      buildTendencyOption({
        dates: datesForChart,
        baseSeries: seriesForChart,
        colorMap,
        markAtRatio,
      }),
    [datesForChart, seriesForChart, colorMap, markAtRatio],
  );

  /* ============== 表格列：日期 + 动态数据列（括号→badge） ============== */
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
      width: 100,
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

                      // 非数值：显示 ‘—’
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
                      const content =
                        num === 0 ? (
                          '—'
                        ) : (
                          <>
                            {arrow(num)} {fmt(Math.abs(num))}
                          </>
                        );

                      return (
                        <Table.Summary.Cell
                          key={c.name}
                          index={idx + 1}
                          align="center"
                          className={styles['summary-cell-hb-bg']}
                        >
                          <span className={[styles.delta, styles[`delta--${cls}`]].join(' ')}>
                            {content}
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

export default TendencyMobile;
