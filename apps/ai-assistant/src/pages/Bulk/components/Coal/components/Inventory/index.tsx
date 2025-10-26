// src/pages/Bulk/Desktop/Coal/CoalDesktop/components/Inventory/index.tsx
import React, { useMemo, useRef, useState } from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { fmt } from '@/components/types';
import { FullscreenOutlined } from '@yth/icons';
import { buildInventoryOption, getDirectionSymbol } from './inventoryOption';
import { TableRow, useCnStock, useCnStockTableModel } from '../../../hooks/useCnStock';
import { useCoalNationwideData } from '../../../context/coalNationwideContext';
import InventoryPanel from './components/InventoryPanel';
import ElevateModal from '../../../ElevateModal';
import EChart from '../../../Echart';
import IconTitle from '../../../IconTitle';
import styles from '../../../desktop.module.less';
import { cx, dirOf } from '@/utils/utils';

const Inventory: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { cnStock } = useCoalNationwideData();

  // 解析后端块
  const parsed = useCnStock(cnStock);
  const { tableRows = [], hbRow, columnsMeta = [] } = useCnStockTableModel(parsed) ?? {};

  // 文案
  const title = parsed?.title ?? '';
  const unitText = parsed?.unit ?? '';
  const sourceText = parsed?.source ?? '';

  // 图表数据
  const datesForChart = useMemo(
    () => (Array.isArray(parsed?.dates) ? parsed!.dates! : []),
    [parsed],
  );
  const stacksForChart = useMemo(
    () => (Array.isArray(parsed?.stacks) ? parsed!.stacks! : []),
    [parsed],
  );
  const legendOrder = useMemo(
    () =>
      Array.isArray(parsed?.legendOrder) ? parsed!.legendOrder! : stacksForChart.map((s) => s.name),
    [parsed, stacksForChart],
  );

  const option = useMemo(
    () =>
      buildInventoryOption({
        dates: datesForChart,
        stacks: stacksForChart,
        legendOrder,
        smooth: true,
      }),
    [datesForChart, stacksForChart, legendOrder],
  );

  // 表头
  const cols: ColumnsType<TableRow> = useMemo(() => {
    const leftCol: ColumnsType<TableRow>[number] = {
      title: <div style={{ padding: '9.5px 0' }}>日期</div>,
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

  // 弹层容器（如需挂 body，用 portalToBody）
  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div ref={containerRef} className={cx(styles.card, styles['card--panel'])}>
      {/* 弹层（AntD Modal 风格） */}
      <ElevateModal
        open={open}
        onClose={() => setOpen(false)}
        portalToBody
        width="85vw"
        // height="80vh"
      >
        <InventoryPanel
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
        <EChart ariaLabel="八港库存堆叠面积图" option={option} />

        <Table<TableRow>
          className={cx(styles.table, styles['table--compact'])}
          size="small"
          pagination={false}
          columns={cols}
          dataSource={tableRows}
          rowKey="key"
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
                    const dir = dirOf(num);
                    return (
                      <Table.Summary.Cell
                        key={c.name}
                        index={idx + 1}
                        align="center"
                        className={styles['summary-cell-hb-bg']}
                      >
                        <span className={cx(styles.delta, styles[`delta--${dir}`])}>
                          {getDirectionSymbol(dir)} {dir !== 'flat' && fmt(Math.abs(num))}
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

export default Inventory;
