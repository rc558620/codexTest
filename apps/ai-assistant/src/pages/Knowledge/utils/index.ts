import { message } from 'antd';

/**
 * 复制文本
 * @param {string} text - 需要复制的文本
 */
export const copyText = (text: string) => {
  navigator.clipboard.writeText(text);
  message.success('复制成功');
};
