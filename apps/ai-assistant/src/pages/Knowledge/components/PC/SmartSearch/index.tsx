import React, { useEffect, useState } from 'react';
import { message, Spin } from 'antd';
import SearchHeader from './components/SearchHeader';
import SearchInput from './components/SearchInput';
import ResultsCount from './components/ResultsCount';
import ResultCard, { SearchResult } from './components/ResultCard';
import './index.less';

const SmartSearch: React.FC = () => {
  const [searchKeyword, setSearchKeyword] = useState('人工智能');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 模拟搜索结果数据
  const mockResults: SearchResult[] = [
    {
      id: '1',
      title: '这里展示人工智能文章的标题',
      company: '云天化股份有限公司',
      department: '财务部',
      uploader: '某某上传',
      uploadTime: '2025/9/2 14:13',
      content:
        '这里显示人工智能文章的具体内容,高亮显示关键字,这里显示人工智能文章的具体内容,高亮显示关键字这里显示人工智能文章的具体内容,高亮显示关键字这里显示人工智能文章的具体内容,这里显示人工智能文章的具体内容,高亮显示关键字,这里显示人工智能文章的具体内容,高亮显示关键字这里显示人工智能文章的。',
      highlightKeywords: ['人工智能'],
    },
    {
      id: '2',
      title: '这里展示人工智能文章的标题',
      company: '云天化股份有限公司',
      department: '财务部',
      uploader: '某某上传',
      uploadTime: '2025/9/2 14:13',
      content:
        '这里显示人工智能文章的具体内容,高亮显示关键字,这里显示人工智能文章的具体内容,高亮显示关键字这里显示人工智能文章的具体内容,高亮显示关键字这里显示人工智能文章的具体内容,这里显示人工智能文章的具体内容,高亮显示关键字,这里显示人工智能文章的具体内容,高亮显示关键字这里显示人工智能文章的。',
      highlightKeywords: ['人工智能'],
    },
    {
      id: '3',
      title: '这里展示人工智能文章的标题',
      company: '云天化股份有限公司',
      department: '财务部',
      uploader: '某某上传',
      uploadTime: '2025/9/2 14:13',
      content:
        '这里显示人工智能文章的具体内容,高亮显示关键字,这里显示人工智能文章的具体内容,高亮显示关键字这里显示人工智能文章的具体内容,高亮显示关键字这里显示人工智能文章的具体内容,这里显示人工智能文章的具体内容,高亮显示关键字,这里显示人工智能文章的具体内容,高亮显示关键字这里显示人工智能文章的。',
      highlightKeywords: ['人工智能'],
    },
    {
      id: '4',
      title: '这里展示人工智能文章的标题',
      company: '云天化股份有限公司',
      department: '财务部',
      uploader: '某某上传',
      uploadTime: '2025/9/2 14:13',
      content:
        '这里显示人工智能文章的具体内容,高亮显示关键字,这里显示人工智能文章的具体内容,高亮显示关键字这里显示人工智能文章的具体内容,高亮显示关键字这里显示人工智能文章的具体内容,这里显示人工智能文章的具体内容,高亮显示关键字,这里显示人工智能文章的具体内容,高亮显示关键字这里显示人工智能文章的。',
      highlightKeywords: ['人工智能'],
    },
  ];

  useEffect(() => {
    // 初始化搜索结果
    setSearchResults(mockResults);
  }, []);

  const handleSearch = (keyword: string) => {
    if (!keyword.trim()) {
      message.warning('请输入搜索关键词');
      return;
    }

    setIsLoading(true);
    setSearchKeyword(keyword);

    // 模拟搜索请求
    setTimeout(() => {
      // 这里应该调用实际的搜索API
      // 暂时使用模拟数据
      const filteredResults = mockResults.map((result) => ({
        ...result,
        highlightKeywords: [keyword],
      }));
      setSearchResults(filteredResults);
      setIsLoading(false);
    }, 2000);
  };

  const handleBack = () => {
    // 处理返回逻辑
    console.log('返回上一页');
  };

  return (
    <div className="search-content">
      <SearchHeader onBack={handleBack} />

      <SearchInput value={searchKeyword} onSearch={handleSearch} onChange={setSearchKeyword} />

      <ResultsCount count={searchResults.length} />

      <div className="search-results">
        <Spin tip="数据加载中..." spinning={isLoading} />
        {searchResults.map((result) => (
          <ResultCard key={result.id} result={result} />
        ))}
      </div>
    </div>
  );
};

export default SmartSearch;
