/**
 * 侧边栏条目
 */
export interface NavItem {
  /** 唯一标识；示例："agent-qa" */
  key: string;
  /** 展示文案；示例："Agent相关知识" */
  label: string;
  /** 是否高亮 */
  active?: boolean;
}

/**
 * 数据集卡片信息
 */
export interface DatasetInfo {
  /** 数据集名称；示例："云天化财务数据集" */
  name: string;
  /** 标签集合；示例：["资产负债", "利润", "现金流量", "所有者权益变动"] */
  tags: string[];
  /** 是否已授权访问 */
  authed?: boolean;
  /** 擅长分析能力标签；示例：["财务分析", "对标分析"] */
  abilities: string[];
}

/**
 * 最近对话
 */
export interface RecentDialog {
  key: string;
  title: string;
}

/**
 * Query 提交参数
 */
export interface QueryPayload {
  /** 选中的数据集名称；不可为空 */
  dataset: string;
  /** 问题文本；不可为空 */
  question: string;
}
