import React from 'react';
import Macroeconomics from './components/Macroeconomics';
import Analysis from './components/Analysis';
import { mockMetrics, paragraphs, RadarCardAxes, RadarCardData } from '../../mock';
import styles from './index.module.less';

interface ChatProps {}

const Chat: React.FC<ChatProps> = () => {
  return (
    <div className={styles.chatContainer}>
      {/* <Macroeconomics /> */}
      <Analysis
        metrics={mockMetrics}
        paragraphs={paragraphs}
        RadarCardAxes={RadarCardAxes}
        RadarCardData={RadarCardData}
      />
    </div>
  );
};

export default Chat;
