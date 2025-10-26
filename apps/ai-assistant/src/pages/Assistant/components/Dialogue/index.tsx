import React from 'react';
import Assistant_head from '@/assets/images/Assistant/Assistant-head@2x.png';
import MobileInputBar from './components/MobileInputBar';
import { chips, quickButtons } from '../../mock';
import { safeStr } from '@/utils/utils';
import { Chip } from './components/Chip';
import styles from '../../index.module.less';
import { GridButton } from './components/GridButton';

interface DialogueProps {
  openCommand?: () => void;
}

const Dialogue: React.FC<DialogueProps> = ({ openCommand }) => {
  return (
    <main className={styles['maid-section-container']}>
      <section className={styles['maid-section']}>
        <div className={styles['maid-section__content']}>
          <div className={styles['maid-hero__container']}>
            <div className={styles['maid-hero__media']}>
              <img className={styles['maid-hero__img']} src={Assistant_head} alt="云小宝头像" />
            </div>
            <div className={styles['maid-hero__content']}>
              <div className={styles['maid-hero__title']}>HI~ 我是云小宝</div>
              <div className={styles['maid-hero__desc']}>
                我会热心解答你的每一个问题，让我们开启愉快的对话之旅吧！
              </div>
            </div>
          </div>

          <div className={styles['maid-grid']}>
            {Array.isArray(quickButtons) && quickButtons.length > 0
              ? quickButtons.map((btn, idx) => {
                  const title = safeStr(btn?.title);
                  return (
                    <GridButton
                      key={title || `grid-item-${idx}`}
                      icon={btn?.icon}
                      title={title}
                      onClick={btn?.onClick}
                    />
                  );
                })
              : null}
          </div>
        </div>

        <div className={styles['maid-interest']}>
          <div className={styles['maid-interest-box']}>
            <div className={styles['maid-interest__title']}>你可能感兴趣</div>
          </div>
          <div className={styles['maid-chips']}>
            {Array.isArray(chips) && chips.length > 0
              ? chips.map((c, i) => <Chip key={safeStr(c) || `chip-${i}`} text={safeStr(c)} />)
              : null}
          </div>
        </div>
      </section>
      <MobileInputBar openCommand={() => openCommand?.()} />
    </main>
  );
};

export default Dialogue;
