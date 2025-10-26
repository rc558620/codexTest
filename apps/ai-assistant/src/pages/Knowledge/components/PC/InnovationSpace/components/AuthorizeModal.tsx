import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Cascader } from 'antd';
import { CloseOutlined } from '@yth/icons';
import './AuthorizeModal.less';
import { getOrgTree } from '../../../../api';

interface Option {
  value: string;
  label: string;
  children?: Option[];
}

interface AuthorizeModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
}

const AuthorizeModal: React.FC<AuthorizeModalProps> = ({ visible, onCancel, onSubmit }) => {
  const [form] = Form.useForm();
  const [organizationOptions, setorganizationOptions] = useState<Option[]>([]);
  const [selectedOrgIds, setSelectedOrgIds] = useState<string[]>([]);

  // 递归转换数据结构：name -> label, id -> value
  const transformOrgData = (data: any[]): Option[] => {
    return data.map((item) => ({
      value: item.id,
      label: item.name,
      children: item.children && item.children.length > 0 ? transformOrgData(item.children) : [],
    }));
  };

  const initTreeData = async () => {
    const resp = await getOrgTree({ parentId: -1 });
    if (resp && resp.length > 0) {
      const transformedData = transformOrgData(resp);
      setorganizationOptions(transformedData);
    } else {
      setorganizationOptions([]);
    }
  };

  useEffect(() => {
    if (visible) {
      initTreeData();
    }
  }, [visible]);

  // 获取所有后代节点ID（不包含当前节点）
  const getDescendantOrgIds = (org: Option): string[] => {
    if (!org.children || org.children.length === 0) return [];
    const ids: string[] = [];
    org.children.forEach((child) => {
      ids.push(child.value);
      ids.push(...getDescendantOrgIds(child));
    });
    return ids;
  };

  // 处理选择的组织数据
  const processSelectedOrgs = (selectOptions: Option[][]) => {
    const allOrgIds: string[] = [];

    selectOptions.forEach((optionPath) => {
      if (!optionPath || optionPath.length === 0) return;
      const lastNode = optionPath[optionPath.length - 1];
      // 若最后一级仍有子节点，则视作上级组织（公司/部门）选择，需包含其所有子孙节点
      if (lastNode.children && lastNode.children.length > 0) {
        // 仅存储子孙节点ID，不包含当前节点ID
        const ids = getDescendantOrgIds(lastNode);
        allOrgIds.push(...ids);
      } else {
        // 叶子节点只添加自身
        allOrgIds.push(lastNode.value);
      }
    });

    // 去重
    const uniqueIds = Array.from(new Set(allOrgIds));
    setSelectedOrgIds(uniqueIds);
    console.log('处理后的组织ID数组:', uniqueIds);
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        // 将处理后的组织ID数组添加到提交数据中
        const submitData = {
          ...values,
          organizationIds: selectedOrgIds,
        };
        console.log('授权数据:', submitData);
        onSubmit(submitData);
        form.resetFields();
        setSelectedOrgIds([]); // 清空选择的组织ID
      })
      .catch((errorInfo) => {
        console.log('表单验证失败:', errorInfo);
      });
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedOrgIds([]); // 清空选择的组织ID
    onCancel();
  };

  // 级联选择器变化处理 - 只能选择叶子节点
  const onChange = (value: string[][], selectOptions: Option[][]) => {
    console.log('选择的组织路径:', value);
    console.log('选择的选项:', selectOptions);

    // 处理选择的组织数据
    processSelectedOrgs(selectOptions);
  };

  return (
    <Modal
      title="添加授权对象"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={700}
      className="authorize-modal"
      closeIcon={<CloseOutlined />}
    >
      <Form form={form} layout="vertical" requiredMark={false} className="authorize-form">
        {/* 授权组织选择 */}
        <Form.Item
          label={<span className="required-label">授权组织</span>}
          name="organization"
          rules={[{ required: true, message: '请选择授权组织' }]}
        >
          <Cascader
            options={organizationOptions}
            onChange={onChange}
            // changeOnSelect
            multiple
            placeholder="请选择组织"
            displayRender={(labels, selectedOptions) => {
              return labels.map((label, index) => {
                const option = selectedOptions?.[index];
                return (
                  <span key={option?.value || index}>
                    {label}
                    {index < labels.length - 1 && (
                      <span className="cascader-separator"> {'>'} </span>
                    )}
                  </span>
                );
              });
            }}
            className="organization-cascader"
          />
        </Form.Item>

        {/* 按钮组 */}
        <Form.Item className="form-buttons">
          <div className="button-group">
            <Button onClick={handleCancel} className="cancel-btn">
              取消
            </Button>
            <Button type="primary" onClick={handleSubmit} className="submit-btn">
              提交
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AuthorizeModal;
