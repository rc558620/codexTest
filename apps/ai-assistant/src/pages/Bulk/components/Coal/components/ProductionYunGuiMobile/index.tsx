import React, { useMemo } from 'react';
import MobileTitle from '../../../MobileTitle';
import EChart from '../../../Echart';
import { DATES_YG, SERIES_YG, STATS_YG_SUMMARY, STATS_YG_LAST } from '../../../../mock';
import { buildYgOption, clsWow } from './buildYgOptionMobile';
import iconYgInv from '@/assets/images/ygdc@2x.png';
import { fmt } from '@/components/types';

interface ProductionYunGuiMobileProps {
  title?: string;
  // ✅ 父组件传接口数据就能实时更新
  dates?: string[];
  ynInv?: number[];
  gzInv?: number[];
  ynRun?: number[];
  gzRun?: number[];
}

const ProductionYunGuiMobile: React.FC<ProductionYunGuiMobileProps> = ({
  title = '云贵电厂情况',
  ...props
}) => {
  // 默认（mock）数据兜底
  const defaultDates = DATES_YG;
  const ynInvDefault = SERIES_YG.find((s) => s.name === '云南电厂库存')!.points.map((p) => p.value);
  const gzInvDefault = SERIES_YG.find((s) => s.name === '贵州电厂库存')!.points.map((p) => p.value);
  const ynRunDefault = SERIES_YG.find((s) => s.name === '云南电厂开机率（%）')!.points.map(
    (p) => p.value,
  );
  const gzRunDefault = SERIES_YG.find((s) => s.name === '贵州电厂开机率（%）')!.points.map(
    (p) => p.value,
  );

  const option = useMemo(
    () =>
      buildYgOption({
        dates: props.dates ?? defaultDates,
        ynInv: props.ynInv ?? ynInvDefault,
        gzInv: props.gzInv ?? gzInvDefault,
        ynRun: props.ynRun ?? ynRunDefault,
        gzRun: props.gzRun ?? gzRunDefault,
        // 如需自定义 legend 行列位置/颜色/文案，也可在此传参覆盖
      }),
    [
      props.dates,
      props.ynInv,
      props.gzInv,
      props.ynRun,
      props.gzRun,
      defaultDates,
      ynInvDefault,
      gzInvDefault,
      ynRunDefault,
      gzRunDefault,
    ],
  );
  const { invWow, utilWow } = STATS_YG_SUMMARY;
  const { gzInvLast, gzRunLast, ynInvLast, ynRunLast } = STATS_YG_LAST;
  return (
    <div className="mobile-box">
      <div className="mobile-box-flex">
        <div className="mobile-box-flex-left">
          <MobileTitle title={title} />
        </div>
        <span className="mobile-box-flex-right">单位：万吨 数据来源：能源局</span>
      </div>
      <div className="mobile-box-table yg-panel">
        <div className="yg-chips">
          <div className={`yg-chip yg-chip--inv yg-chip--${clsWow(invWow)}`}>
            <span className="yg-chip__label">总库存周环比</span>
            <span className={`yg-chip__value ${!invWow ? 'is-empty' : ''}`}>
              {invWow ? fmt(invWow) : '—'}
            </span>
          </div>
          <div className={`yg-chip yg-chip--util yg-chip--${clsWow(utilWow)}`}>
            <span className="yg-chip__label">火电开机率周环比</span>
            <span className={`yg-chip__value ${!utilWow ? 'is-empty' : ''}`}>
              {utilWow ? fmt(utilWow) : '—'}
            </span>
          </div>
        </div>
        <EChart ariaLabel="全国煤炭价格折线图" option={option} className="price-mobile-echart-yg" />
        <div className="yg-stats">
          <div className="yg-card">
            <div className="yg-card__label">
              <img className="iconYgInv" src={iconYgInv} />
              上周贵州库存
            </div>
            <div className="yg-card__value">{fmt(gzInvLast)}</div>
          </div>
          <div className="yg-card">
            <div className="yg-card__label">
              <img className="iconYgInv" src={iconYgInv} />
              上周贵州开机率
            </div>
            <div className="yg-card__value">{fmt(gzRunLast)}%</div>
          </div>
          <div className="yg-card">
            <div className="yg-card__label">
              <img className="iconYgInv" src={iconYgInv} />
              上周云南库存
            </div>
            <div className="yg-card__value">{fmt(ynInvLast)}</div>
          </div>
          <div className="yg-card">
            <div className="yg-card__label">
              <img className="iconYgInv" src={iconYgInv} />
              上周云南开机率
            </div>
            <div className="yg-card__value">{fmt(ynRunLast)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionYunGuiMobile;
