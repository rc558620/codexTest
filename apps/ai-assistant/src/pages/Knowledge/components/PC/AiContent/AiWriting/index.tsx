import { FC } from 'react';
import aiIcon from '../../../../assets/pc/ai.png';
import hyjyIcon from '../../../../assets/pc/hyjy.png';
import hyzsIcon from '../../../../assets/pc/hyzs.png';
import dbscIcon from '../../../../assets/pc/dbsc.png';
import styles from './index.module.less';
import { Action } from '../../types';

interface AiWritingProps {
  onChangeSliderBar: (action: Action, params?: { content?: string; action: string }) => void;
}

const AiWriting: FC<AiWritingProps> = ({ onChangeSliderBar }) => {
  const writingFunctions = [
    {
      title: 'AI写作',
      description: '快速生成、优化和校对文本，\n提升写作效率与质量',
      icon: aiIcon,
    },
    {
      title: '会议纪要生成助手',
      description: '提炼会议录音文件要点，\n按模板生成纪要',
      icon: hyjyIcon,
    },
    {
      title: '会议室助手',
      description: '通过问答的形式完成会议\n预定及发起',
      icon: hyzsIcon,
    },
    {
      title: '待办生成助手',
      description: '从附件与会议记录中提取\n待办事项并同步OA',
      icon: dbscIcon,
    },
  ];
  return (
    <div className={styles.aiWritingSection}>
      <div className={styles.writingGrid}>
        {writingFunctions.map((writing, index) => (
          <div
            key={index}
            className={styles.writingCard}
            style={{ backgroundImage: `url(${writing.icon})` }}
          >
            <h3 className={styles.cardTitle}>{writing.title}</h3>
            <p className={styles.cardDescription}>{writing.description}</p>
          </div>
        ))}
      </div>
      <div className={styles.moreAssistants}>
        <span className={styles.moreLink} onClick={() => onChangeSliderBar('InnovationSpace')}>
          {' '}
          更多助手 &gt;
        </span>
      </div>
    </div>
  );
};

export default AiWriting;
