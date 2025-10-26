import React, { useState } from 'react';
import {
  ApartmentOutlined,
  DownOutlined,
  FolderOpenOutlined,
  HomeOutlined,
  RightOutlined,
} from '@yth/icons';
import styles from './index.module.less';
import classNames from 'classnames';

interface TreeItemProps {
  title: string;
  id: string;
  departmentId?: string;
  children?: Array<TreeItemProps>; // 修改这里
  defaultExpanded?: boolean;
  hasAddButton?: boolean;
  onToggle?: (path: Array<{ id: string; departmentId?: string }>, expanded: boolean) => void; // 修改这里
  path?: Array<{ id: string; departmentId?: string }>; // 修改这里
  onSelect?: (id: string, path: Array<{ id: string; departmentId?: string }>) => void; // 修改这里
  selectedId?: string;
}

const TreeItem: React.FC<TreeItemProps> = ({
  title,
  id,
  departmentId,
  children = [],
  defaultExpanded = false,
  onToggle,
  path = [],
  onSelect,
  selectedId, // 使用 selectedId 替代 isSelected
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const currentPath = [...path, { id, departmentId }];
  // 判断当前节点是否被选中（只比较ID）
  const isSelected = selectedId === id;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    onToggle?.(currentPath, newExpanded);
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(id, currentPath);
  };

  const renderIcon = () => {
    if (title.endsWith('公司') || title.endsWith('集团')) {
      return <HomeOutlined />;
    }
    if (title.includes('部门')) {
      return <ApartmentOutlined />;
    }
    return <FolderOpenOutlined />;
  };

  return (
    <div className={styles.treeItem}>
      <div
        className={classNames(styles.treeItemHeader, {
          [styles.selected]: isSelected,
        })}
        onClick={handleSelect}
      >
        <div className={styles.treeItemTitle}>
          {renderIcon()}
          <span className={styles.treeItemTitleText} title={title}>
            {title}
          </span>
        </div>
        <div className={styles.treeItemExpand} onClick={handleToggle}>
          {children.length > 0 &&
            (expanded ? (
              <DownOutlined className={styles.expandIcon} />
            ) : (
              <RightOutlined className={styles.expandIcon} />
            ))}
        </div>
      </div>
      {expanded && children.length > 0 && (
        <div className={styles.treeItemChildren}>
          {children.map((item, index) => (
            <TreeItem
              key={`${item.id}-${index}`}
              {...item}
              path={currentPath}
              onToggle={onToggle}
              onSelect={onSelect}
              selectedId={selectedId} // 传递 selectedId 而不是 isSelected
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeItem;
