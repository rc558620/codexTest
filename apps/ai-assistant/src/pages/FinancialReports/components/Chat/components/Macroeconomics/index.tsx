import React from 'react';
import styles from './index.module.less';
import { optionCpiPpi, optionPMI } from './types';
import EChart from '../Echarts';

const Macroeconomics: React.FC = () => {
  return (
    <div className={styles.page}>
      {/* 一、中国CPI、PPI同比变动图 */}
      <section className={styles.card}>
        <div className={styles.header}>
          <h3 className={styles.title}>一、中国CPI、PPI同比变动图</h3>
        </div>

        <EChart option={optionCpiPpi} ariaLabel="中国CPI、PPI同比变动图" />

        <div className={styles.source}>数据来源：Wind</div>

        {/* 文字说明（和图片上一样放在图表下方） */}
        <ol className={styles.points}>
          <li>
            <strong>1、PPI同比再度转负，通缩压力延续</strong>
            <p>
              预计8月CPI环比微涨0.1%，但同比回落至-0.3%。食品价格分化（蔬菜涨8.0%、猪肉跌1.9%），能源价格偏弱，
              核心CPI温和回暖但整体需求偏软。
            </p>
          </li>
          <li>
            <strong>2、CPI同比再度转弱，通缩压力延续</strong>
            <p>
              预计8月PPI同比-2.9%（好于7-3.6%）环比持平或略降。在“反向内导”政策推动消费品价格温和抬升，但国际油价下跌及下游需求
              制约修复幅度。
            </p>
          </li>
        </ol>

        {/* 二、中国制造业与服务业PMI */}

        <div className={styles.header}>
          <h3 className={styles.title}>二、中国制造业与服务业PMI</h3>
        </div>

        <EChart option={optionPMI} ariaLabel="中国制造业与服务业PMI" />

        <div className={styles.source}>数据来源：Wind</div>

        <ol className={styles.points}>
          <li>
            <strong>1、PMI回升至49.4%，生产强于需求</strong>
            <p>
              8月制造业PMI为49.4%（前值49.3%）连续5个月在荣枯线边缘，生产指数升至50.8%，新订单指数49.5%，
              出口订单及原材料购进价格小幅走弱，但生产偏强，工业增加值同比或在5.8%~6.0%。
            </p>
          </li>
          <li>
            <strong>2、工业增加值仍在5.8%，出口拉动明显</strong>
            <p>
              预计8月工业增加值同比在5.8%~6.0%，高技术制造业PMI升至51.9%。装备制造业持平（50.5%），
              但消费品行业回落（49.2%），呈现“生产稳、需求分化”。
            </p>
          </li>
        </ol>

        {/* 建议信息块（可选） */}
        <div className={styles.suggestion}>
          <div className={styles.sugTitle}>📘 建议</div>
          <p>
            8月投资边际改善，内需侧财政发力加码，“反内导”政策推动上游价格回升，PPI降幅收窄及原燃料涨价（煤炭环比涨8%）
            可能带来企业生产成本抬升，但国际油价下跌形成部分对冲。
          </p>
        </div>
      </section>
    </div>
  );
};

export default Macroeconomics;
