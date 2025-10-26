import React, { FC } from 'react';
import AiAssistantPage from './components/PC';

const KnowledgeDashboard: React.FC = () => {
  return <AiAssistantPage />;
};
const Mobile: FC = () => <span>移动端模式</span>;

const ExternalCustomCard = KnowledgeDashboard as typeof KnowledgeDashboard & {
  Mobile: typeof Mobile;
};
ExternalCustomCard.Mobile = Mobile;
export default KnowledgeDashboard;
