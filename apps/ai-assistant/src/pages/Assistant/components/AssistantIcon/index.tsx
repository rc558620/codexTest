import React from 'react';

// 定义所有可用的 IconFont 图标类名（根据你截图中的内容）
type IconName =
  | 'icon-a-5_deepseek' // DeepSeek
  | 'icon-a-3_wenxinyiyan' // 文心
  | 'icon-a-1_lianwangsousuo' // 联网搜索
  | 'icon-a-4_zhishiku' // 知识库
  | 'icon-a-2_shendusikao'; // 深度思考

export interface IconProps {
  type: IconName; // 必填：图标类名
  className?: string; // 可选：额外 class
  style?: React.CSSProperties; // 可选：内联样式
  onClick?: () => void; // 可选：点击事件
  [key: string]: any; // 允许其他属性（如 title, data-testid 等）
}

const AssistantIcon: React.FC<IconProps> = ({ type, className = '', style, ...rest }) => {
  return <i className={`iconfont ${type} ${className}`} style={style} {...rest} />;
};

export default AssistantIcon;
