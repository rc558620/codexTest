import React from 'react';
import EChart from '../../../../../Echart';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import IconTitle from '../../../../../IconTitle';
import { fmt } from '@/components/types';
import { getDirectionIcon } from '../../coalPriceOption';
import type { TableRow } from '../../../../../hooks/useCnStock';
import styles from '../../../../../desktop.module.less';
import { cx } from '@/utils/utils';

export interface PricePanelProps {
  option: any;
  cols: ColumnsType<TableRow>;
  tableRows: TableRow[];
  hbLabel: string;
  columnsMeta: Array<{ name: string }>;
  title: string;
  unitText: string;
  sourceText: string;
}

const PricePanel: React.FC<PricePanelProps> = ({
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
      <div className={styles.card__head}>
        <IconTitle title={title} />
        <div className={styles.card__meta}>
          <div className={styles.card__meta_item}>
            <span className={cx(styles.unit, styles['panel-unit'])}>
              {unitText} | {sourceText}
            </span>
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
            hbLabel ? (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell
                    index={0}
                    align="center"
                    className={styles['summary-cell-hb-bg']}
                  >
                    <span className={styles.hb_color}>{hbLabel}</span>
                  </Table.Summary.Cell>
                  {columnsMeta.map((c, idx) => {
                    // 与原实现一致：第 3 行做“环比”
                    const hbRow = (tableRows?.[2] ?? {}) as any;
                    const raw = hbRow?.[c.name];
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
    </>
  );
};

export default PricePanel;
