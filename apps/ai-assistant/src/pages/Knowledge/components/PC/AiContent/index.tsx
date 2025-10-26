import React, { useState } from 'react';
import { Button, Drawer, message } from 'antd';
import { CloseOutlined, SearchOutlined, UserOutlined } from '@yth/icons';
import styles from './index.module.less';
import MainLogo from '../../../assets/pc/main-logo.png';

import AiWriting from './AiWriting';
import { Action } from '../types';
import CustomEditor from '../../CustomEditor';
import AiInput, { AiInputAction, AiInputActionEnum } from '../AiInput';

const enum SubActionEnum {
  SearchUserInfo = 'searchUserInfo',
  ToAsk = 'toAsk',
  TodayNews = 'todayNews',
  MyHoliday = 'myHoliday',
}
type SubAction = `${SubActionEnum}`;
interface AiAssistantPageProps {
  onChangeToMainContent?: (
    action: Action,
    params?: { content?: string; action: SubAction; config?: AiInputParams },
  ) => void;
}
/**
 * 输入框传递给父组件的参数
 */
interface AiInputParams {
  /** 输出框内容 */
  text?: string;
  /** 附件 */
  attachments?: string | string[];
  /** 是否开启网络搜索 */
  onlineNet: boolean;
  /** 是否开启深度搜索 */
  deepSeek: boolean;
  /** 大模型 */
  model: string;
}
const enum ActionEnum {
  /**
   * 切换右侧为ai问答页
   */
  AiRequest = 'AiRequest',
  /**
   * 切换右侧为知识库
   */
  KnowledgeRepository = 'KnowledgeRepository',
}

const AiAssistantPage: React.FC<AiAssistantPageProps> = ({ onChangeToMainContent }) => {
  const [question, setQuestion] = useState('');
  const suggestedQuestions = [
    {
      question: '今日集团要闻',
      html: <span className={styles.hightLight}>今日集团要闻</span>,
    },
    {
      question: '我的公休假',
      html: <span className={styles.hightLight}>我的公休假</span>,
    },
    {
      question: '帮我查询某人的联系方式',
      html: (
        <div>
          <span className={styles.hightLight}>联系方式查询</span> 帮我查询
          {/* <div className={styles.userName} contentEditable data-action="input-name">
            姓名
          </div> */}
          <CustomEditor
            className={styles.userName}
            placeholder="请输入姓名"
            onInput={(val) => setQuestion(val)}
          />
          的联系方式
        </div>
      ),
    },
    {
      question: '宏观经济分析',
      html: <span className={styles.hightLight}>宏观经济分析</span>,
    },
    {
      question: '市场行情分析',
      html: <span className={styles.hightLight}>市场行情分析</span>,
    },
  ];

  const handleLogin = () => {
    message.info('登录功能');
  };

  const [renderQuestions, setRenderQuestions] = useState<React.ReactNode>(null);
  const onSend = (action: SubAction, content: string) => {
    if (!content.trim()) {
      message.error('请输入问题');
      return;
    }
    onChangeToMainContent?.(ActionEnum.AiRequest, { content, action });
  };

  const onChangeInput = (action: AiInputAction, config?: AiInputParams) => {
    if (action === AiInputActionEnum.InputAnswer) {
      if (question) {
        onSend(SubActionEnum.SearchUserInfo, question);
      } else {
        if (!config?.text?.trim()) {
          message.error('请输入问题');
          return;
        }
        onChangeToMainContent?.(ActionEnum.AiRequest, { action: SubActionEnum.ToAsk, config });
      }
    } else if (action === AiInputActionEnum.KnowledgeRepositoryAsk) {
      onChangeToMainContent?.(ActionEnum.KnowledgeRepository);
    }
  };
  /**
   * 口令问答点击
   */
  const askRequest = (index: number, ques: string) => {
    if (index === 0) {
      onSend(SubActionEnum.TodayNews, ques);
    } else if (index === 1) {
      onSend(SubActionEnum.MyHoliday, ques);
    } else if (index === 2) {
      setRenderQuestions(suggestedQuestions[index].html);
    }
  };
  // 右侧模态框
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.mainContent}>
      <div className={styles.mainContentInner}>
        <div className={styles.topHeader}>
          <Button className={styles.loginBtn} onClick={handleLogin}>
            <UserOutlined className={styles.loginIcon} />
            <span> 登录</span>
          </Button>
        </div>
        <div className={styles.aiAssistantSection}>
          <img className={styles.assistantLogo} src={MainLogo} alt="云天化ai logo" />
          <h1 className={styles.assistantTitle}>云天化AI助手</h1>
          <p className={styles.assistantDescription}>
            基于大模型能力打造的智能工作伙伴能够高效辅助用户在办公、业务场景中提升效率
          </p>
          <div className={styles.suggestedQuestions}>
            <div className={styles.suggestTitle}>
              <span>随身口令，你来说我照办:</span>
              <a className={styles.suggestMore} onClick={() => setOpen(true)}>
                查看更多&gt;&gt;
              </a>
            </div>
            <div className={styles.questionTags}>
              {suggestedQuestions.map((item, index) => (
                <button
                  key={index}
                  className={styles.questionTag}
                  onClick={() => askRequest(index, item.question)}
                >
                  {item.question}
                </button>
              ))}
            </div>
          </div>
          <AiInput renderQuestions={renderQuestions} onChange={onChangeInput} />
        </div>
        <AiWriting onChangeSliderBar={(e) => onChangeToMainContent?.(e)} />
        <Drawer
          title="指令中心"
          closeIcon={false}
          placement={'right'}
          onClose={() => setOpen(false)}
          open={open}
          width={360}
          extra={<CloseOutlined onClick={() => setOpen(false)} />}
        >
          <div className={styles.directInput}>
            <input type="text" placeholder="搜索文件名称" />
            <SearchOutlined style={{ fontSize: '20px' }} />
          </div>
          <div className={styles.directCont}>
            <div className={styles.directItem}>
              <div className={styles.directTitle}>今日集团要闻</div>
              <div className={styles.directContent}>
                汇总并提炼云天化集团内部的最新动态与重点 资讯
              </div>
            </div>
          </div>
        </Drawer>
        {/* <Modal
        title="温馨提示"
        open={isModalOpen}
        onOk={() => {
          setIsModalOpen(false); // 关闭模态框
        }}
        onCancel={() => setIsModalOpen(false)} // 点击取消或关闭图标时关闭模态框
        cancelText="取消"
        okText="确定"
        centered
      >
        <Input
          placeholder="请输入需要查询的姓名"
          value={question} // 绑定输入值
          onChange={(e) => setQuestion(e.target.value)} // 更新输入值
          autoFocus // 自动获取焦点
        />
      </Modal> */}
      </div>
    </div>
  );
};

export default AiAssistantPage;
