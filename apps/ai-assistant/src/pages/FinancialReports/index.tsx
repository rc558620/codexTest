import React from 'react';
import Layout from './components/Layout';
import Sidebar from './components/Sidebar';
import { mockNav } from './mock';
import FinancialReportsIndex from './components/Home';
import Chat from './components/Chat';

/** 页面：财报指标查询助手（PC）
 *  父组件中引用子组件均添加中文注释说明用途（遵循你的编码约定）
 */
const FinancialReports: React.FC = () => {
  return (
    <div className="container">
      {/* 页面栅格布局容器 */}
      <Layout
        sidebar={
          <>
            {/* 左侧侧栏（Logo/按钮/最近对话） */}
            <Sidebar nav={mockNav} />
          </>
        }
      >
        <FinancialReportsIndex />
        {/* <Chat /> */}
      </Layout>
    </div>
  );
};

export default FinancialReports;
