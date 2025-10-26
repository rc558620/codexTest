import React, { useMemo, useRef, useState } from 'react';
import EChart from '../../../Echart';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { fmt } from '@/components/types';
import IconTitle from '../../../IconTitle';
import { FullscreenOutlined } from '@yth/icons';
import ElevateModal from '../../../ElevateModal';

import { arrow, buildTendencyOption, dirClass, type LineSeries } from './tendencyOption';
import { TableRow, useCnStock, useCnStockTableModel } from '../../../hooks/useCnStock';
import { useNh3NationwideData } from '../../../context/nh3NationwideContext';
import TendencyPanel from './components/TendencyPanel';
import styles from '../../../desktop.module.less';

interface TendencyProps {
  /** 可调打点位置（默认 0.62） */
  markAtRatio?: number;
}

const Tendency: React.FC<TendencyProps> = ({ markAtRatio = 0.62 }) => {
  const [open, setOpen] = useState(false);
  const { amnSwPrice } = useNh3NationwideData(); // 西南合成氨价格走势

  // 统一解析
  const parsed = useCnStock(amnSwPrice);
  const { tableRows = [], hbRow, columnsMeta = [] } = useCnStockTableModel(parsed) ?? {};

  // 文案
  const title = parsed?.title ?? '';
  const unitText = parsed?.unit ?? '';
  const sourceText = parsed?.source ?? '';

  /* ============== 图表：DataChart → LineSeries ============== */
  const datesForChart: string[] = useMemo(
    () => (Array.isArray(parsed?.dates) ? parsed!.dates! : []),
    [parsed],
  );

  const seriesForChart: LineSeries[] = useMemo(() => {
    if (Array.isArray(parsed?.dates) && Array.isArray(parsed?.stacks)) {
      return parsed!.stacks!.map((s) => ({
        name: s.name,
        points: parsed!.dates!.map((d, i) => ({
          date: d,
          // 用 null 让 ECharts 断线，避免把 0 当作真实值
          value: Number.isFinite(s.values[i]) ? (s.values[i] as number) : null,
        })),
      }));
    }
    return [];
  }, [parsed]);

  const option = useMemo(
    () => buildTendencyOption({ dates: datesForChart, baseSeries: seriesForChart, markAtRatio }),
    [datesForChart, seriesForChart, markAtRatio],
  );

  /* ============== 列定义：日期 + 动态列（括号→badge） ============== */
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
          {c.badge ? <div className={styles.thBadge}>{(c as any).badge}</div> : null}
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

  // 弹窗容器（如需严格按视口参照：ElevateModal 传 portalToBody）
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
        <TendencyPanel
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
        <EChart ariaLabel="西南液氨主要厂家商品氨价格走势" option={option} />

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

                    const cls = dirClass(num); // e.g. 'up' | 'down' | 'flat'
                    const dirCls = styles[`delta--${cls}`] ?? '';
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
                        className={styles.summaryCellHbBg}
                      >
                        <span className={`${styles.delta} ${dirCls}`}>{content}</span>
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

export default Tendency;
