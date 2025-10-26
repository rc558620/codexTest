// src/App.tsx
import React from 'react';
import AssistantsList from './components/AssistantsList';
import { AssistantItem } from './assistant';

const DATA: AssistantItem[] = [
  {
    id: 'writer',
    title: 'AI写作',
    author: '@李白',
    description: '快速生成、优化和校对文本，提升写作效率与质量',
    icon: { name: 'edit', gradient: 'gradient-blue' },
    tags: [{ label: '标签1' }, { label: '标签2' }, { label: '标签3' }],
  },
  {
    id: 'minutes',
    title: '会议纪要生成助手',
    author: '@李白',
    description: '提炼会议录音文件要点，按模板生成纪要',
    icon: { name: 'globe', gradient: 'gradient-orange' },
    tags: [{ label: '标签1' }, { label: '标签2' }, { label: '标签3' }],
  },
  {
    id: 'finance',
    title: '财报指标查询助手',
    author: '@李白',
    description: '通过自然语言快速检索财务数据并生成可视化分析',
    icon: { name: 'chart', gradient: 'gradient-purple' },
    tags: [{ label: '标签1' }, { label: '标签2' }, { label: '标签3' }],
  },
  {
    id: 'commodity',
    title: '大宗原材料行情助手',
    author: '@李白',
    description: '分析大宗原材料价格走势，提供行情洞察与决策',
    icon: { name: 'trend', gradient: 'gradient-cyan' },
    tags: [{ label: '标签1' }, { label: '标签2' }, { label: '标签3' }],
  },
  {
    id: 'meeting-room',
    title: '会议室助手',
    author: '@李白',
    description: '通过问答的形式完成会议预定及发起',
    icon: { name: 'calendar', gradient: 'gradient-indigo' },
    tags: [{ label: '标签1' }, { label: '标签2' }, { label: '标签3' }],
  },
  {
    id: 'todo',
    title: '待办生成助手',
    author: '@李白',
    description: '从附件与会议记录中提取待办事项并同步OA',
    icon: { name: 'todo', gradient: 'gradient-amber' },
    tags: [{ label: '标签1' }, { label: '标签2' }, { label: '标签3' }],
  },
];

const Applys: React.FC = () => {
  return <AssistantsList items={DATA} data-testid="ai-assistants" />;
};

export default Applys;
