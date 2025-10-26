import { FC, useState, useEffect, memo, useRef, useCallback } from 'react';
import { Collapse, Popover, Spin } from 'antd';
import styles from './index.module.less';
import useAIStream from '@/hooks/useAIStream';
import { findContactByName, oaNews, oaQuery, historyItem } from '@/pages/Knowledge/api';
import ReactAIRenderer from 'react-ai-renderer';
import { CaretRightOutlined, CopyOutlined, DislikeOutlined, LikeOutlined } from '@yth/icons';
import { copyText } from '@/pages/Knowledge/utils';
import { getToken } from '@/utils/request/index';
import AiInput, { AiInputActionEnum, AiInputRef } from '../AiInput';
// import { set } from '@yth/utils';

const enum Role {
  User = 'user',
  Assistant = 'assistant',
}

const enum MessageType {
  Text = 'text',
  Image = 'image',
  News = 'news',
  UserProfile = 'userProfile',
}
type MsgType = `${MessageType}`;

interface Message {
  id: string;
  role: `${Role}`;
  type: MsgType;
  content: any;
  isThink?: boolean;
  isComplete?: boolean;
  reference?: any[] | null;
  timestamp: Date;
}
type Model = '文心4.5' | '深度思考';
interface AiInputParams {
  text?: string;
  attachments?: string | string[];
  onlineNet: boolean;
  deepSeek: boolean;
  model: Model;
}
interface AiRequestProps {
  params?: {
    content: any;
    action: string;
    config?: AiInputParams;
  };
}

