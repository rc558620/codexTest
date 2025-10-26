// src/components/AssistantsList/index.tsx
import React from 'react';
import styles from './index.module.less';
import type { AssistantsListProps, AssistantItem } from '../../assistant';
import AssistantCard from '../AssistantCard';
import { safeStr } from '@/utils/utils';

/**
 * 助手列表组件（容器）
 * - 仅负责布局与遍历渲染
 */
const AssistantsList: React.FC<AssistantsListProps> = (props) => {
  const testId = safeStr(props['data-testid'] ?? 'assistants-list');

  const items = Array.isArray(props.items) ? props.items : [];
  const hasItems = items.length > 0;

  return (
    <main className={styles.page} data-testid={testId}>
      <section className={styles.wrap} aria-label="AI 助手列表">
        {hasItems
          ? items.map((item: AssistantItem, index: number) => {
              const key = safeStr(item?.id) || `assistant-item-${index}`;
              return <AssistantCard key={key} item={item} />;
            })
          : null}
      </section>
    </main>
  );
};

export default AssistantsList;
