import React from 'react';
import AnalysisMobile from '../../AnalysisMobile';
import YgBoardPriceMobile from '../components/YgBoardPriceMobile';
import ProductionYunGuiMobile from '../components/ProductionYunGuiMobile';

interface CoalYunGuiProps {}

const CoalYunGui: React.FC<CoalYunGuiProps> = () => {
  return (
    <div className="bulk__mobile__gap">
      <AnalysisMobile title="重大事件分析" />
      <YgBoardPriceMobile title="云贵看板价格" />
      <ProductionYunGuiMobile title="云贵电厂情况" />
    </div>
  );
};

export default CoalYunGui;
