import React from 'react';

import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { fmt } from '@/components/types';
import IconTitle from '@/pages/Bulk/components/IconTitle';
import EChart from '@/pages/Bulk/components/Echart';
import { getDirIcon, toDir } from '../../yngxH2so4Option';
import styles from '../../../../../desktop.module.less';

export interface YnGxH2SO4PricePanelProps {
  option: any;
  cols: ColumnsType<Record<string, any>>;
  tableRows: Array<Record<string, any>>;
  hbLabel: string;
  columnsMeta: Array<{ name: string; badge?: string }>;
  title: string;
  unitText: string;
  sourceText: string;
  hbRow?: Record<string, any>;
}

const YnGxH2SO4PricePanel: React.FC<YnGxH2SO4PricePanelProps> = ({
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
              {unitText} | {sourceText}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.cardBox}>
        <EChart ariaLabel="云南及广西98%硫酸价格" option={option} />

        <Table<Record<string, any>>
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
                    const src = (hbRow ?? (tableRows?.[2] as any)) || {};
                    const raw = src?.[c.name];
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
    </>
  );
};

export default YnGxH2SO4PricePanel;
