import React, { useMemo, useRef, useState } from 'react';
import EChart from '../../../Echart';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { fmt } from '@/components/types';
import IconTitle from '../../../IconTitle';
import { FullscreenOutlined } from '@yth/icons';
import ElevateModal from '../../../ElevateModal';

import { arrow, buildSourOption, dirClass, type StackSeries } from './sourOption';
import { useH2so4NationwideData } from '../../../context/h2so4NationwideContext';
import { TableRow, useCnStock, useCnStockTableModel } from '../../../hooks/useCnStock';
import SourPanel from './components/SourPanel';
import styles from '../../../desktop.module.less';

interface SourProps {
  /** 限制柱子数量（默认 30） */
  maxBars?: number;
}

const DEFAULT_MAX_BARS = 30;

const Sour: React.FC<SourProps> = ({ maxBars: maxBarsProp }) => {
  const [open, setOpen] = useState(false);
  const maxBars = maxBarsProp ?? DEFAULT_MAX_BARS;

  // 1) 数据来源
  const { slfacSwProd } = useH2so4NationwideData();

  // 2) 解析
  const parsed = useCnStock(slfacSwProd);
  const LINE_NAME = parsed?.ChartLine;
  const { tableRows = [], hbRow, columnsMeta = [] } = useCnStockTableModel(parsed) ?? {};

  // 3) 文案
  const title = parsed?.title ?? '';
  const unitText = parsed?.unit ?? '';
  const sourceText = parsed?.source ?? '';

  // 4) 统一切片（最后 N 条）
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
    const start = Math.max(0, total - count);

    const slicedDates = parsed!.dates!.slice(start);
    const datesWithoutYear = slicedDates.map((date) => {
      if (typeof date !== 'string') return '';
      if (date.includes('-') || date.includes('/')) return date.slice(5);
      return date;
    });

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
        targetXTicks: datesForChart.length,
      }),
    [datesForChart, barsForChart, LINE_NAME, lineForChart],
  );

  // 6) 表格列
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
        <div className={styles.thWrap}>
          <div className={styles.thMain}>{c.name}</div>
          {(c as any).badge ? <div className={styles.thBadge}>{(c as any).badge}</div> : null}
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

  // 弹层容器（如需严格按视口计算尺寸，可给 ElevateModal 传 portalToBody）
  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div ref={containerRef} className={`${styles.card} ${styles.cardPanel}`}>
      {/* 弹层（AntD Modal 风格自实现） */}
      <ElevateModal
        open={open}
        onClose={() => setOpen(false)}
        portalToBody
        width="85vw"
        // height="80vh"
      >
        <SourPanel
          option={option}
          cols={cols}
          tableRows={tableRows}
          hbLabel={hbLabel}
          columnsMeta={columnsMeta}
          title={title}
          unitText={unitText}
          sourceText={sourceText}
          hbRow={hbRow as Record<string, unknown> | undefined}
        />
      </ElevateModal>

      {/* 页面内常规视图 */}
      <div className={styles.cardHead}>
        <IconTitle title={title} />
        <div className={styles.cardMeta}>
          <div className={styles.cardMetaItem}>
            <span className={styles.unit}>
              {unitText} {sourceText}
            </span>
            <FullscreenOutlined className={styles.iconFullscreen} onClick={() => setOpen(true)} />
          </div>
        </div>
      </div>

      <div className={styles.cardBox}>
        <EChart ariaLabel="酸企周产量" option={option} />

        <Table<TableRow>
          className={`${styles.table} ${styles.tableCompact}`}
          size="small"
          pagination={false}
          rowKey="key"
          columns={cols}
          dataSource={tableRows}
          summary={() =>
            hbRow ? (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} align="center" className={styles.summaryCellHbBg}>
                    <span className={styles.hbColor}>{hbLabel}</span>
                  </Table.Summary.Cell>
                  {(columnsMeta ?? []).map((c, idx) => {
                    const raw = (hbRow as any)?.[c.name];
                    const num = Number(raw);
                    if (!Number.isFinite(num)) {
                      return (
                        <Table.Summary.Cell
                          key={c.name}
                          index={idx + 1}
                          align="center"
                          className={styles.summaryCellHbBg}
                        >
                          <span className={styles.delta}>—</span>
                        </Table.Summary.Cell>
                      );
                    }
                    const cls = dirClass(num); // 'up' | 'down' | 'flat'
                    const dirCls = styles[`delta--${cls}`] ?? '';
                    return (
                      <Table.Summary.Cell
                        key={c.name}
                        index={idx + 1}
                        align="center"
                        className={styles.summaryCellHbBg}
                      >
                        <span className={`${styles.delta} ${dirCls}`}>
                          {cls === 'flat' ? (
                            '—'
                          ) : (
                            <>
                              <span className={styles.deltaIcon}>{arrow(num)}</span>{' '}
                              {fmt(Math.abs(num))}
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

export default Sour;
