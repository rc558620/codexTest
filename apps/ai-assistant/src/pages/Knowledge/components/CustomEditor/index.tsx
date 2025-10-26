import React, { useRef, useImperativeHandle } from 'react';
import styles from './index.module.less';

export interface CheckableTagProps {
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  value?: string;
  onInput?: (val: string) => void;
  onBlur?: (val: string) => void;
  onFocus?: (val: string) => void;
}

const CustomEditor = React.forwardRef<HTMLDivElement, CheckableTagProps>((props, ref) => {
  const {
    style,
    className,
    placeholder = '',
    value = '',
    onInput,
    onFocus,
    onBlur,
    ...restProps
  } = props;

  const editorRef = useRef<HTMLDivElement>(null);

  // 暴露内部 ref 给外部使用
  useImperativeHandle(ref, () => editorRef.current as HTMLDivElement, []);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.textContent || '';
    onInput?.(text);
  };

  // 修复后的 handleFocus 函数
  const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    onFocus?.(e.currentTarget.textContent || '');
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    onBlur?.(e.currentTarget.textContent || '');
  };

  return (
    <div
      contentEditable
      suppressContentEditableWarning
      {...restProps}
      ref={editorRef}
      style={style}
      data-placeholder={placeholder}
      className={`${styles.customEditor} ${className || ''}`}
      onInput={handleInput}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {value}
    </div>
  );
});

CustomEditor.displayName = 'CustomEditor';
export default CustomEditor;
