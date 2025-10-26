// src/types/assistant.ts

/**
 * 助手标签（用于筛选/标注）
 */
export interface AssistantTag {
  /** 标签展示文本（必填） */
  label: string;
}

/**
 * 卡片图标设置（用于控制图标与背景渐变）
 */
export interface AssistantIcon {
  /** 图标的唯一名称，便于测试与调试（示例：'edit', 'globe', 'chart', 'trend', 'calendar', 'todo'） */
  name: 'edit' | 'globe' | 'chart' | 'trend' | 'calendar' | 'todo';
  /**
   * 渐变修饰符（对应样式里定义的渐变背景类名，不含点号）
   * @example 'gradient-blue' | 'gradient-orange'
   */
  gradient: string;
}

/**
 * 单个助手卡片的数据模型
 */
export interface AssistantItem {
  /**
   * 稳定唯一主键（强烈建议提供；用于 React 渲染 key）
   * @example 'writer'
   */
  id: string;
  /** 标题（必填）@example 'AI写作' */
  title: string;
  /** 作者或维护者标识 @example '@李白' */
  author?: string | null;
  /** 简短描述 @example '快速生成、优化和校对文本，提升写作效率与质量' */
  description?: string | null;
  /** 图标设置（必填） */
  icon: AssistantIcon;
  /** 标签列表（可空） */
  tags?: AssistantTag[] | null;
}

/**
 * 助手列表的 Props
 */
export interface AssistantsListProps {
  /**
   * 卡片数据数组
   * - 必须是非空数组，否则不渲染内容
   */
  items: AssistantItem[];
  /**
   * 页面容器测试 id（可空）
   * @default 'assistants-list'
   */
  'data-testid'?: string;
}
