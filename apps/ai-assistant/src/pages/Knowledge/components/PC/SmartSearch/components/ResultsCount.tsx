import React from 'react';
import './ResultsCount.less';

interface ResultsCountProps {
  count: number;
}

const ResultsCount: React.FC<ResultsCountProps> = ({ count }) => {
  return <div className="results-count">为您找到{count}条数据</div>;
};

export default ResultsCount;
