// src/components/AssistantCard/index.tsx
import React, { memo } from 'react';
import styles from './index.module.less';
import { AssistantItem } from '../../assistant';
import { safeStr } from '@/utils/utils';

import Applys_ai from '@/assets/images/Assistant/Applys_ai@2x.png';
import Assistant_meeting from '@/assets/images/Assistant/Assistant_meeting@2x.png';
import Assistant_box3 from '@/assets/images/Assistant/Assistant-box3@2x.png';
import Assistant_box4 from '@/assets/images/Assistant/Assistant-box4@2x.png';
import Assistant_box1 from '@/assets/images/Assistant/Assistant-box1@2x.png';
import Assistant_box2 from '@/assets/images/Assistant/Assistant-box2@2x.png';

import Applys_back_1 from '@/assets/images/Assistant/Applys_back_1@3x.png';
import Applys_back_2 from '@/assets/images/Assistant/Applys_back_2@3x.png';
import Applys_back_3 from '@/assets/images/Assistant/Applys_back_3@3x.png';
import Applys_back_4 from '@/assets/images/Assistant/Applys_back_4@3x.png';
import Applys_back_5 from '@/assets/images/Assistant/Applys_back_5@3x.png';
import Applys_back_6 from '@/assets/images/Assistant/Applys_back_6@3x.png';

/**
 * 图标名到背景图的映射
 * edit→1, globe→2, chart→3, trend→4, calendar→5, todo→6
 */
const bgMap: Record<AssistantItem['icon']['name'], string> = {
  edit: Applys_back_1,
  globe: Applys_back_2,
  chart: Applys_back_3,
  trend: Applys_back_4,
  calendar: Applys_back_5,
  todo: Applys_back_6,
};

/**
 * 内部：根据 icon.name 渲染对应图片图标
 */
const IconSvg: React.FC<{ name: AssistantItem['icon']['name'] }> = ({ name }) => {
  switch (name) {
    case 'edit':
      return <img src={Applys_ai} className={styles.icon} alt="edit 图标" />;
    case 'globe':
      return <img src={Assistant_meeting} className={styles.icon} alt="globe 图标" />;
    case 'chart':
      return <img src={Assistant_box3} className={styles.icon} alt="chart 图标" />;
    case 'trend':
      return <img src={Assistant_box4} className={styles.icon} alt="trend 图标" />;
    case 'calendar':
      return <img src={Assistant_box1} className={styles.icon} alt="calendar 图标" />;
    case 'todo':
      return <img src={Assistant_box2} className={styles.icon} alt="todo 图标" />;
    default:
      return null;
  }
};

interface Props {
  /** 单条助手数据 */
  item: AssistantItem;
}

/**
 * 单个助手卡片（无状态展示组件）
 */
const AssistantCard: React.FC<Props> = ({ item }) => {
  const title = safeStr(item.title);
  const author = safeStr(item.author ?? '');
  const desc = safeStr(item.description ?? '');

  // 根据 icon.name 选择背景图；如遇未知 name，则回退 edit 的背景
  const bgUrl = bgMap[item.icon.name] ?? bgMap.edit;

  return (
    <article
      className={styles.card}
      aria-label={`${title} 卡片`}
      style={{ backgroundImage: `url(${bgUrl})` }} // 动态背景
    >
      <div className={styles.row}>
        <div className={`${styles.iconWrap} ${styles[item.icon.gradient]}`} aria-hidden="true">
          <IconSvg name={item.icon.name} />
        </div>
        <div className="content" style={{ flex: 1 }}>
          <div className={styles.titleRow}>
            <h3 className={styles.title}>{title}</h3>
            {author && <span className={styles.author}>{author}</span>}
          </div>
          {desc && <p className={styles.desc}>{desc}</p>}
          {Array.isArray(item.tags) && item.tags.length > 0 && (
            <div className={styles.tags} role="list" aria-label={`${title} 标签`}>
              {item.tags.map((tag, index) => {
                const label = safeStr(tag?.label ?? '');
                if (!label) return null;
                // key 优先稳定主键（此处无），回退方案：语义化前缀 + index
                return (
                  <button
                    key={`assistant-tag-${index}`}
                    type="button"
                    className={styles.tagBtn}
                    aria-label={`标签 ${label}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default memo(AssistantCard);
