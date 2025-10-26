import React from 'react';
import { LeftOutlined } from '@yth/icons';
import './SearchHeader.less';

interface SearchHeaderProps {
  onBack?: () => void;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({ onBack }) => {
  return (
    <div className="search-header">
      <div className="header-left" onClick={onBack}>
        <LeftOutlined className="back-icon" />
        <span className="page-title">智能内搜</span>
      </div>
    </div>
  );
};

export default SearchHeader;
