import React from 'react';

import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { fmt } from '@/components/types';
import IconTitle from '@/pages/Bulk/components/IconTitle';
import EChart from '@/pages/Bulk/components/Echart';
import { TableRow } from '@/pages/Bulk/components/hooks/useCnStock';
import { getDirectionIcon } from '../../nh3PriceOption';
import styles from '../../../../../desktop.module.less';
import { dirOf } from '@/utils/utils';

export interface Nh3PricePanelProps {
  option: any;
  cols: ColumnsType<TableRow>;
  tableRows: TableRow[];
  hbLabel: string;
  columnsMeta: Array<{ name: string }>;
  title: string;
  unitText: string;
  sourceText: string;
}

const Nh3PricePanel: React.FC<Nh3PricePanelProps> = ({
  option,
  cols,
  tableRows,
  hbLabel,
  columnsMeta,
  title,
  unitText,
  sourceText,
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
        <EChart ariaLabel="合成氨/尿素价格折线图" option={option} />

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
                    // 第3行为“周环比/对比”，如无可切到外部传入 hbRow
                    const hb = (tableRows?.[2] ?? {}) as any;
                    const raw = hb?.[c.name];
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
    </>
  );
};

export default Nh3PricePanel;
