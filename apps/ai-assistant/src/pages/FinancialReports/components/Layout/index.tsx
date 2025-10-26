import React from 'react';
import cn from 'classnames';
import styles from './index.module.less';

export interface LayoutProps {
  /** 自定义类名（可覆盖） */
  className?: string;
  /** 内联样式覆盖 */
  style?: React.CSSProperties;
  /** 左侧内容（侧栏） */
  sidebar: React.ReactNode;
  /** 主区域内容 */
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ className, style, sidebar, children }) => {
  return (
    <div className={cn(styles.layout, className)} style={style}>
      <aside className={styles.aside}>{sidebar}</aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
};

export default Layout;
