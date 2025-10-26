import React, { useState } from 'react';
import { SearchOutlined } from '@yth/icons';
import './SearchInput.less';

interface SearchInputProps {
  value?: string;
  placeholder?: string;
  onSearch?: (value: string) => void;
  onChange?: (value: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value = '',
  placeholder = '请输入搜索关键词',
  onSearch,
  onChange,
}) => {
  const [inputValue, setInputValue] = useState(value);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch?.(inputValue);
    }
  };

  return (
    <div className="search-input-container">
      <div className="search-input-wrapper">
        <SearchOutlined className="search-icon" />
        <input
          type="text"
          className="search-input"
          value={inputValue}
          placeholder={placeholder}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
        />
      </div>
    </div>
  );
};

export default SearchInput;
