import React, { useMemo, useState } from 'react';
import cx from 'classnames';
import styles from './index.module.less';
import type { MetricItem, MetricsPanelProps } from '../../types';
import MetricsRow from './components/MetricsRow';

const defaultBlue = '#2F81F7';
const defaultPurple = '#7C6AF2';

const MetricsPanel: React.FC<MetricsPanelProps> = ({
  items,
  className,
  style,
  defaultActiveKey = items?.[0]?.key ?? null,
  blueColor = defaultBlue,
  purpleColor = defaultPurple,
  onChange,
}) => {
  const [active, setActive] = useState(defaultActiveKey);
  const ctx = useMemo(() => ({ blueColor, purpleColor }), [blueColor, purpleColor]);

  const handleToggle = (key: MetricItem['key']): void => {
    setActive((prev) => {
      const next = prev === key ? null : key;
      if (onChange) onChange(next);
      return next;
    });
  };

  return (
    <div className={cx(styles.panel, className)} style={style}>
      {items.map((it) => (
        <MetricsRow
          key={it.key}
          item={it}
          open={active === it.key}
          onToggle={() => handleToggle(it.key)}
          blueColor={ctx.blueColor}
          purpleColor={ctx.purpleColor}
        />
      ))}
    </div>
  );
};

export default MetricsPanel;
