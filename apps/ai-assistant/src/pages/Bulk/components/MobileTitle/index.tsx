import React from 'react';
import './index.less';

interface MobileTitleProps {
  title?: string;
  tip?: string;
}

const MobileTitle: React.FC<MobileTitleProps> = ({ title, tip }) => {
  return (
    <header className="mpa__header">
      <div className="mpa__title_wrapper">
        <i className="mpa__bar" aria-hidden="true" />
        <h3 className="mpa__title">{title}</h3>
      </div>
      {tip && <span className="mpa__tip">{tip}</span>}
    </header>
  );
};

export default MobileTitle;
