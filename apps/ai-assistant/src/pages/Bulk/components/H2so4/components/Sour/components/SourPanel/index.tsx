import React from 'react';

import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { fmt } from '@/components/types';
import { TableRow } from '@/pages/Bulk/components/hooks/useCnStock';
import IconTitle from '@/pages/Bulk/components/IconTitle';
import EChart from '@/pages/Bulk/components/Echart';
import { arrow, dirClass } from '../../sourOption';
import styles from '../../../../../desktop.module.less';

export interface SourPanelProps {
  option: any;
  cols: ColumnsType<TableRow>;
  tableRows: TableRow[];
  hbLabel: string;
  columnsMeta: Array<{ name: string; badge?: string }>;
  title: string;
  unitText: string;
  sourceText: string;
  /** 可选：直接传入 hbRow；不传则回退到 tableRows[2] */
  hbRow?: Record<string, unknown>;
}

const SourPanel: React.FC<SourPanelProps> = ({
  option,
  cols,
  tableRows,
  hbLabel,
  columnsMeta,
  title,
  unitText,
  sourceText,
  hbRow,
}) => {
  return (
    <>
      <div className={styles.cardHead}>
        <IconTitle title={title} />
        <div className={styles.cardMeta}>
          <div className={styles.cardMetaItem}>
            <span className={`${styles.unit} ${styles.panelUnit}`}>
              {unitText} {sourceText}
            </span>
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
            hbLabel ? (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} align="center" className={styles.summaryCellHbBg}>
                    <span className={styles.hbColor}>{hbLabel}</span>
                  </Table.Summary.Cell>

                  {columnsMeta.map((c, idx) => {
                    const sourceRow = (hbRow ?? (tableRows?.[2] as any)) || {};
                    const raw = sourceRow?.[c.name];
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
                              {arrow(num)} {fmt(Math.abs(num))}
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
    </>
  );
};

export default SourPanel;
