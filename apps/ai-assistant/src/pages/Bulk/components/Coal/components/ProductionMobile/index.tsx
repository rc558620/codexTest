import React, { useMemo } from 'react';
import MobileTitle from '../../../MobileTitle';
import EChart from '../../../Echart';
import { DATES, PRODUCTION_VALUES, PRODUCTION_AVG_7D } from '../../../../mock';
import { fmt } from '@/components/types';
import { buildProductionOption, getArrow, getPillColors } from './buildProductionMobileOption';

interface ProductionMobileProps {
  title?: string;
  // ✅ 父组件可传接口数据（不传则用 mock 兜底）
  dates?: string[];
  barName?: string;
  barData?: number[];
  lineName?: string;
  lineData?: number[];
}

type Tone = 'up' | 'down' | 'neutral' | 'three' | 'four';
/** 一个 Pill 内部：左侧主指标 + 右侧周对比 */
const Pill: React.FC<{
  label: string;
  value: string;
  tone?: Tone;
  subText?: string;
  subValue?: string;
  subTone?: Tone;
}> = ({ label, value, tone = 'neutral', subText, subValue, subTone = 'neutral' }) => {
  const { bg, color } = getPillColors(tone);
  let deltaColor = '#64748B';
  if (subTone === 'up') deltaColor = '#00B42A';
  else if (subTone === 'down') deltaColor = '#F53F3F';
  const arrow = getArrow(subTone);
  const isZero =
    subValue === undefined || subValue === '0' || subValue === '0.0' || subValue === '0.00';
  const isDelta = subText === '周对比';

  return (
    <div className="pill pill__mobile" style={{ background: bg }}>
      <div className="pill__box pill__box__mobile">
        <div className="pill__center">
          <span className="pill__label">{label}</span>
          <div className="pill__value" style={{ color, lineHeight: 1.1 }}>
            {value}
          </div>
        </div>

        {subText && (
          <div className="pill__subText pill__subText___mobile">
            <span className="pill__label" style={{ marginRight: isDelta ? 0 : 8 }}>
              {subText}
            </span>
            <span
              className="pill__value"
              style={{ color: deltaColor, fontSize: isDelta ? 9 : undefined }}
            >
              {isZero ? '—' : subValue}
              {!isZero && arrow && (
                <span aria-hidden style={{ marginLeft: 4 }}>
                  {arrow}
                </span>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const ProductionMobile: React.FC<ProductionMobileProps> = ({
  title,
  dates = DATES,
  barName = '库存',
  barData = PRODUCTION_VALUES,
  lineName = '日耗量',
  lineData = PRODUCTION_AVG_7D,
}) => {
  // ✅ 仅依赖 props 生成 option —— 实时更新
  const option = useMemo(
    () =>
      buildProductionOption({
        dates,
        barName,
        barData,
        lineName,
        lineData,
      }),
    [dates, barName, barData, lineName, lineData],
  );
  return (
    <div className="mobile-box">
      <div className="mobile-box-flex">
        <div className="mobile-box-flex-left">
          <MobileTitle title={title} />
        </div>
        <span className="mobile-box-flex-right">单位：万吨 数据来源：我的钢铁</span>
      </div>
      <div className="mobile-box-table">
        <div className="card__box card__box_mobile">
          <div className="pill-row pill-row-mobile">
            <div className="pill-col pill-col-mobile">
              <Pill
                label="上周库存"
                value={fmt(10028.1)}
                tone="three"
                subText="周对比"
                subValue={fmt(93)}
                subTone="up"
              />
              <Pill
                label="上周日耗量"
                value={fmt(443.7)}
                tone="four"
                subText="周对比"
                subValue={fmt(23.2)}
                subTone="down"
              />
            </div>
          </div>

          <EChart option={option} className="price-mobile-echart" />
        </div>
      </div>
    </div>
  );
};

export default ProductionMobile;
