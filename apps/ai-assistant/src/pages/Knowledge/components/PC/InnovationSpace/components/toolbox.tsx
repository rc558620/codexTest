import React, { useState } from 'react';
import { Dropdown, message, Modal } from 'antd';
import type { MenuProps } from 'antd';
import { MoreOutlined, ExclamationCircleOutlined } from '@yth/icons';
import { deleteinnovationspace } from '../../../../api';
import './toolbox.less';
const { confirm } = Modal;

interface ToolBoxProps {
  id: number;
  icon: string;
  name: string;
  creatorName: string;
  creatorId: string;
  companyName: string;
  deptName: string;
  link: string;
  more: string;
  description: string;
  tags: [];
  onEdit?: (data: any) => void; // 编辑回调函数
  onAuthorize?: () => void; // 授权回调函数
  onDelete?: () => void; // 删除成功回调函数
  isDragMode?: boolean; // 是否为拖拽模式
  index?: number; // 索引
  onDragEnd?: (fromIndex: number, toIndex: number) => void; // 拖拽结束回调
}

const ToolBox: React.FC<ToolBoxProps> = ({
  id,
  icon,
  name,
  description,
  creatorId,
  creatorName,
  companyName,
  deptName,
  link,
  more,
  tags,
  onEdit,
  onAuthorize,
  onDelete,
  isDragMode = false,
  index = 0,
  onDragEnd,
}) => {
  const [visible, setVisible] = useState(false);

  // 拖拽开始处理
  const handleDragStart = (e: React.DragEvent) => {
    if (!isDragMode) return;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    (e.currentTarget as HTMLElement).style.opacity = '0.5';
  };

  // 拖拽结束处理
  const handleDragEnd = (e: React.DragEvent) => {
    if (!isDragMode) return;
    (e.currentTarget as HTMLElement).style.opacity = '1';
  };

  // 拖拽进入处理
  const handleDragOver = (e: React.DragEvent) => {
    if (!isDragMode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // 放置处理
  const handleDrop = (e: React.DragEvent) => {
    if (!isDragMode || !onDragEnd) return;
    e.preventDefault();

    const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (draggedIndex !== index) {
      onDragEnd(draggedIndex, index);
    }
  };

  // 菜单点击事件处理
  const onClick: MenuProps['onClick'] = ({ key }) => {
    switch (key) {
      case 'authorize':
        handleAuthorize();
        break;
      case 'edit':
        handleEdit();
        break;
      case 'delete':
        handleDelete();
        break;
      default:
        message.info(`点击了菜单项: ${key}`);
    }
  };

  const handleAuthorize = () => {
    console.log('授权操作');
    if (onAuthorize) {
      onAuthorize();
    }
  };

  const handleEdit = () => {
    console.log('编辑操作');
    if (onEdit) {
      // 构造编辑数据，包含所有必要信息
      const editData = {
        id,
        icon,
        name,
        description,
        creatorId,
        creatorName,
        companyName,
        deptName,
        link,
        more,
        tags,
      };
      onEdit(editData);
    }
  };

  //  删除
  const handleDelete = () => {
    confirm({
      title: '删除提示',
      icon: (
        <ExclamationCircleOutlined style={{ fontSize: '22px', color: 'red', marginRight: '6px' }} />
      ),
      content: '确认删除该应用吗?',
      okText: '确认删除',
      okType: 'primary',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteinnovationspace(id);
          message.success('删除成功');
          // 调用删除成功回调，通知父组件刷新列表
          if (onDelete) {
            onDelete();
          }
        } catch (error) {
          message.error('删除失败，请稍后重试');
          console.error('删除应用失败:', error);
        }
      },
    });
  };

  // 菜单项配置
  const items: MenuProps['items'] = [
    {
      label: '授权',
      key: 'authorize',
    },
    {
      label: '编辑',
      key: 'edit',
    },
    {
      label: '删除',
      key: 'delete',
    },
  ];

  return (
    <div
      className={`tool-box ${isDragMode ? 'drag-mode' : ''}`}
      draggable={isDragMode}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* 图标和标题区域 */}
      <div className="tool-box-header">
        {/* 图标 */}
        <div className="tool-box-icon">
          <img src={icon} alt={name} className="icon-image" />
        </div>

        {/* 标题和创建者 */}
        <div className="tool-box-title-section">
          <h3 className="tool-box-title">{name}</h3>
          <span className="tool-box-creator">@{creatorName}</span>
        </div>
      </div>

      {/* 描述 */}
      <p className="tool-box-description">{description}</p>

      {/* 标签 */}
      <div className="tool-box-tags">
        {tags?.map((tag, tagindex) => (
          <span key={tagindex} className="tool-box-tag">
            {tag?.name}
          </span>
        ))}
      </div>

      {/* 菜单按钮 */}
      <Dropdown
        menu={{ items, onClick }}
        trigger={['click']}
        open={visible}
        onOpenChange={setVisible}
      >
        <div className="tool-box-menu" onClick={(e) => e.preventDefault()}>
          <MoreOutlined style={{ fontSize: '22px' }} />
        </div>
      </Dropdown>
    </div>
  );
};

export default ToolBox;
