import React, { useMemo, useRef, useState } from 'react';
import EChart from '../../../Echart';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { fmt } from '@/components/types';
import IconTitle from '../../../IconTitle';
import { FullscreenOutlined } from '@yth/icons';
import ElevateModal from '../../../ElevateModal';

import { buildNh3PriceOption, getDirectionIcon, type LineSeries } from './nh3PriceOption';
import { useNh3NationwideData } from '../../../context/nh3NationwideContext';
import { TableRow, useCnStock, useCnStockTableModel } from '../../../hooks/useCnStock';

import Nh3PricePanel from './components/Nh3PricePanel';
import styles from '../../../desktop.module.less';
import { dirOf } from '@/utils/utils';

const Nh3Price: React.FC = () => {
  const [open, setOpen] = useState(false);

  // 1) 全国合成氨价格走势数据
  const { amnCnPrice } = useNh3NationwideData();

  // 2) 统一解析
  const parsed = useCnStock(amnCnPrice);
  const { tableRows = [], hbRow, columnsMeta = [] } = useCnStockTableModel(parsed) ?? {};

  // 3) 文案
  const title = parsed?.title ?? '';
  const unitText = parsed?.unit ?? '';
  const sourceText = parsed?.source ?? '';

  // 4) 图表：DataChart -> LineSeries
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
          // 用 undefined 让 ECharts 断线（避免 0 误导）
          value: Number.isFinite(s.values[i]) ? (s.values[i] as number) : undefined,
        })),
      }));
    }
    return [];
  }, [parsed]);

  const option = useMemo(
    () => buildNh3PriceOption({ dates: datesForChart, baseSeries: seriesForChart }),
    [datesForChart, seriesForChart],
  );

  // 5) 表格列（左侧日期 + 动态列）
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

  // 6) Summary 标签
  const hbLabel: string = (hbRow?.['日期'] as string) || '';

  // 弹层容器（若需严格按视口参照，ElevateModal 传 portalToBody）
  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div ref={containerRef} className={`${styles.card} ${styles.cardPanel}`}>
      {/* 弹层：自定义 AntD Modal 风格 */}
      <ElevateModal
        open={open}
        onClose={() => setOpen(false)}
        portalToBody
        width="85vw"
        // height="80vh"
      >
        <Nh3PricePanel
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
        <EChart ariaLabel="合成氨/尿素价格折线图" option={option} />

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
                    const raw = hbRow[c.name];
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
                    const dir = dirOf(num);
                    const dirCls = styles[`delta--${dir}`] ?? '';
                    return (
                      <Table.Summary.Cell
                        key={c.name}
                        index={idx + 1}
                        align="center"
                        className={styles.summaryCellHbBg}
                      >
                        <span className={`${styles.delta} ${dirCls}`}>
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
  );
};

export default Nh3Price;
