import { SearchOutlined } from '@yth/icons';
import { Button } from '@yth/ui';
import React, { FC, useState } from 'react';
import styles from './index.module.less';
interface SearchProps {
  type?: 'text' | 'number';
  placeholder?: string;
  onSearch?: (value: string) => void;
}
const Search: FC<SearchProps> = ({ type = 'text', placeholder, onSearch }) => {
  const [value, setValue] = useState('');
  const onkeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value) {
      onSearch?.(value);
    }
  };
  return (
    <div className={styles.search}>
      <input
        className={styles.input}
        type={type}
        placeholder={placeholder}
        onKeyDown={onkeydown}
        onChange={(e) => setValue(e.target.value)}
      />
      <Button
        type={'text'}
        icon={<SearchOutlined />}
        disabled={!value}
        onClick={() => onSearch?.(value)}
      />
    </div>
  );
};

export default Search;
