import React from 'react';
import AnalysisMobile from '../../AnalysisMobile';
import TendencyMobile from '../components/TendencyMobile';
import SalesMobile from '../components/SalesMobile';

interface Nh3XiNanMobileProps {}

const Nh3XiNanMobile: React.FC<Nh3XiNanMobileProps> = () => {
  return (
    <div className="bulk__mobile__gap">
      <AnalysisMobile title="重大事件分析" />
      <TendencyMobile title="西南液氨主要厂家商品氨价格走势" />
      <SalesMobile title="西南液氨主要厂家外销量" />
    </div>
  );
};

export default Nh3XiNanMobile;
