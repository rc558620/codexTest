import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';

import styles from '../../../../index.module.less';

import Assistant_yy_1 from '@/assets/images/Assistant/Assistant-yy-3@2x.png';
import Assistant_yy_2 from '@/assets/images/Assistant/Assistant-yy@2x.png';
import Assistant_yy_3 from '@/assets/images/Assistant/Assistant-yy-2@2x.png';

import Assistant_search from '@/assets/images/Assistant/Assistant-search@2x.png';
import Assistant_sk from '@/assets/images/Assistant/Assistant-sk@2x.png';
import Assistant_wx from '@/assets/images/Assistant/Assistant-wx@2x.png';
import Assistant_zs from '@/assets/images/Assistant/Assistant-zs@2x.png';

import Assistant_send from '@/assets/images/Assistant/send.png';

interface BasicProps {
  className?: string;
  style?: React.CSSProperties;
  openCommand?: () => void;
}

interface ToolbarBtnProps {
  icon?: React.ReactNode;
  text: string;
  iconRight?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const ToolbarBtn: React.FC<ToolbarBtnProps> = ({
  className,
  style,
  icon,
  text,
  iconRight,
  onClick,
  disabled,
}) => (
  <button
    type="button"
    className={classNames(styles['maid-toolbar__btn'], className)}
    style={style}
    aria-label={text}
    onClick={onClick}
    disabled={disabled}
  >
    {icon}
    <span>{text}</span>
    {iconRight ? <span className={styles.iconRight}>{iconRight}</span> : null}
  </button>
);

const MobileInputBar: React.FC<BasicProps> = ({ className, style, openCommand }) => {
  const [val, setVal] = useState('');
  const [focused, setFocused] = useState(false);

  /** 多选状态（除“文心4.5/模型选择”外） */
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(() => new Set());

  /** 模型选择：deepseek / 文心4.5 */
  const [model, setModel] = useState<'deepseek' | 'wenxin4.5'>('wenxin4.5');
  const [modelPickerOpen, setModelPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);

  // 点击外部关闭模型选择框
  useEffect(() => {
    if (!modelPickerOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (!pickerRef.current) return;
      if (!pickerRef.current.contains(e.target as Node)) {
        setModelPickerOpen(false);
      }
    };
    document.addEventListener('click', onDocClick, true);
    return () => document.removeEventListener('click', onDocClick, true);
  }, [modelPickerOpen]);

  const toolbar = [
    { key: 'search', text: '联网搜索', icon: Assistant_search, dropdown: false },
    { key: 'think', text: '深度思考', icon: Assistant_sk, dropdown: false },
    {
      key: 'model',
      text: model === 'deepseek' ? 'deepseek' : '文心4.5',
      icon: Assistant_wx,
      dropdown: true,
    },
    { key: 'kb', text: '知识库问', icon: Assistant_zs, dropdown: false },
  ] as const;

  const onToolbarClick = (key: string, dropdown: boolean) => {
    if (dropdown) {
      setModelPickerOpen((v) => !v);
      return;
    }
    setModelPickerOpen(false);
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className={classNames(styles['maid-composer'], className)} style={style}>
      {/* 工具栏（在上方） */}
      <section
        className={styles['maid-toolbar']}
        aria-label="tools"
        role="region"
        aria-roledescription="scrollable toolbar"
      >
        <div className={styles['maid-toolbar__scroller']}>
          {toolbar.map((item) => {
            const isSelected = !item.dropdown && selectedKeys.has(item.key);
            return (
              <ToolbarBtn
                key={item.key}
                className={classNames({
                  [styles['is-selected']]: isSelected, // 选中：字体/边框变蓝
                  [styles['is-model']]: item.dropdown, // 文心4.5/模型：不走选中色
                })}
                icon={<img className={styles['maid-emoji-bar']} src={item.icon} alt="" />}
                text={item.text}
                iconRight={item.dropdown ? '▼' : undefined}
                onClick={() => onToolbarClick(item.key, item.dropdown)}
              />
            );
          })}
        </div>

        {/* 模型选择框（浮层，出现在 toolbar 上方） */}
        {modelPickerOpen && (
          <div
            ref={pickerRef}
            className={styles['maid-modelpicker']}
            role="dialog"
            aria-label="选择模型"
          >
            <button
              type="button"
              className={classNames(styles['maid-modelpicker__item'], {
                [styles['is-active']]: model === 'deepseek',
              })}
              onClick={() => {
                setModel('deepseek');
                setModelPickerOpen(false);
              }}
            >
              deepseek
            </button>
            <button
              type="button"
              className={classNames(styles['maid-modelpicker__item'], {
                [styles['is-active']]: model === 'wenxin4.5',
              })}
              onClick={() => {
                setModel('wenxin4.5');
                setModelPickerOpen(false);
              }}
            >
              文心4.5
            </button>
          </div>
        )}
      </section>

      {/* 输入条（在下方） */}
      <section
        className={classNames(styles['maid-inputbar'], { [styles['is-focus']]: focused })}
        aria-label="composer"
      >
        <div className={styles['maid-inputbar__field']}>
          <div className={styles['maid-inputbar__actions']} onClick={() => openCommand?.()}>
            <img className={styles.spark} src={Assistant_yy_1} alt="" />
          </div>

          <input
            placeholder="请输入内容"
            aria-label="输入内容"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />

          <button className={styles.mic} aria-label="语音" type="button">
            <img className={styles.mic_img} src={Assistant_yy_2} alt="" />
          </button>

          <button className={styles.plus} aria-label="新建" type="button">
            <img src={Assistant_yy_3} alt="" />
          </button>

          {/* 发送按钮：默认隐藏；focus 时显示；无值禁用 */}
          <button
            className={classNames(styles.send, { [styles['is-disabled']]: !val.trim() })}
            aria-label="发送"
            type="button"
            disabled={!val.trim()}
          >
            <img src={Assistant_send} alt="" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default MobileInputBar;
