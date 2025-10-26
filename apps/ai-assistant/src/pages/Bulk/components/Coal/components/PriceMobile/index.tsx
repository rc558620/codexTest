import React, { useMemo } from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import MobileTitle from '../../../MobileTitle';
import EChart from '../../../Echart';

import { fmt } from '@/components/types';
import { useCoalNationwideData } from '../../../context/coalNationwideContext';

// 图表配置（保持不变）
import { buildCoalPriceOption, getDirectionIcon, type LineSeries } from './coalPriceMobileOption';

// 通用解析 Hook（动态列；括号→badge；DataChart/DataForm）
import { useCnStock, useCnStockTableModel, type TableRow } from '../../../hooks/useCnStock';

import styles from '../../../mobile.module.less';

interface PriceMobileProps {
  title?: string; // 可覆盖后端 DataTitle
  enableAI?: boolean; // 图例占位控制（按你现有逻辑）
}

const PriceMobile: React.FC<PriceMobileProps> = ({ title: titleProp, enableAI = true }) => {
  const { cnPrice } = useCoalNationwideData(); // 后端块：全国煤炭价格走势

  // 统一解析（动态列、拆括号为 badge、DataChart/DataForm）
  const parsed = useCnStock(cnPrice);
  const { tableRows = [], hbRow, columnsMeta = [] } = useCnStockTableModel(parsed) ?? {};

  // 标题/单位/来源：优先用后端；无则给空文案，避免报错
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
    () => buildCoalPriceOption({ dates: datesForChart, baseSeries: seriesForChart, enableAI }),
    [datesForChart, seriesForChart, enableAI],
  );

  /* ============== 表格：仅渲染 DataForm 第 1、2 行；第 3 行用于 Summary（周环比） ============== */
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
      align: 'center',
      render: (v: unknown) => {
        const num = Number(v);
        return Number.isFinite(num) ? fmt(num) : '—';
      },
    }));

    return [leftCol, ...dataCols];
  }, [columnsMeta]);

  // Summary 行标题：优先用第 3 行“日期”（例：周环比），否则显示“环比”
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
        {/* 图表：后端无数据时为空图，不报错 */}
        <EChart ariaLabel={title} option={option} className={styles['price-mobile-echart']} />

        {/* 表格：仅 DataForm 的第 1、2 行；第 3 行用于 Summary（周环比/环比） */}
        <div className={styles['mobile-box-table-box']}>
          <Table<TableRow>
            className={[styles.table, styles['table--compact']].join(' ')}
            size="small"
            pagination={false}
            rowKey="key"
            columns={cols}
            dataSource={tableRows} // 无数据 => []
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
                      const dir: 'up' | 'down' | 'flat' =
                        num > 0 ? 'up' : num < 0 ? 'down' : 'flat';
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
