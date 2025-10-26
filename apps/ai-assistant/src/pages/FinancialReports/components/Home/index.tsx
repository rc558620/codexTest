import React, { useRef } from 'react';
import HeaderTitle from './components/HeaderTitle';
import DatasetPreview, { DatasetPreviewDrawerRef } from './components/DatasetPreview';
import styles from './index.module.less';
import QueryPanel from './components/QueryPanel';
import { mockPreview } from '../../mock';
import DatasetCard from './components/DatasetCard';

interface FinancialReportsIndexProps {}

const FinancialReportsIndex: React.FC<FinancialReportsIndexProps> = () => {
  const drawerRef = useRef<DatasetPreviewDrawerRef>(null);
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        {/* 顶部标题区（机器人图标 + 标题 + 副标题） */}
        <HeaderTitle
          title="财报指标查询助手"
          subtitle="快速查询和解读财报核心指标的专业工具，助您轻松掌握企业财务健康状况"
        />
      </div>
      <div className={styles.contentRow}>
        <div className={styles.contentCol}>
          {/* 数据集卡片 */}
          <DatasetCard />
        </div>
      </div>
      <div className={styles.queryRow}>
        {/* 查询面板（选择数据集后提问） */}
        <QueryPanel openDataset={() => drawerRef.current?.open()} />
      </div>
      <DatasetPreview ref={drawerRef} data={mockPreview} />
    </div>
  );
};

export default FinancialReportsIndex;
