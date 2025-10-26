import React, { useMemo, useRef, useState } from 'react';
import EChart from '../../../Echart';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { fmt } from '@/components/types';
import IconTitle from '../../../IconTitle';
import { FullscreenOutlined } from '@yth/icons';
import ElevateModal from '../../../ElevateModal';

import { buildYnGxH2so4Option, getDirIcon, toDir, type LineSeries } from './yngxH2so4Option';
import { useH2so4NationwideData } from '../../../context/h2so4NationwideContext';
import { useCnStock, useCnStockTableModel } from '../../../hooks/useCnStock';
import YnGxH2SO4PricePanel from './components/YnGxH2SO4PricePanel';
import styles from '../../../desktop.module.less';

const YnGxH2SO4Price: React.FC = () => {
  const [open, setOpen] = useState(false);

  // 1) 从上下文拿“云南及广西价格”块
  const { slfacYnPrice } = useH2so4NationwideData();

  // 2) 通用解析（title/unit/source/dates/series/table）
  const parsed = useCnStock(slfacYnPrice);
  const { tableRows = [], hbRow, columnsMeta = [] } = useCnStockTableModel(parsed) ?? {};

  const title = parsed?.title ?? '';
  const unitText = parsed?.unit ?? '';
  const sourceText = parsed?.source ?? '';

  // 3) 折线图数据：把（可能是任意字段名的）序列转成 {name, points: [{date,value}]}
  const dates: string[] = useMemo(
    () => (Array.isArray(parsed?.dates) ? parsed!.dates! : []),
    [parsed],
  );

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
          return { date: d, value: Number.isFinite(v) ? v : null }; // 缺值用 null 断线
        }),
      };
    });
  }, [parsed, dates]);

  // 4) 生成 echarts option
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
        <div className={styles.thWrap}>
          <div className={styles.thMain}>{c.name}</div>
          {c.badge ? <div className={styles.thBadge}>{c.badge}</div> : null}
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

  // 弹层容器（如需严格按视口单位计算，给 ElevateModal 传 portalToBody）
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
        <YnGxH2SO4PricePanel
          option={option}
          cols={cols}
          tableRows={tableRows}
          hbLabel={hbLabel}
          columnsMeta={columnsMeta}
          title={title}
          unitText={unitText}
          sourceText={sourceText}
          hbRow={hbRow as Record<string, any> | undefined}
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
        <EChart ariaLabel="云南及广西98%硫酸价格" option={option} className={styles.nh3Price} />

        <Table<Record<string, any>>
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

                    const dir = toDir(num); // 'up' | 'down' | 'flat'
                    const dirCls = styles[`delta--${dir}`] ?? '';
                    const content =
                      dir === 'flat' ? (
                        '—'
                      ) : (
                        <>
                          {getDirIcon(dir)} {fmt(Math.abs(num))}
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

export default YnGxH2SO4Price;
