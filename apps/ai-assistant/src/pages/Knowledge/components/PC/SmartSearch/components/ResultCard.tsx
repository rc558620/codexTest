import React from 'react';
import './ResultCard.less';

export interface SearchResult {
  id: string;
  title: string;
  company: string;
  department: string;
  uploader: string;
  uploadTime: string;
  content: string;
  highlightKeywords?: string[];
}

interface ResultCardProps {
  result: SearchResult;
}

const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  // 高亮关键词的函数
  const highlightText = (text: string, keywords?: string[]) => {
    if (!keywords || keywords.length === 0) return text;

    let highlightedText = text;
    keywords.forEach((keyword) => {
      const regex = new RegExp(`(${keyword})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<span class="highlight">$1</span>');
    });

    return highlightedText;
  };

  return (
    <div className="result-card">
      <div className="card-title">{result.title}</div>

      <div className="card-metadata">
        <span className="metadata-tag">{result.company}</span>
        <span className="metadata-tag">{result.department}</span>
        <span className="metadata-tag">{result.uploader}</span>
        <span className="metadata-tag">{result.uploadTime}</span>
      </div>

      <div
        className="card-content"
        dangerouslySetInnerHTML={{
          __html: highlightText(result.content, result.highlightKeywords),
        }}
      />
    </div>
  );
};

export default ResultCard;
