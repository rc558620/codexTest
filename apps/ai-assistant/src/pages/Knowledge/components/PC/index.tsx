import React, { lazy, Suspense, useState } from 'react';
import styles from './index.module.less';
import './common.less';
import LeftAside from './LeftAside';
import { Action } from './types';
import Knowledge from './LeftAside/knowledge';
import { Spin } from '@yth/ui';

// 定义统一的组件 Props 类型
interface ComponentProps<T = any> {
  // key?: React.Key;
  params?: T;
  onChangeToMainContent?: (action: Action, params?: T) => void;
}
interface IComponentMap {
  [key: string]: React.ComponentType<ComponentProps>;
}

const componentMap: IComponentMap = {
  MainContent: lazy(() => import('./AiContent')),
  InnovationSpace: lazy(() => import('./InnovationSpace')),
  AiRequest: lazy(() => import('./AiRequest')),
  KnowledgeRepositoryAsk: lazy(() => import('./KnowledgeRepositoryAsk')),
  KnowledgeRepository: lazy(() => import('./KnowledgeRepository')),
  RecentConversations: lazy(() => import('./RecentConversations')),
  KnowledgeRepositoryDetail: lazy(() => import('./KnowledgeRepositoryDetail')),
  SmartSearch: lazy(() => import('./SmartSearch')),
};

type ComponentKey = keyof typeof componentMap;
const Loading = () => (
  <div className={styles.loading}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '20px', height: '20px' }}>
        <Spin size="small" />
      </div>
      <span style={{ marginTop: '10px' }}>加载中...</span>
    </div>
  </div>
);
const AiAssistantPage: React.FC = () => {
  const [action, setAction] = useState<Action>('MainContent');
  const [params, setParams] = useState<any>(null);

  const onChange = (a: Action, p?: any) => {
    p && setParams(p);
    setAction(a);
  };

  const CurrentComponent =
    action in componentMap ? componentMap[action as ComponentKey] : componentMap.MainContent;
  const componentKey = action + (params ? `-${JSON.stringify(params)}` : '');
  return (
    <div className={styles['ai-assistant-page']}>
      <LeftAside onChangeToMainContent={onChange} />
      <div className={styles['animation-wrapper']}>
        {['KnowledgeRepository', 'KnowledgeRepositoryDetail'].includes(action) && (
          <Knowledge onChangeToMainContent={onChange} />
        )}
        <Suspense fallback={Loading()}>
          <div key={componentKey} className={styles['animation-content']}>
            <CurrentComponent params={params} onChangeToMainContent={onChange} />
          </div>
        </Suspense>
      </div>
    </div>
  );
};

export default AiAssistantPage;
