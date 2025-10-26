import React from 'react';

export interface CheckableTagProps {
  className?: string;
  checkClassName?: string;
  style?: React.CSSProperties;
  checked?: boolean;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  onChange?: (checked: boolean) => void;
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}
/**
 * @description: 自定义标签
 */
const CustomTag = React.forwardRef<HTMLDivElement, CheckableTagProps>((props, ref) => {
  const {
    style,
    className,
    checkClassName,
    checked,
    children,
    icon,
    onChange,
    onClick,
    ...restProps
  } = props;

  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    onChange?.(!checked);
    onClick?.(e);
  };

  return (
    <div
      {...restProps}
      ref={ref}
      style={{ cursor: 'pointer', ...style }}
      className={checked ? `${className} ${checkClassName}` : className}
      onClick={handleClick}
    >
      {icon}
      <span>{children}</span>
    </div>
  );
});
CustomTag.displayName = 'CustomTag';
export default CustomTag;
