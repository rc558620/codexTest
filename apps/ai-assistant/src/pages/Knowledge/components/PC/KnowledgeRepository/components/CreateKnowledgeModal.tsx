import React, { useEffect } from 'react';
import { Form, Input, Button, Space } from 'antd';
import styles from './CreateKnowledgeModal.module.less';
import { Modal } from '@yth/ui';

interface CreateKnowledgeModalProps {
  show: boolean;
  onSubmit: (values: { name: string; description: string }) => void;
  oncancel: () => void;
  editData?: { id: number; name: string; description: string }; // 编辑时的数据
  isEdit?: boolean; // 是否为编辑模式
}

const CreateKnowledgeModal: React.FC<CreateKnowledgeModalProps> = ({
  show,
  onSubmit,
  oncancel,
  editData,
  isEdit = false,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form
      .validateFields()
      .then(async (values) => {
        await onSubmit({ ...values });
        form.resetFields();
      })
      .catch((errorInfo) => {
        console.log('表单验证失败:', errorInfo);
      });
  };

  //  数据回填逻辑
  useEffect(() => {
    console.log(editData);

    if (show && isEdit && editData) {
      //  设置表单值
      form.setFieldsValue({
        name: editData.name,
        description: editData.description,
      });
    } else if (show && !isEdit) {
      // 新增模式，设置默认值
      form.resetFields();
    }
  }, [show, isEdit, editData, form]);

  const handleCancel = () => {
    form.resetFields();
    oncancel();
  };

  return (
    <Modal
      title={isEdit ? '编辑知识库' : '创建知识库'}
      open={show}
      centered
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      <div style={{ marginTop: '40px' }} />
      <Form
        form={form}
        layout="horizontal"
        requiredMark={false}
        className={styles['add-app-form']}
        labelCol={{ span: 4 }}
      >
        {/* 名称 */}
        <Form.Item label={<span className={styles['required-label']}>知识库名称</span>}>
          <Form.Item
            noStyle
            name="name"
            rules={[
              {
                required: true,
                message: '请输入知识库名称',
                pattern: /^[\u4e00-\u9fa5a-zA-Z0-9_-]{1,50}$/,
              },
            ]}
          >
            <Input placeholder="请输入知识库名称" />
          </Form.Item>
          <div>
            <div className={styles['form-tip']}>
              知识库名称仅支持中文、英文、数字、下划线（_）、中划线（-）、英文点（.）（1～50字符）
            </div>
          </div>
        </Form.Item>
        {/* 简述 */}
        <Form.Item
          label={<span className={styles['required-label']}>知识库描述</span>}
          name="description"
          rules={[{ required: true, message: '请输入知识库描述' }]}
        >
          <Input.TextArea
            rows={5}
            placeholder="请输入知识库描述"
            showCount
            maxLength={500}
            style={{ height: 100, resize: 'none' }}
          />
        </Form.Item>

        {/* 按钮组 */}
        <Form.Item className={styles['form-buttons']}>
          <Space align="end">
            <Button onClick={handleCancel}>取消</Button>
            <Button type="primary" onClick={handleSubmit}>
              提交
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateKnowledgeModal;
