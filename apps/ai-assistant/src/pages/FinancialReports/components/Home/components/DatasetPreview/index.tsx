import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import Chip from './components/Chip';
import SimpleTable, { SimpleColumn } from '../../../SimpleTable';
import styles from './index.module.less';
import { isNonEmptyArray, safeStr } from '@/utils/utils';
import { DatasetFieldRow, DatasetPreview } from './types';
import FinancialReportsDrawer from '../../../FinancialReportsDrawer';

/** 组件 Props：不再要求外部传 open；data 可作为初始值 */
export interface DatasetPreviewDrawerProps {
  /** 初始数据，可选，后续也可通过 ref.setData / ref.open({data}) 变更 */
  data?: DatasetPreview;
  /** 可选：关闭回调（命令式 close 或点击遮罩/× 时触发） */
  onClose?: () => void;
  /** 可选：可见性变化回调 */
  onOpenChange?: (open: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
}

/** 暴露给父组件的命令式 API */
export interface DatasetPreviewDrawerRef {
  /** 打开抽屉；可选地带入一份 data 覆盖当前展示数据 */
  open: (opts?: { data?: DatasetPreview }) => void;
  /** 关闭抽屉 */
  close: () => void;
  /** 当前是否打开 */
  isOpen: () => boolean;
  /** 直接设置数据（不改变开合状态） */
  setData: (next: DatasetPreview) => void;
  /** 将内容滚动到顶部（平滑） */
  scrollToTop: () => void;
  /** 获取内容根节点（测量/聚焦） */
  getRoot: () => HTMLDivElement | null;
}

/** 数据集预览（抽屉内容）——内置可见性，通过 ref.open() 打开 */
const DatasetPreviewDrawer = forwardRef<DatasetPreviewDrawerRef, DatasetPreviewDrawerProps>(
  ({ data, onClose, onOpenChange, className, style }, ref) => {
    const [visible, setVisible] = useState(false);
    const [innerData, setInnerData] = useState<DatasetPreview | undefined>(data);
    const bodyRootRef = useRef<HTMLDivElement>(null);

    const columns: Array<SimpleColumn<DatasetFieldRow>> = [
      { title: '名称', dataIndex: 'name' },
      { title: '编码', dataIndex: 'code', className: styles.mono },
      { title: '数据类型', dataIndex: 'dataType' },
      { title: '描述', dataIndex: 'desc', className: styles.desc },
    ];

    const emitOpenChange = useCallback(
      (next: boolean) => {
        onOpenChange?.(next);
      },
      [onOpenChange],
    );

    const doOpen = useCallback(
      (opts?: { data?: DatasetPreview }) => {
        if (opts?.data) setInnerData(opts.data);
        setVisible(true);
        emitOpenChange(true);
      },
      [emitOpenChange],
    );

    const doClose = useCallback(() => {
      setVisible(false);
      emitOpenChange(false);
      onClose?.();
    }, [emitOpenChange, onClose]);

    useImperativeHandle(
      ref,
      () => ({
        open: doOpen,
        close: doClose,
        isOpen: () => visible,
        setData: (next) => setInnerData(next),
        scrollToTop: () => {
          const el = bodyRootRef.current;
          if (!el) return;
          // 滚自己
          el.scrollTo?.({ top: 0, behavior: 'smooth' });
          // 再尝试滚抽屉内部可滚区域（不同实现下兜底）
          el.closest('[role="dialog"]')?.querySelector<HTMLElement>(`.${styles.body}`)?.scrollTo?.({
            top: 0,
            behavior: 'smooth',
          });
        },
        getRoot: () => bodyRootRef.current,
      }),
      [doOpen, doClose, visible],
    );

    return (
      <FinancialReportsDrawer
        open={visible}
        onClose={doClose}
        title="数据集预览"
        placement="right"
        size={720}
        className={className}
        style={style}
        bodyClassName={styles.body}
      >
        <div ref={bodyRootRef}>
          {/* 数据集名 */}
          <div className={styles.datasetName}>{safeStr(innerData?.datasetName)}</div>

          {/* 推荐问题 */}
          {isNonEmptyArray(innerData?.recommendedQueries) && (
            <div className={styles.recommendRow}>
              <span className={styles.label}>推荐问题：</span>
              <div className={styles.chips}>
                {innerData!.recommendedQueries.map((q, i) => (
                  <Chip text={q} key={`chip-${i}`} />
                ))}
              </div>
            </div>
          )}

          {/* 表格 */}
          <SimpleTable rows={innerData?.fields ?? []} columns={columns} />
        </div>
      </FinancialReportsDrawer>
    );
  },
);

DatasetPreviewDrawer.displayName = 'DatasetPreviewDrawer';

export default DatasetPreviewDrawer;
