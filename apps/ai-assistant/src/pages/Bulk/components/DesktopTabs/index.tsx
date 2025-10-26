import React, { memo } from 'react';
import type { CSSProperties } from 'react';
import styles from './index.module.less';
import { cx } from '@/utils/utils';

export interface SegmentItem {
  /** 选项唯一 key */
  key: string;
  /** 选项显示内容 */
  label: React.ReactNode;
  /** 是否禁用 */
  disabled?: boolean;
}

export interface DesktopTabsProps {
  /** 当前激活的 key */
  value?: string;
  /** 选项列表 */
  items: readonly SegmentItem[];
  /** 切换回调 */
  onChange?: (key: string) => void;
  /** 自定义类名（透传给根节点） */
  className?: string;
  /** 自定义内联样式（透传给根节点） */
  style?: CSSProperties;
}

const DesktopTabs: React.FC<DesktopTabsProps> = memo(
  ({ value, items, onChange, className, style }) => {
    const safeItems = Array.isArray(items) && items.length > 0 ? items : [];

    return (
      <div className={cx(styles['desktop-tabs'], className)} style={style}>
        <ul className={styles['desktop-tabs__list']}>
          {safeItems.map((it) => {
            const active = value === it.key;
            const disabled = !!it.disabled;

            return (
              <li
                key={it.key}
                className={cx(
                  styles['desktop-tabs__item'],
                  active && styles['desktop-tabs__item--active'],
                  disabled && styles['desktop-tabs__item--disabled'],
                )}
                role="button"
                aria-pressed={active}
                aria-disabled={disabled}
                tabIndex={disabled ? -1 : 0}
                onClick={() => {
                  if (!disabled) onChange?.(it.key);
                }}
              >
                <span className={styles['desktop-tabs__label']}>{it.label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  },
);

DesktopTabs.displayName = 'DesktopTabs';
export default DesktopTabs;
export type { SegmentItem as DesktopTabsItem };
