import React, { memo } from 'react';
import styles from './index.module.less';
import { isNonEmptyArray, safeStr } from '@/utils/utils';

/** 单列定义 */
export interface SimpleColumn<RecordType = any> {
  /** 表头标题（必填） */
  title: React.ReactNode;
  /** 取值路径：支持 'a.b.c' */
  dataIndex?: string;
  /** 自定义渲染：优先级高于 dataIndex */
  render?: (value: any, record: RecordType, rowIndex: number) => React.ReactNode;
  /** 列宽（可选） */
  width?: number | string;
  /** 对齐（可选） */
  align?: 'left' | 'center' | 'right';
  /** 额外类名（可选） */
  className?: string;
}

/** 组件 Props */
export interface SimpleTableProps<RecordType = any> {
  className?: string;
  style?: React.CSSProperties;
  /** 数据源 */
  rows: RecordType[];
  /** 列配置（动态表头 & 取值） */
  columns: Array<SimpleColumn<RecordType>>;
  /** 空状态文案 */
  emptyText?: React.ReactNode;
}

/** 轻量表格（动态列 + 动态取值） */
function SimpleTable<RecordType = any>({
  className,
  style,
  rows,
  columns,
  emptyText = '暂无数据',
}: SimpleTableProps<RecordType>) {
  /** 安全取值：支持 a.b.c 路径 */
  const getByPath = (obj: any, path?: string) => {
    if (!path) return undefined;
    return path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
  };

  return (
    <div className={className} style={style}>
      <div className={styles.table}>
        {/* 表头 */}
        <div
          className={styles.thead}
          style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}
        >
          {isNonEmptyArray(columns) &&
            columns.map((col, ci) => (
              <div
                key={`th-${ci}`}
                className={col.className}
                style={{
                  width: col.width,
                  textAlign: col.align,
                }}
                title={typeof col.title === 'string' ? col.title : undefined}
              >
                {col.title}
              </div>
            ))}
        </div>

        {/* 表体 */}
        <div className={styles.tbody}>
          {isNonEmptyArray(rows) ? (
            rows.map((record, ri) => (
              <div
                className={styles.tr}
                key={`row-${ri}`}
                style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}
              >
                {columns.map((col, ci) => {
                  const value = col.render
                    ? col.render(getByPath(record, col.dataIndex), record, ri)
                    : safeStr(getByPath(record, col.dataIndex));
                  return (
                    <div
                      key={`td-${ri}-${ci}`}
                      style={{ width: col.width, textAlign: col.align }}
                      className={col.className}
                    >
                      {value}
                    </div>
                  );
                })}
              </div>
            ))
          ) : (
            <div className={styles.empty}>{emptyText}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(SimpleTable) as typeof SimpleTable;
