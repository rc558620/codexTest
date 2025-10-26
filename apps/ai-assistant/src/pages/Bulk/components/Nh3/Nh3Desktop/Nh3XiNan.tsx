import React from 'react';
import LastWeek from '../../Coal/components/LastWeek';
import Analysis from '../../Coal/components/Analysis';
import Tendency from '../components/Tendency';
import Sales from '../components/Sales';

interface Nh3XiNanProps {}

const Nh3XiNan: React.FC<Nh3XiNanProps> = () => {
  return (
    <div className="page__inner">
      <div className="grid grid--2">
        <LastWeek
          analyses={[
            {
              label: '供应端分析',
              value:
                '周内部分地区降雨天气频繁，部分露天煤矿生产受到影响，停产煤矿较多，煤炭市场供应量有所缩紧，产量增长较慢，煤矿厂家库存下降，港口库存下降，供应端对市场提供利好支撑。',
            },
            {
              label: '需求端分析',
              value:
                '需求端分析：高温天气下，民用电负荷较高，但部分地区降雨较多，水力发电增强，电厂日耗提升有限，对市场煤维持按需补库；下游水泥市场需求表现不佳；下游化工行业采购心态较为谨慎，对原料煤刚需采买节奏不变。整体来看，需求端存在利好支撑。',
            },
          ]}
          price={{
            powerAvg: 567,
            powerWow: 0.55, // 正为涨（绿色 ↑），负为跌（红色 ↓），0 为持平
            anthAvg: 847,
            anthWow: -0.01,
            unit: '元/吨',
          }}
          brief="动力煤供需双弱价格微张，无烟煤需求疲软小幅回落"
        />
        <LastWeek
          title="本周展望"
          analyses={[
            {
              label: '供应端分析',
              value:
                '随着降雨天气影响减弱，产地煤矿将陆续恢复生产，煤炭市场供应量将陆续恢复至正常水平，供应量或有所增加，预计供应端利好支撑减弱。',
            },
            {
              label: '需求端分析',
              value:
                '暂未出伏，全国各地气温仍处高位，居民用电需求较高，下游电厂日耗预期增强，预计对市场煤维持刚需补库:受高温影响其建项目施工条件不佳，预计下游水泥黑求表现疲软:下游化工行业观望情绪浓厚，对原料煤维持刚需采买节奏，整体来看，需求端利好支撑仍存。',
            },
          ]}
          price={{
            powerAvg: 567,
            powerWow: 0.55, // 正为涨（绿色 ↑），负为跌（红色 ↓），0 为持平
            anthAvg: 847,
            anthWow: -0.01,
            unit: '元/吨',
          }}
          brief="全国动力煤与无烟煤价格同步微涨，高温用电刚需支撑市场维持震荡偏强走势"
        />
      </div>
      <div className="grid grid--2">
        <Analysis title="重大事件分析" />
        <Tendency title="西南液氨主要厂家商品氨出厂价格走势" />
      </div>
      <div className="grid grid--1">
        <Sales title="西南液氨主要厂家外销量" />
      </div>
    </div>
  );
};

export default Nh3XiNan;
