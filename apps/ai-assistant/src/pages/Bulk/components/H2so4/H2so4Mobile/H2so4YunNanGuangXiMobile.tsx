import React from 'react';
import AnalysisMobile from '../../AnalysisMobile';
import AveragePriceYnMobile from '../components/AveragePriceYnMobile';
import SourMobile from '../components/SourMobile';
import SpotPriceYnMobile from '../components/SpotPriceYnMobile';

interface H2so4NationwideMobileProps {}

const H2so4NationwideMobile: React.FC<H2so4NationwideMobileProps> = () => {
  return (
    <div className="bulk__mobile__gap">
      <AnalysisMobile title="重大事件分析" />
      <AveragePriceYnMobile title="云南硫酸均价、磷酸氢钙17%价、硫铁矿价" />
      <SourMobile title="酸企周产量" />
      <SpotPriceYnMobile title="云南及广西98%硫酸价格" />
    </div>
  );
};

export default H2so4NationwideMobile;
