// src/pages/Bulk/Desktop/Coal/CoalDesktop/components/Price/index.tsx
import React, { useMemo, useRef, useState } from 'react';
import EChart from '../../../Echart';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { fmt } from '@/components/types';
import IconTitle from '../../../IconTitle';
import { FullscreenOutlined } from '@yth/icons';
import { buildCoalPriceOption, getDirectionIcon, type LineSeries } from './coalPriceOption';
import { TableRow, useCnStock, useCnStockTableModel } from '../../../hooks/useCnStock';
import { useCoalNationwideData } from '../../../context/coalNationwideContext';
import ElevateModal from '../../../ElevateModal';
import PricePanel from './components/PricePanel';
import styles from '../../../desktop.module.less';
import { cx } from '@/utils/utils';

interface PriceProps {
  enableAI?: boolean; // ← 父组件可控制 AI 曲线开关
}

const Price: React.FC<PriceProps> = ({ enableAI = true }) => {
  const [open, setOpen] = useState(false);
  const { cnPrice } = useCoalNationwideData();

  // 解析数据
  const parsed = useCnStock(cnPrice);
  const { tableRows = [], hbRow, columnsMeta = [] } = useCnStockTableModel(parsed) ?? {};

  const title = parsed?.title ?? '';
  const unitText = parsed?.unit ?? '';
  const sourceText = parsed?.source ?? '';

  // 图表数据
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

  // 表格列
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
      align: 'center',
      render: (v: unknown) => {
        const num = Number(v);
        return Number.isFinite(num) ? fmt(num) : '—';
      },
    }));

    return [leftCol, ...dataCols];
  }, [columnsMeta]);

  const hbLabel: string = (hbRow?.['日期'] as string) || '';

  // 弹层挂载容器（如需挂 body，可在 Modal 传 portalToBody）
  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div ref={containerRef} className={cx(styles.card, styles['card--panel'])}>
      {/* 弹层（AntD Modal 风格的自实现） */}
      <ElevateModal
        open={open}
        onClose={() => setOpen(false)}
        portalToBody
        width="85vw"
        // height="80vh"
        // closeIcon={<YourIcon />}
      >
        <PricePanel
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

      {/* 页面内常规视图（非弹层） */}
      <div className={styles.card__head}>
        <IconTitle title={title} />
        <div className={styles.card__meta}>
          <div className={styles.card__meta_item}>
            <span className={styles.unit}>
              {unitText} | {sourceText}
            </span>
            <FullscreenOutlined
              className={styles['icon-fullscreen']}
              onClick={() => setOpen(true)}
            />
          </div>
        </div>
      </div>

      <div className={styles.card__box}>
        <EChart ariaLabel="全国煤炭价格折线图" option={option} />
        <Table<TableRow>
          className={cx(styles.table, styles['table--compact'])}
          size="small"
          pagination={false}
          rowKey="key"
          columns={cols}
          dataSource={tableRows}
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
                    let dir: 'up' | 'down' | 'flat' = 'flat';
                    if (num > 0) dir = 'up';
                    else if (num < 0) dir = 'down';

                    return (
                      <Table.Summary.Cell
                        key={c.name}
                        index={idx + 1}
                        align="center"
                        className={styles['summary-cell-hb-bg']}
                      >
                        <span className={cx(styles.delta, styles[`delta--${dir}`])}>
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

export default Price;
