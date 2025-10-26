import { FC, useEffect, useState } from 'react';
import styles from './knowledge.module.less';
import TreeItem from './components/TreeItem';
import { knowledgeGroupList } from '@/pages/Knowledge/api';
import { Action } from '../types';
import classNames from 'classnames';

interface KnowledgeProps {
  onChangeToMainContent: (
    action: Action,
    params?: { id?: string; departmentId?: string; type: 'person' | 'company' },
  ) => void;
}

interface KnowledgeTree {
  title: string;
  id: string;
  departmentId?: string;
  catalogueId?: string;
  departmentName: string;
  name: string;
  group?: KnowledgeTree | null;
  children: KnowledgeTree[];
}
const normizeTree = (tree: KnowledgeTree[]) => {
  return transferTree(
    tree.map((item) => ({
      ...item,
      group: null,
      children: item.group ? item.group.children : item.children,
      catalogueId: item.group?.catalogueId || item.catalogueId,
    })),
  );
};
const transferTree = (tree: KnowledgeTree[]) => {
  return tree.map((item) => {
    const newItem = {
      ...item,
      title: item.name || item.departmentName,
      id: item.catalogueId || '',
    };

    if (newItem.children) {
      newItem.children = transferTree(newItem.children);
    }

    return newItem;
  });
};

const Knowledge: FC<KnowledgeProps> = ({ onChangeToMainContent }) => {
  const [knowledgeTree, setExpandedSections] = useState<KnowledgeTree[]>([]);
  useEffect(() => {
    knowledgeGroupList().then((res) => {
      setExpandedSections(normizeTree(res));
    });
    onPersonSelect();
  }, []);
  const [checkTitle, setCheckTile] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState('');

  /**
   * @description: 选择公司知识库
   * @param {string} id
   * @param {Array<{ id: string; departmentId?: string }>} path
   * @return {*}
   */
  const onSelect = (id: string, path: Array<{ id: string; departmentId?: string }>) => {
    setSelectedId(id);
    setCheckTile(false);

    onChangeToMainContent('KnowledgeRepository', {
      id,
      departmentId: path[0]?.departmentId || '',
      type: 'company',
    });
  };

  /**
   * @description: 选择个人知识库
   * @return {*}
   */
  const onPersonSelect = () => {
    setCheckTile(true);
    setSelectedId('');
    onChangeToMainContent('KnowledgeRepository', {
      type: 'person',
    });
  };
  return (
    <div className={styles.knowledge}>
      <div className={styles['sub-sections-wrap']}>
        {/* <div className="sub-section-bg" /> */}
        <div className={styles['sub-sections']}>
          <div className={styles['sub-section-title']}>企业知识库</div>
          {knowledgeTree.map((item, index) => (
            <TreeItem key={index} {...item} selectedId={selectedId} onSelect={onSelect} />
          ))}
        </div>
        <div className={classNames(styles['sub-sections'], checkTitle && styles['title-active'])}>
          <div className={styles['sub-section-title']} onClick={onPersonSelect}>
            个人知识库
          </div>
          {/* {knowledgeTree.map((item, index) => (
            <TreeItem key={index} {...item} defaultExpanded />
          ))} */}
        </div>
      </div>
    </div>
  );
};

export default Knowledge;
