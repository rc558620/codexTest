import React from 'react';
import IconTitle from '../../../IconTitle';

/** 左侧蓝色插画（内置 SVG） */
const AIIcon: React.FC = () => (
  <svg
    width="84"
    height="84"
    viewBox="0 0 84 84"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <defs>
      <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#9EDCFF" />
        <stop offset="100%" stopColor="#5BB8FF" />
      </linearGradient>
    </defs>
    <rect x="6" y="10" width="72" height="56" rx="10" fill="url(#g1)" opacity="0.35" />
    <rect x="12" y="16" width="60" height="44" rx="8" fill="#EAF6FF" />
    <path
      d="M22 52V30h6v22h-6zm12 0V24h6v28h-6zm12 0V36h6v16h-6zm12 0V32h6v20h-6z"
      fill="#67B7F7"
    />
    <path d="M18 24h48" stroke="#BFE7FF" strokeWidth="2" />
    <text x="18" y="20" fontSize="10" fill="#5AAAF5">
      AI
    </text>
  </svg>
);

type Dir = 'up' | 'down' | 'flat';
const getDir = (v: number): Dir => {
  if (v > 0) return 'up';
  if (v < 0) return 'down';
  return 'flat';
};
const nf = new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 1 });

const Overview: React.FC = () => {
  const items = [
    {
      name: '全国动力煤',
      avg: 800,
      wow: -1, // ↓ 动态 class 依据这个值
      prefix: ' 上周全国产业非电行业采购活跃及高温天气影响，价格上行；本周预计均价 ',
      suffix: ' 主因政策调控预期增强及电厂库存处于高位压制。',
    },
    {
      name: '全国无烟煤',
      avg: 800,
      wow: 30, // ↑
      prefix: ' 上周因冶金行业备货需求支撑，价格持稳；本周预计均价 ',
      suffix: ' 主因终端限产政策及港口库存压力传导至上游。',
    },
    {
      name: '云南无烟煤',
      avg: 800,
      wow: 1, // ↑
      prefix: ' 上周受化工刚需支撑，价格持稳；本周预计均价 ',
      suffix: ' 主因终端化工企业压价采购及港口库存高位。',
    },
  ] as const;

  return (
    <div className="card hero">
      <IconTitle title="上周市场总结及本周AI价格预测" />
      <div className="hero__body">
        <div className="hero__left">
          <AIIcon />
        </div>

        <div className="hero__right">
          <ul className="hero__list">
            {items.map((it) => {
              const dir = getDir(it.wow);
              const getSign = (value: number): string => {
                if (value > 0) return '+';
                if (value < 0) return '-';
                return '';
              };
              const wowStr = `${getSign(it.wow)}${Math.abs(it.wow)}%`;
              return (
                <li key={it.name} className="hero__item">
                  <span className="hero__dash" />
                  <strong className="hero__key">{it.name}</strong>
                  <span className="hero__text">{it.prefix}</span>

                  {/* 均价：固定蓝色数值样式 */}
                  <span className="hero__token hero__token--num">{nf.format(it.avg)}</span>
                  <span className="hero__unit">
                    {' '}
                    元/吨，周环比
                    {(() => {
                      if (dir === 'up') return '上涨';
                      if (dir === 'down') return '下跌';
                      return '持平';
                    })()}{' '}
                  </span>

                  {/* 环比：根据正负动态 class */}
                  <span className={`hero__token hero__token--${dir}`}>{wowStr}</span>
                  {dir !== 'flat' && <span className={`hero__square hero__square--${dir}`} />}

                  <span className="hero__text">{it.suffix}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Overview;
