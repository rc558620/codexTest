import React, { useEffect, useState } from 'react';
import { Button, message } from 'antd';
import './index.less';
import { innovationSpacelist, sortinnovation, addinnovation, updateinnovation } from '../../../api';
import ToolBox from './components/toolbox';
import AddAppModal from './components/AddAppModal';
import AuthorizeModal from './components/AuthorizeModal';

const InnovationSpace: React.FC = () => {
  const [addAppModalVisible, setAddAppModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [authorizeModalVisible, setAuthorizeModalVisible] = useState(false);
  const [isDragMode, setIsDragMode] = useState(false);
  const [toolBoxData, setToolBoxData] = useState([
    {
      id: 1,
      icon: 'https://avatars.githubusercontent.com/u/25508003',
      name: 'AI写作',
      creatorName: '李白',
      description: '快速生成、优化和校对文本，提升写作效率与质量，支持多种文档格式和写作场景',
      tags: [
        { id: '111', name: '标签1' },
        { id: '222', name: '写作助手' },
      ],
    },
  ]);

  // 初始化数据列表 初始化toolBoxData
  const initinnovationSpaceList = async () => {
    const resp = await innovationSpacelist();
    setToolBoxData(resp.records || resp);
  };

  useEffect(() => {
    initinnovationSpaceList();
  }, []);

  // 处理添加/编辑应用
  const handleAddApp = async (values: any) => {
    if (isEditMode) {
      // 编辑模式：调用updateinnovation接口，传入id
      const tags = values?.SelectedTags?.map((it: any) => ({ id: it.value, name: it.label }));
      const param = { ...values, tags, id: editData.id };
      delete param.SelectedTags;
      await updateinnovation(param);
      initinnovationSpaceList();
      message.success('应用编辑成功！');
    } else {
      // 新增模式：调用addinnovation接口
      const tags = values?.SelectedTags?.map((it: any) => ({ id: it.value, name: it.label }));
      const param = { ...values, tags };
      delete param.SelectedTags;
      await addinnovation(param);
      initinnovationSpaceList();
      message.success('应用添加成功！');
    }
    setAddAppModalVisible(false);
    setIsEditMode(false);
    setEditData(null);
  };

  // 打开添加应用弹框
  const handleOpenAddAppModal = () => {
    setIsEditMode(false);
    setEditData(null);
    setAddAppModalVisible(true);
  };

  // 关闭添加应用弹框
  const handleCloseAddAppModal = () => {
    setAddAppModalVisible(false);
    setIsEditMode(false);
    setEditData(null);
  };

  // 处理编辑应用
  const handleEditApp = (data: any) => {
    setIsEditMode(true);
    setEditData(data);
    setAddAppModalVisible(true);
  };

  // 处理授权应用
  const handleAuthorizeApp = (data: any) => {
    setEditData(data); // 设置当前要授权的应用数据
    setAuthorizeModalVisible(true);
  };

  // 处理授权提交
  const handleAuthorizeSubmit = async (values: any) => {
    console.log('授权数据:', values);
    try {
      await updateinnovation({
        id: editData.id,
        authorizedOrgIds: values.organizationIds,
      });
      message.success('授权设置成功！');
      setAuthorizeModalVisible(false);
      setEditData(null); // 清空编辑数据
      initinnovationSpaceList(); // 刷新列表数据
    } catch (error) {
      console.error('授权设置失败:', error);
    }
  };

  // 关闭授权弹框
  const handleCloseAuthorizeModal = () => {
    setAuthorizeModalVisible(false);
    setEditData(null); // 清空编辑数据
  };

  // 切换拖拽模式
  const handleToggleDragMode = () => {
    setIsDragMode(!isDragMode);
  };

  // 处理拖拽排序
  const handleDragEnd = async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    const items = Array.from(toolBoxData);
    const [reorderedItem] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, reorderedItem);

    const arr = items?.map((i: any, index: number) => ({ id: i.id, sortOrder: index + 1 }));
    await sortinnovation({ sortItems: arr });
    initinnovationSpaceList();
    message.success('排序已保存');
  };

  return (
    <div className="cards-wrap">
      <div className="operation-banner">
        <Button type="link" onClick={handleOpenAddAppModal}>
          应用发布
        </Button>
        <Button
          type="link"
          onClick={handleToggleDragMode}
          style={{ color: isDragMode ? '#1890ff' : undefined }}
        >
          {isDragMode ? '退出排序' : '应用排序'}
        </Button>
      </div>
      <div className="tool-container">
        {toolBoxData?.map((item: any, index) => (
          <ToolBox
            id={item.id}
            key={index}
            icon={item.icon}
            name={item.name}
            creatorName={item.creatorName}
            creatorId={item?.creatorId}
            link={item?.link}
            more={item?.more}
            companyName={item?.companyName}
            deptName={item?.deptName}
            description={item.description}
            tags={item?.tags || []}
            onEdit={handleEditApp}
            onAuthorize={() => handleAuthorizeApp(item)}
            isDragMode={isDragMode}
            index={index}
            onDelete={() => initinnovationSpaceList()}
            onDragEnd={handleDragEnd}
          />
        ))}
      </div>

      {/* 添加/编辑应用弹框 */}
      <AddAppModal
        visible={addAppModalVisible}
        onCancel={handleCloseAddAppModal}
        onSubmit={handleAddApp}
        isEdit={isEditMode}
        editData={editData}
      />

      {/* 授权弹框 */}
      <AuthorizeModal
        visible={authorizeModalVisible}
        onCancel={handleCloseAuthorizeModal}
        onSubmit={handleAuthorizeSubmit}
      />
    </div>
  );
};

export default InnovationSpace;
