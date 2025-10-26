// src/pages/Bulk/Desktop/Coal/CoalDesktop/components/YgSamplePrices/index.tsx
import React, { useMemo, useRef, useState } from 'react';
import EChart from '../../../Echart';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { fmt } from '@/components/types';
import IconTitle from '../../../IconTitle';
import { FullscreenOutlined } from '@yth/icons';
import ElevateModal from '../../../ElevateModal';

import { buildYgPlatePriceOption, getDirectionIcon, type LineSeries } from './sevenSamplesOption';
import { TableRow, useCnStock, useCnStockTableModel } from '../../../hooks/useCnStock';
import { useCoalNationwideData } from '../../../context/coalNationwideContext';

import YgSamplePricesPanel from './components/YgSamplePricesPanel';
import styles from '../../../desktop.module.less';
import { cx, dirOf } from '@/utils/utils';

const YgSamplePrices: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { samplePrices } = useCoalNationwideData(); // 西南板块：七个样本价格

  // 统一解析（动态列、括号→badge、DataChart/DataForm）
  const parsed = useCnStock(samplePrices);
  const { tableRows = [], hbRow, columnsMeta = [] } = useCnStockTableModel(parsed) ?? {};

  // 标题/单位/来源
  const title = parsed?.title ?? '';
  const unitText = parsed?.unit ?? '';
  const sourceText = parsed?.source ?? '';

  /* ================= 图表：DataChart → LineSeries ================= */
  const datesForChart: string[] = useMemo(
    () => (Array.isArray(parsed?.dates) ? parsed!.dates! : []),
    [parsed],
  );

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
    return [];
  }, [parsed]);

  const option = useMemo(
    () => buildYgPlatePriceOption({ dates: datesForChart, baseSeries: seriesForChart }),
    [datesForChart, seriesForChart],
  );

  /* ================= 表格：仅第1、2行；第3行为“周环比/对比” ================= */
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

  // 弹层容器（若需按视口参照，ElevateModal 传 portalToBody）
  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div ref={containerRef} className={cx(styles.card, styles['card--panel'])}>
      {/* 弹层（AntD Modal 风格自实现） */}
      <ElevateModal
        open={open}
        onClose={() => setOpen(false)}
        portalToBody
        width="85vw"
        // height="80vh" // 需要内部滚动时打开
      >
        <YgSamplePricesPanel
          option={option}
          cols={cols}
          tableRows={tableRows}
          hbLabel={hbLabel}
          columnsMeta={columnsMeta}
          title={title}
          unitText={unitText}
          sourceText={sourceText}
        />
      </ElevateModal>

      {/* 页面内常规视图 */}
      <div className={styles.card__head}>
        <IconTitle title={title} />
        <div className={styles.card__meta}>
          <div className={styles.card__meta_item}>
            <span className={styles.unit}>
              {unitText} {sourceText}
            </span>
            <FullscreenOutlined
              className={styles['icon-fullscreen']}
              onClick={() => setOpen(true)}
            />
          </div>
        </div>
      </div>

      <div className={styles.card__box}>
        <EChart ariaLabel="云贵7个样本价格" option={option} />

        <Table<TableRow>
          className={cx(styles.table, styles['table--compact'], styles['table--hide-xbar'])}
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
                          <span className={cx(styles.delta, styles[`delta--${dir}`])}>
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
  );
};

export default YgSamplePrices;
