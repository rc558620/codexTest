import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { Input, Select, Upload } from 'antd';
import { PaperClipOutlined, PictureOutlined, LoadingOutlined } from '@yth/icons';
import styles from './index.module.less';
import classNames from 'classnames';

import netWorkIcon from '../../../assets/pc/net.png';
import netWorkActiveIcon from '../../../assets/pc/net-active.png';

import deepIcon from '../../../assets/pc/deep.png';
import deepActiveIcon from '../../../assets/pc/deep-active.png';

import knowledgeIcon from '../../../assets/pc/knowledge.png';
import wxyyIcon from '../../../assets/pc/wxyy.png';
import btnArrowIcon from '../../../assets/pc/btn-arrow.png';
import CustomTag from '../../CustomTag';
import { generalAbilityUpoad } from '@/pages/Knowledge/api';
import { RcFile } from 'antd/es/upload';
import { Button, message, Popover } from '@yth/ui';
import { ActionEnum } from '../types';
import { useModelList } from '@/pages/Knowledge/hooks/useModelList';

const getIcon = (iconName: string, { marginTop = '-3px' }: React.CSSProperties = {}) => {
  return <img src={iconName} style={{ marginTop }} alt="icon" />;
};
export const enum AiInputActionEnum {
  ClickUserName = 'clickUserName',
  InputQuestions = 'inputQuestions',
  InputAnswer = 'inputAnswer',
  KnowledgeRepositoryAsk = 'KnowledgeRepositoryAsk',
}
export type AiInputAction = `${AiInputActionEnum}`;

export interface AiInputRef {
  clear: () => void;
}
export interface AiInputParams {
  /** 输入的文本 */
  text?: string;
  /** 附件 */
  attachments?: string | string[];
  /** 联网搜索 */
  onlineNet: boolean;
  /** 深度搜索 */
  deepSeek: boolean;
  /** 模型 */
  model: string;
}
interface AiInputProps {
  value?: string;
  loading?: boolean;
  renderQuestions?: string | React.ReactNode;
  disabledKnowLedge?: boolean;
  onChange?: (action: AiInputAction, config?: AiInputParams) => void;
}

