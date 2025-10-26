import React from 'react';

const Risk: React.FC = () => (
  <div className="card">
    <h3 className="card__title">风险提示</h3>
    <ul className="analysis">
      <li>政策与安监强度超预期导致产量波动。</li>
      <li>极端天气对需求侧的短期拉动或抑制。</li>
      <li>进口节奏与汇率变化对港口结构的扰动。</li>
    </ul>
  </div>
);

export default Risk;
