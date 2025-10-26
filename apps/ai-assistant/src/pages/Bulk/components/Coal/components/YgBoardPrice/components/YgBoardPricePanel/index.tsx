import React from 'react';
import EChart from '../../../../../Echart';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import IconTitle from '../../../../../IconTitle';
import { fmt } from '@/components/types';
import { getDirectionIcon } from '../../ygPlatePriceOption';
import type { TableRow } from '../../../../../hooks/useCnStock';
import styles from '../../../../../desktop.module.less';
import { cx, dirOf } from '@/utils/utils';

export interface YgBoardPricePanelProps {
  option: any;
  cols: ColumnsType<TableRow>;
  tableRows: TableRow[];
  hbLabel: string;
  columnsMeta: Array<{ name: string }>;
  title: string;
  unitText: string;
  sourceText: string;
}

const YgBoardPricePanel: React.FC<YgBoardPricePanelProps> = ({
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
        <EChart ariaLabel="云贵看板价格" option={option} />

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
                    // 第3行为环比/对比
                    const hb = (tableRows?.[2] ?? {}) as any;
                    const raw = hb?.[c.name];
                    const num = Number(raw);
                    const valid = Number.isFinite(num);
                    const dir = valid ? dirOf(num) : 'flat';

                    return (
                      <Table.Summary.Cell
                        key={c.name}
                        index={idx + 1}
                        align="center"
                        className={styles['summary-cell-hb-bg']}
                      >
                        {valid ? (
                          <span className={cx(styles.delta, styles[`delta--${dir}`])}>
                            {getDirectionIcon(dir)} {dir !== 'flat' && fmt(Math.abs(num))}
                          </span>
                        ) : (
                          <span className={styles.delta}>—</span>
                        )}
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

export default YgBoardPricePanel;