const AiInput = forwardRef<AiInputRef, AiInputProps>(
  ({ value = '', loading, renderQuestions, disabledKnowLedge = false, onChange }, ref) => {
    const [inputText, setInputText] = useState('');

    const [isFocus, setIsFocus] = useState(false);
    useImperativeHandle(ref, () => ({
      clear: () => {
        setInputText('');
      },
    }));

    const handleChange = () => {
      onChange?.(ActionEnum.KnowledgeRepositoryAsk);
    };

    const { models, selectedModel, setSelectedModel } = useModelList();

    const [checkedNetWork, setCheckedNetWork] = useState<boolean>(false);
    const [checkedDeepSeek, setCheckedDeepSeek] = useState<boolean>(false);

    const handleSend = useCallback(() => {
      onChange?.(AiInputActionEnum.InputAnswer, {
        text: inputText,
        onlineNet: checkedNetWork,
        deepSeek: checkedDeepSeek,
        model: selectedModel,
      });
    }, [inputText, checkedNetWork, checkedDeepSeek, selectedModel, onChange]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSend();
      } else if (e.shiftKey && e.key === 'Enter') {
        // 处理 Shift + Enter 换行
        e.preventDefault();
        // 插入换行符
        const textarea = e.target as HTMLTextAreaElement;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        // 在光标位置插入换行符
        const newValue = `${inputText.substring(0, start)}\n${inputText.substring(end)}`;
        setInputText(newValue);

        // 设置光标位置到换行符之后
        setTimeout(() => {
          textarea.selectionStart = start + 1;
          textarea.selectionEnd = start + 1;
        }, 0);
      }
    };

    const [uploading, setUploading] = useState(false); // 新增上传状态
    // 自定义文件上传处理函数
    const customUploadRequest = async (options: any) => {
      const { file, onSuccess, onError } = options;

      try {
        setUploading(true);
        const response = await generalAbilityUpoad(file); // 调用实际上传API
        setUploading(false);
        onSuccess(response, file);
        message.success(`${file.name} 文件上传成功`);
      } catch (error) {
        setUploading(false);
        onError(error);
        message.error(`${file.name} 文件上传失败`);
      }
    };

    // 处理文件选择变化
    const beforeUpload = (file: RcFile) => {
      const isLt10M = file.size / 1024 / 1024 < 10; // 限制文件大小为10MB
      if (!isLt10M) {
        message.error('文件大小不能超过 10MB!');
        return false;
      }
      return true;
    };

    useEffect(() => {
      if (value !== undefined) {
        setInputText(value);
      }
    }, [value]);

    return (
      <div className={classNames(styles.inputSection, isFocus ? styles.inputSectionBoxShadow : '')}>
        {/* <div
        className={styles.topInputActions}
        dangerouslySetInnerHTML={{ __html: renderQuestions || '' }}
        onClick={handleClick}
      ></div> */}
        <div className={styles.topInputActions}>{renderQuestions}</div>
        {!renderQuestions && <div className={styles.fileList}>{/* TODO */}</div>}
        <Input.TextArea
          value={inputText}
          autoSize={{ minRows: 5, maxRows: 5 }}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={5}
          placeholder={renderQuestions ? '' : '有问题,尽管问'}
          className={styles.inputField}
        />
        <div className={styles.footerSection}>
          <div className={styles.functionButtons}>
            <CustomTag
              className={styles.funcBtn}
              checkClassName={styles.funcBtnChecked}
              icon={checkedNetWork ? getIcon(netWorkActiveIcon) : getIcon(netWorkIcon)} // 修正图标引用
              checked={checkedNetWork}
              onChange={(e) => setCheckedNetWork(e)}
            >
              联网搜索
            </CustomTag>
            <CustomTag
              className={styles.funcBtn}
              checkClassName={styles.funcBtnChecked}
              icon={checkedDeepSeek ? getIcon(deepActiveIcon) : getIcon(deepIcon)}
              checked={checkedDeepSeek}
              onChange={(e) => setCheckedDeepSeek(e)}
            >
              深度思考
            </CustomTag>
            {!disabledKnowLedge && (
              <CustomTag
                className={styles.funcBtn}
                checkClassName={styles.funcBtnChecked}
                icon={getIcon(knowledgeIcon)}
                onChange={() => handleChange()}
              >
                知识库
              </CustomTag>
            )}
          </div>
          <div className={styles.inputActions}>
            <Select
              prefix={getIcon(wxyyIcon)}
              value={selectedModel}
              onChange={setSelectedModel}
              className={styles.modelSelect}
            >
              {models.map((model) => (
                <Select.Option key={model} value={model}>
                  {model}
                </Select.Option>
              ))}
            </Select>
            <div className={styles.actionIcons}>
              <Upload
                name="file"
                customRequest={customUploadRequest} // 使用自定义上传
                beforeUpload={beforeUpload} // 上传前检查
                showUploadList={false} // 不显示默认上传列表
              >
                <Popover
                  content={<div>支持PDF/Word/Excel/txt，最大50M</div>}
                  title={null}
                  placement="bottom"
                  trigger="hover"
                >
                  <Button
                    type="text"
                    icon={uploading ? <LoadingOutlined /> : <PaperClipOutlined />}
                    style={{ fontSize: '20px' }}
                    className={styles.actionIcon}
                  />
                </Popover>
              </Upload>
              <Popover
                content={<div>支持jpg/png/jpeg，最大10MB</div>}
                title={null}
                placement="bottom"
                trigger="hover"
              >
                <PictureOutlined style={{ fontSize: '20px' }} className={styles.actionIcon} />
              </Popover>
              {/* <AudioOutlined style={{ fontSize: '20px' }} className={styles.actionIcon} /> */}
            </div>
            <button
              className={classNames(styles.sendBtn, { [styles.sendBtnActive]: inputText })}
              onClick={handleSend}
            >
              {loading ? <div className={styles.stop} /> : getIcon(btnArrowIcon, {})}
            </button>
          </div>
        </div>
      </div>
    );
  },
);
AiInput.displayName = 'AiInput';
export default AiInput;
