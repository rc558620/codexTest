import React, { useMemo, useRef, useState } from 'react';
import EChart from '../../../Echart';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { fmt } from '@/components/types';
import IconTitle from '../../../IconTitle';
import { FullscreenOutlined } from '@yth/icons';
import ElevateModal from '../../../ElevateModal';

import { buildSaDcpOption, icon, type LineSeries } from './saDcpOption';
import { TableRow, useCnStock, useCnStockTableModel } from '../../../hooks/useCnStock';
import { useH2so4NationwideData } from '../../../context/h2so4NationwideContext';
import AveragePricePanel from './components/AveragePricePanel';
import styles from '../../../desktop.module.less';

interface AveragePriceProps {
  hideRightAxis?: boolean;
}

const AveragePrice: React.FC<AveragePriceProps> = ({ hideRightAxis = true }) => {
  const [open, setOpen] = useState(false);

  // 取上下文数据
  const { slfacCnPrice } = useH2so4NationwideData();

  // 统一解析
  const parsed = useCnStock(slfacCnPrice);
  const { tableRows = [], hbRow, columnsMeta = [] } = useCnStockTableModel(parsed) ?? {};

  // 文案
  const title = parsed?.title ?? '';
  const unitText = parsed?.unit ?? '';
  const sourceText = parsed?.source ?? '';

  /* ============== 图表数据：DataChart → LineSeries ============== */
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
          value: Number.isFinite(s.values[i]) ? (s.values[i] as number) : null, // 断线避免 0 误导
        })),
      }));
    }
    return [];
  }, [parsed]);

  const option = useMemo(
    () =>
      buildSaDcpOption({
        dates: datesForChart,
        baseSeries: seriesForChart,
        hideRightAxis,
        // colorMap: { '全国98%硫酸均价': '#xxxxxx' },
      }),
    [datesForChart, seriesForChart, hideRightAxis],
  );

  /* ============== 表格列：日期 + 动态列（括号→badge） ============== */
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

  // 弹窗容器（若需严格按视口参照，可在 ElevateModal 传 portalToBody）
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
        <AveragePricePanel
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
        <EChart ariaLabel="全国硫酸均价、磷酸氢钙均价" option={option} />

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

                    let dir: 'up' | 'down' | 'flat' = 'flat';
                    if (num > 0) dir = 'up';
                    else if (num < 0) dir = 'down';
                    const dirCls = styles[`delta--${dir}`] ?? '';

                    return (
                      <Table.Summary.Cell
                        key={c.name}
                        index={idx + 1}
                        align="center"
                        className={styles.summaryCellHbBg}
                      >
                        <span className={`${styles.delta} ${dirCls}`}>
                          {dir === 'flat' ? (
                            '—'
                          ) : (
                            <>
                              <span className={styles.deltaIcon}>{icon(num)}</span>{' '}
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

export default AveragePrice;