const MessageRenderer: React.FC<{ message: Message }> = ({ message }) => {
  if (message.type === MessageType.Text) {
    if (message.role === Role.User) {
      return <span className={styles.aiRequestMessageText}>{message.content}</span>;
    }
    if (message.reference) {
      return (
        <>
          <ReactAIRenderer>{message.content}</ReactAIRenderer>
          <Collapse
            bordered={false}
            expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
            style={{ background: '#fff' }}
            items={[
              {
                key: '1',
                label: '引用参考',
                children: (
                  <div>
                    {message.reference.map((e, index) => {
                      return (
                        <div className={styles.messageReference} key={e.source}>
                          <a
                            href={e.source}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={e.content}
                          >
                            {index + 1}、{e.content}
                          </a>
                        </div>
                      );
                    })}
                  </div>
                ),
              },
            ]}
          />
        </>
      );
    }
    return <ReactAIRenderer>{message.content}</ReactAIRenderer>;
  }
  if (message.type === MessageType.Image) {
    return <img src={message.content} alt="Image" />;
  }
  if (message.type === MessageType.News) {
    // 渲染新闻
    return (
      <div className={styles.aiRequestMessageNews}>
        {message.content.map((e: any) => (
          <div key={e.TITLE} className={styles.aiRequestMessageNewsItem}>
            <a
              className={styles.aiRequestMessageNewsTitle}
              href={e.URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              {e.TITLE}
            </a>
            <p className={styles.aiRequestMessageNewsDesc}>{e.TITLELONG}</p>
            <p className={styles.aiRequestMessageNewsTime}>
              {e.UNAME} {e.DATE}
            </p>
          </div>
        ))}
      </div>
    );
  }
  if (message.type === MessageType.UserProfile) {
    return (
      <div className={styles.aiRequestMessageUserProfile}>
        <p className={styles.aiRequestMessageUserProfileName}>{message.content.name}</p>
        <p className={styles.aiRequestMessageUserProfilePosition}>{message.content.mobile}</p>
        <p className={styles.aiRequestMessageUserProfilePosition}>{message.content.orgName}</p>
        <p className={styles.aiRequestMessageUserProfilePosition}>{message.content.postName}</p>
      </div>
    );
  }
};

// 优化消息项组件
const MessageItem: FC<{ message: Message }> = memo(({ message }) => {
  const [open, setOpen] = useState(false);
  const content = (
    <div className={styles.fallbackContainer}>
      <div className={styles.fallbackSub}>针对问题</div>
      <div className={styles.tagList}>
        <div className={styles.tag}>未理解问题</div>
        <div className={styles.tag}>遗忘上文</div>
      </div>
      <div className={styles.fallbackSub}>针对回答</div>
      <div className={styles.tagList}>
        <div className={styles.tag}>回答错误</div>
        <div className={styles.tag}>逻辑混乱</div>
      </div>
      <textarea
        className={styles.feedbackTextarea}
        placeholder="我们想知道你对此回答不满意的原因"
        rows={3}
        maxLength={60}
      />
      <div className={styles.btns}>
        <button className={styles.btnCancel} onClick={() => setOpen(false)}>
          取消
        </button>
        <button className={styles.btnCentain}>提交</button>
      </div>
    </div>
  );
  return (
    <div key={message.id} className={`${styles.aiRequestMessage} ${styles[message.role]}`}>
      <div className={styles.aiRequestMessageContent}>
        <div className={styles.aiRequestMessageBubble}>
          {message.role === Role.Assistant && message.isThink && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Spin size="small" />
              <span style={{ marginLeft: '10px' }}>AI正在思考中...</span>
            </div>
          )}
          <MessageRenderer message={message} />
          {message.isComplete && (
            <div style={{ marginTop: '10px' }}>
              <CopyOutlined
                onClick={() => copyText(message.content)}
                style={{ marginRight: '10px', fontSize: '16px', color: '#999' }}
              />
              <LikeOutlined style={{ marginRight: '10px', fontSize: '16px', color: '#999' }} />
              <Popover
                content={content}
                open={open}
                onOpenChange={(e) => setOpen(e)}
                title="请反馈您遇到的问题"
                trigger="click"
              >
                <DislikeOutlined style={{ marginRight: '10px', fontSize: '16px', color: '#999' }} />
              </Popover>
            </div>
          )}
        </div>
        <div className={styles.aiRequestMessageTime}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
});

interface AddMsgParams {
  myMsg: {
    type: MsgType;
    context: any;
  };
  api: Promise<any>; // 根据实际返回值可进一步细化
  assistantMsg: {
    type: MsgType;
  };
}
const enum SubActionEnum {
  SearchUserInfo = 'searchUserInfo',
  ToAsk = 'toAsk',
  TodayNews = 'todayNews',
  MyHoliday = 'myHoliday',
  History = 'history',
}
const AiRequest: FC<AiRequestProps> = ({ params }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentAiMessageIdRef = useRef<string | null>(null);
  const aiInputRef = useRef<AiInputRef>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest',
      });
    }, 100);
  };
  const isDev = process.env.NODE_ENV === 'development';
  const { loading, sendRequest } = useAIStream(
    `${isDev ? '' : process.env.YTH_API_PROXY_URL}/api/generalAbility/chat`,
    {
      onMessage: (res) => {
        console.log(res);
        let likeJsonStr = '';
        if (res.startsWith('data:')) {
          const [, temp] = res.split('data:');
          likeJsonStr = temp;
        } else if (res.startsWith('{')) {
          likeJsonStr = res;
        }
        if (likeJsonStr.startsWith('{')) {
          try {
            const temp = JSON.parse(likeJsonStr) as Record<string, any>;
            const chunk = temp.result as string;
            console.log(temp);
            // const sessionId = temp.sessionId;
            const isEnd = temp.is_end;

            const reference =
              Array.isArray(temp.referenceInfos) && temp.referenceInfos.length > 0
                ? (temp.referenceInfos as any[])
                : null;
            if (currentAiMessageIdRef.current) {
              // 更新AI消息内容
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  ...newMessages[newMessages.length - 1],
                  content: newMessages[newMessages.length - 1].content + chunk,
                  isThink: false,
                  reference,
                  isComplete: isEnd,
                };
                return newMessages;
              });
            }
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
        }
      },
      onComplete: () => {
        console.log('Stream completed');
        currentAiMessageIdRef.current = null;
      },
      onError: (error) => {
        console.error('Stream error:', error);
        currentAiMessageIdRef.current = null;
        scrollToBottom();
      },
    },
  );

  const handleClear = () => {
    // 调用子组件的 clear 方法
    aiInputRef.current?.clear();
  };
  const addMsgToScreen = useCallback(
    async ({ myMsg, api, assistantMsg }: AddMsgParams) => {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: Role.User,
        type: myMsg.type,
        content: myMsg.context,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      const res = await api;
      if (!res) return;
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: Role.Assistant,
          type: assistantMsg.type,
          content: res,
          timestamp: new Date(),
        },
      ]);
      scrollToBottom();
    },
    [setMessages, scrollToBottom],
  );
  // 发送请求到AI接口
  const onAskRequest = useCallback(
    async (query?: string) => {
      console.log(query);
      scrollToBottom();

      const userMessage: Message = {
        id: Date.now().toString(),
        role: Role.User,
        type: MessageType.Text,
        content: query || '',
        timestamp: new Date(),
      };

      handleClear();
      setMessages((prev) => [...prev, userMessage]);

      const aiMessageId = (Date.now() + 1).toString();
      const aiMessage: Message = {
        id: aiMessageId,
        type: MessageType.Text,
        role: Role.Assistant,
        content: '',
        isThink: true,
        isComplete: true,
        timestamp: new Date(),
      };

      currentAiMessageIdRef.current = aiMessageId;
      setMessages((prev) => [...prev, aiMessage]);

      sendRequest(
        {
          query,
          model: params?.config?.model,
          netSwitch: params?.config?.onlineNet || false,
        },
        {
          token: getToken() || '',
        },
      );
    },
    [handleClear, params, sendRequest, setMessages, scrollToBottom],
  );
  useEffect(() => {
    console.log(params);
    if (params?.action === SubActionEnum.TodayNews) {
      addMsgToScreen({
        myMsg: {
          type: MessageType.Text,
          context: '今日集团要闻',
        },
        api: oaNews({ columnType: '5277801026518207942' }).then((res) => res.data.bulletinList),
        assistantMsg: {
          type: MessageType.News,
        },
      });
    } else if (params?.action === SubActionEnum.MyHoliday) {
      oaQuery({ userCode: '10000231' });
    } else if (params?.action === SubActionEnum.SearchUserInfo) {
      addMsgToScreen({
        myMsg: {
          type: MessageType.Text,
          context: params.content,
        },
        api: findContactByName(params?.content || '').then((res) => res?.[0] || ''),
        assistantMsg: {
          type: MessageType.UserProfile,
        },
      });
    } else if (params?.action === SubActionEnum.History) {
      addMsgToScreen({
        myMsg: {
          type: MessageType.Text,
          context: params.content.text,
        },
        api: historyItem(params?.content.id).then((res) => res?.answer || ''),
        assistantMsg: {
          type: MessageType.Text,
        },
      });
    } else {
      onAskRequest(params?.config?.text);
    }
  }, []);

  return (
    <div className={styles.aiRequestContainer}>
      <div className={styles.aiRequestInner}>
        <h2 className={styles.aiRequestHeader}>AI智能问答</h2>
        <div className={styles.aiRequestMessages}>
          {messages.length === 0 ? (
            <div className={styles.aiRequestEmpty}>
              <p>暂无对话记录</p>
              <p>请输入问题开始对话</p>
            </div>
          ) : (
            messages.map((msg) => <MessageItem key={msg.id} message={msg} />)
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.aiRequestInput}>
          <AiInput
            ref={aiInputRef}
            loading={loading}
            disabledKnowLedge
            onChange={(action, config) => {
              if (action !== AiInputActionEnum.InputAnswer) return;
              onAskRequest(config?.text);
            }}
          />
        </div>
      </div>
    </div>
  );
};
AiRequest.displayName = 'AiRequest';
export default memo(AiRequest);
