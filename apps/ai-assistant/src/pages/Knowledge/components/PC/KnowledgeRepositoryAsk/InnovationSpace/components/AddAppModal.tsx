import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Upload, message, Space, Image } from 'antd';
import { PlusOutlined, CloseOutlined } from '@yth/icons';
import type { UploadProps, UploadFile, GetProp } from 'antd';
import './AddAppModal.less';
import { alltag, createtag, getOrgUsersList, getOrgInfo } from '../../../../api';

const { TextArea } = Input;

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

interface AddAppModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  editData?: any; // 编辑时的数据
  isEdit?: boolean; // 是否为编辑模式
}

const DEFAULT_ICON_URL = 'https://avatars.githubusercontent.com/u/25508003';

const AddAppModal: React.FC<AddAppModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  editData,
  isEdit = false,
}) => {
  const [form] = Form.useForm();
  const [iconUrl, setIconUrl] = useState<string>(DEFAULT_ICON_URL);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [tagOptions, settagOptions] = useState([]);
  const [userOptions, setuserOptions] = useState([]);
  const [SelectedTags, setSelectedTags] = useState([]);

  // 预览处理
  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  // 文件列表变化处理
  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    // 如果文件上传成功，设置图标URL
    const lastFile = newFileList[newFileList.length - 1];
    if (lastFile?.status === 'done' && lastFile.url) {
      setIconUrl(lastFile.url);
      form.setFieldsValue({ icon: lastFile.url });
    }
  };

  // 图标上传配置
  const uploadProps: UploadProps = {
    name: 'file',
    action: '/api/upload',
    headers: {
      authorization: 'authorization-text',
    },
    beforeUpload(file) {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('只能上传图片文件!');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('图片大小不能超过 2MB!');
        return false;
      }
      return true;
    },
    onChange: handleChange,
    onPreview: handlePreview,
    onRemove: (file) => {
      // 如果删除的是当前选中的图标，清空iconUrl
      if (file.url === iconUrl) {
        setIconUrl('');
        form.setFieldsValue({ icon: '' });
      }
    },
  };

  // 上传按钮
  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      <PlusOutlined />
    </button>
  );

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        onSubmit({ ...values, SelectedTags });
        form.resetFields();
        setIconUrl(DEFAULT_ICON_URL);
      })
      .catch((errorInfo) => {
        console.log('表单验证失败:', errorInfo);
      });
  };

  //  选择标签改变
  const handleTagsChange = async (value: any, option: any) => {
    console.log(value, 'value----tags---');
    console.log(option, 'option----tags---');
    setSelectedTags(option);
    if (value.length > 0) {
      const newoption = value[value.length - 1];
      const arr = option.map((item: any) => item.value);
      if (arr.includes(newoption)) {
        //  不新增，不做任何操作
        console.log('不做任何操作');
      } else {
        await createtag({ name: newoption });
      }
    }
  };

  //  获取所有标签
  const initAllTagList = async () => {
    const resp = await alltag();
    settagOptions(resp.map((it: any) => ({ value: it.id, label: it.name })));
  };

  //  获取所有用户名
  const initAllUsers = async () => {
    const resp = await getOrgUsersList({ pageNum: 1, pageSize: 100 });
    setuserOptions(
      resp?.records?.map((it: any) => ({ value: it.id, label: it.name, orgId: it.orgId })),
    );
  };

  const handleChangeCreator = async (orgId: string, option: any) => {
    const resp = await getOrgInfo({ orgId: option.orgId });
    form.setFieldsValue({
      deptName: resp?.deptName,
      companyName: resp?.companyName,
    });
  };

  useEffect(() => {
    if (visible) {
      initAllTagList();
      initAllUsers();
    }
  }, [visible]);

  //  数据回填逻辑
  useEffect(() => {
    if (visible && isEdit && editData) {
      console.log(editData, 'editData----编辑数据');
      //  设置表单值
      form.setFieldsValue({
        icon: editData.icon,
        name: editData.name,
        description: editData.description,
        tags: editData.tags?.map((it: any) => it.id),
        link: editData.link,
        creatorId: editData.creatorId,
        companyName: editData.companyName,
        deptName: editData.deptName,
        more: editData.more,
      });
      setSelectedTags(editData.tags?.map((it: any) => ({ value: it.id, label: it.name })));

      // 设置图标 URL 和文件列表
      setIconUrl(editData.icon);
      if (editData.icon) {
        setFileList([
          {
            uid: '-1',
            name: 'icon.png',
            status: 'done',
            url: editData.icon,
          },
        ]);
      }
    } else if (visible && !isEdit) {
      // 新增模式，设置默认值
      form.resetFields();
      setIconUrl(DEFAULT_ICON_URL);
      // 设置默认图标
      form.setFieldsValue({ icon: DEFAULT_ICON_URL });
      setFileList([
        {
          uid: '-1',
          name: 'default-icon.png',
          status: 'done',
          url: DEFAULT_ICON_URL,
        },
      ]);
    }
  }, [visible, isEdit, editData, form]);

  const handleCancel = () => {
    form.resetFields();
    setIconUrl(DEFAULT_ICON_URL);
    setFileList([]);
    onCancel();
  };

  return (
    <Modal
      title={isEdit ? '编辑应用' : '添加应用'}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      className="add-app-modal"
      closeIcon={<CloseOutlined />}
    >
      <Form
        form={form}
        layout="horizontal"
        requiredMark={false}
        className="add-app-form"
        labelCol={{ span: 4 }}
      >
        {/* 图标选择 */}
        <Form.Item
          label={<span className="required-label">图标</span>}
          name="icon"
          initialValue={DEFAULT_ICON_URL}
        >
          <div className="icon-selector">
            <Upload {...uploadProps} listType="picture-circle" fileList={fileList} maxCount={1}>
              {fileList.length >= 1 ? null : uploadButton}
            </Upload>
            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
              支持上传图片，大小不超过 2MB
            </div>
          </div>
        </Form.Item>

        {/* 名称 */}
        <Form.Item
          label={<span className="required-label">名称</span>}
          name="name"
          rules={[{ required: true, message: '请输入应用名称' }]}
        >
          <Input placeholder="请输入应用名称" />
        </Form.Item>

        {/* 简述 */}
        <Form.Item
          label={<span className="required-label">简述</span>}
          name="description"
          rules={[{ required: true, message: '请输入应用简述' }]}
        >
          <TextArea
            rows={5}
            placeholder="请输入应用简述"
            showCount
            maxLength={200}
            style={{ height: 100, resize: 'none' }}
          />
        </Form.Item>

        {/* 标签 */}
        <Form.Item
          label={<span className="required-label">标签</span>}
          name="tags"
          rules={[{ required: true, message: '请选择标签' }]}
        >
          <Select
            mode="tags"
            placeholder="请选择标签"
            options={tagOptions}
            onChange={handleTagsChange}
            maxCount={3}
          />
        </Form.Item>

        {/* 应用链接 */}
        <Form.Item
          label={<span className="required-label">应用链接</span>}
          name="link"
          rules={[
            { required: true, message: '请输入应用链接' },
            { type: 'url', message: '请输入有效的链接地址' },
          ]}
        >
          <Input placeholder="请输入应用链接" />
        </Form.Item>

        {/* 创建人 */}
        <Form.Item
          label={<span className="required-label">创建人</span>}
          name="creatorId"
          rules={[{ required: true, message: '请选择创建人' }]}
        >
          <Select
            placeholder="请选择"
            options={userOptions}
            onChange={(val, option) => handleChangeCreator(val, option)}
          />
        </Form.Item>

        {/* 公司 */}
        <Form.Item label={<span>公司</span>} name="companyName">
          <Input placeholder="公司" disabled />
        </Form.Item>

        {/* 部门 */}
        <Form.Item label={<span>部门</span>} name="deptName">
          <Input placeholder="部门" disabled />
        </Form.Item>

        {/* 更多 */}
        <Form.Item label="更多" name="more">
          <TextArea
            rows={3}
            placeholder="请输入更多信息（可选）"
            showCount
            maxLength={500}
            style={{ height: 100, resize: 'none' }}
          />
        </Form.Item>

        {/* 按钮组 */}
        <Form.Item className="form-buttons">
          <Space>
            <Button onClick={handleCancel}>取消</Button>
            <Button type="primary" onClick={handleSubmit}>
              提交
            </Button>
          </Space>
        </Form.Item>
      </Form>

      {/* 图片预览 */}
      {previewImage && (
        <Image
          wrapperStyle={{ display: 'none' }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (imgvisible) => setPreviewOpen(imgvisible),
            afterOpenChange: (imgvisible) => !imgvisible && setPreviewImage(''),
          }}
          src={previewImage}
        />
      )}
    </Modal>
  );
};

export default AddAppModal;
