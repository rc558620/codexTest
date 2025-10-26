import React, { FC, useEffect, useState } from 'react';
import styles from './index.module.less';

import { Pagination, PaginationProps, Popover, Select } from 'antd';
import { DeleteOutlined } from '@yth/icons';
import {
  knowledgeCreate,
  knowledgeDelete,
  knowledgeEdit,
  knowledgeList,
  knowledgeListResponse,
  knowledgePersonList,
  KnowledgePersonListResponse,
} from '@/pages/Knowledge/api';
import { Action, ActionEnum } from '../types';
import Search from '../Base/Search';
import CreateKnowledgeModal from './components/CreateKnowledgeModal';
import { message, Modal } from '@yth/ui';
type onChangeToMainContentType = (action: Action, params?: any) => void;
interface KnowledgeRepositoryProps {
  params?: {
    id: string;
    departmentId: string;
    type?: 'company' | 'person';
  };
  onChangeToMainContent?: onChangeToMainContentType;
}

interface Params {
  id: string;
  departmentId: string;
  onChangeToMainContent?: onChangeToMainContentType;
}
// 个人知识库
const PersonKnowledgeRepository: FC<{ onChangeToMainContent?: onChangeToMainContentType }> = ({
  onChangeToMainContent,
}) => {
  const [current, setCurrent] = useState(1);
  const [total, setTotal] = useState(1);

  const [list, setList] = useState<KnowledgePersonListResponse['records'][number][]>([]);
  const getList = () => {
    knowledgePersonList({ pageNum: current, pageSize: 10 }).then((res) => {
      setTotal(res.total);
      setList(res.records);
    });
  };
  useEffect(() => {
    getList();
  }, [current]);
  const onChangeCurrent: PaginationProps['onChange'] = (page) => {
    setCurrent(page);
  };

  const [open, setOpen] = useState(false);
  const onChange = (value: string) => {
    console.log(`selected ${value}`);
  };

  const onSearch = (value: string) => {
    console.log('search:', value);
  };
  const content = (
    <div className={styles.knowledgePageCardContainer}>
      <div className={styles.fallbackTitle}>
        <div className={styles.lf}>发现以下知识</div>
        <div className={styles.rt}>全不添加</div>
      </div>
      <div className={styles.fallbackItemContainer}>
        <div className={styles.fallbackItem}>
          <img src="" className={styles.icon} alt="" />
          <div className={styles.mid}>
            <div className={styles.name}>知识库名称</div>
            <div className={styles.size}>知识库ID</div>
          </div>
          <DeleteOutlined className={styles.deleteIcon} />
        </div>
        <div className={styles.fallbackTip}>选择上传的知识库：</div>
        <Select
          style={{ width: '100%' }}
          showSearch
          placeholder="Select a person"
          optionFilterProp="label"
          onChange={onChange}
          onSearch={onSearch}
          options={[
            {
              value: 'jack',
              label: 'Jack',
            },
            {
              value: 'lucy',
              label: 'Lucy',
            },
            {
              value: 'tom',
              label: 'Tom',
            },
          ]}
        />
        <div className={styles.btns}>
          <button className={styles.btnCancel} onClick={() => setOpen(false)}>
            取消
          </button>
          <button className={styles.btnCentain}>提交</button>
        </div>
      </div>
      <div className={styles.fallbackItemContainer}>
        <div className={styles.fallbackItem}>
          <img src="" className={styles.icon} alt="" />
          <div className={styles.mid}>
            <div className={styles.name}>知识库名称</div>
            <div className={styles.size}>知识库ID</div>
          </div>
          <DeleteOutlined className={styles.deleteIcon} />
        </div>
        <div className={styles.fallbackTip}>选择上传的知识库：</div>
        <Select
          style={{ width: '100%' }}
          showSearch
          placeholder="Select a person"
          optionFilterProp="label"
          onChange={onChange}
          onSearch={onSearch}
          options={[
            {
              value: 'jack',
              label: 'Jack',
            },
            {
              value: 'lucy',
              label: 'Lucy',
            },
            {
              value: 'tom',
              label: 'Tom',
            },
          ]}
        />
        <div className={styles.btns}>
          <button className={styles.btnCancel} onClick={() => setOpen(false)}>
            取消
          </button>
          <button className={styles.btnCentain}>提交</button>
        </div>
      </div>
    </div>
  );

  const [openCreateModel, setOpenCreateModel] = useState(false);
  const [modelIsEdit, setModelIsEdit] = useState(false);
  const [editknowledgeData, setDditknowledgeData] = useState<{
    id: number;
    name: string;
    description: string;
  }>({
    name: '',
    description: '',
    id: 0,
  });

  /**
   * 创建知识库
   */
  const createKnowledge = () => {
    setOpenCreateModel(true);
    setModelIsEdit(false);
  };

  /**
   * 创建知识库提交
   */
  const modalSubmit = async ({ name, description }: { name: string; description: string }) => {
    if (!modelIsEdit) {
      await knowledgeCreate({ knowledgeName: name, description });
    } else {
      await knowledgeEdit({ id: editknowledgeData.id!, knowledgeName: name, description });
    }
    setOpenCreateModel(false);
    getList();
  };
  /**
   * 编辑知识库
   */
  const editKnowledgeRepo = async ({
    id,
    name,
    description,
  }: {
    id: number;
    name: string;
    description: string;
  }) => {
    setOpenCreateModel(true);
    setModelIsEdit(true);
    setDditknowledgeData({
      id,
      name,
      description,
    });
  };
  /**
   * 删除知识库
   */
  const deleteKnowledgeRepo = async (knowledgeId: string, text: string) => {
    Modal.confirm({
      title: '是否删除该知识库？',
      content: text,
      cancelText: '取消',
      okText: '确定',
      centered: true,
      async onOk() {
        await knowledgeDelete(knowledgeId);
        message.info(`已删除该知识库`);
        setList(list.filter((e) => e.knowledgeId !== knowledgeId));
      },
    });
  };
  return (
    <div className={styles.knowledgeTable}>
      <div className={styles.titleWrap}>
        <Popover
          content={content}
          open={open}
          onOpenChange={(e) => setOpen(e)}
          title={null}
          trigger="click"
        >
          <div className={styles.findBtn}>知识发现</div>
        </Popover>
        <div className={styles.createBtn} onClick={createKnowledge}>
          创建知识库
        </div>
      </div>
      <table className={styles.baseTable}>
        <thead>
          <tr className={styles.tableHeader}>
            <th className={styles.tableCell}>知识库名称</th>
            <th className={styles.tableCell}>文件数量</th>
            <th className={styles.tableCell}>知识库ID</th>
            <th className={styles.tableCell}>创建时间</th>
            <th className={styles.tableCell}>操作</th>
          </tr>
        </thead>
        <tbody>
          {list.map((item) => (
            <tr className={styles.tableBody} key={item.knowledgeId}>
              <td className={styles.tableCell}>{item.knowledgeName}</td>
              <td className={styles.tableCell}>{item.fileNum}</td>
              <td className={styles.tableCell}>
                <div className="clipText">{item.knowledgeId}</div>
              </td>
              <td className={styles.tableCell}>{item.createTime}</td>
              <td className={styles.tableCell}>
                <a
                  className={styles.personActionBtn}
                  onClick={() =>
                    onChangeToMainContent?.(ActionEnum.KnowledgeRepositoryDetail, {
                      type: 'person',
                      id: item.knowledgeId,
                    })
                  }
                >
                  查看
                </a>
                <a
                  className={styles.personActionBtn}
                  onClick={() =>
                    editKnowledgeRepo({
                      id: item.id,
                      name: item.knowledgeName,
                      description: item.description,
                    })
                  }
                >
                  编辑
                </a>
                <a
                  className={styles.personActionBtn}
                  onClick={() => deleteKnowledgeRepo(item.knowledgeId, item.knowledgeName)}
                >
                  删除
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.pagination}>
        <Pagination current={current} onChange={onChangeCurrent} total={total} />
      </div>
      <CreateKnowledgeModal
        show={openCreateModel}
        isEdit={modelIsEdit}
        editData={editknowledgeData}
        onSubmit={modalSubmit}
        oncancel={() => setOpenCreateModel(false)}
      />
    </div>
  );
};

// 公司知识库
const CompanyKnowledgeRepository: FC<Params> = ({ onChangeToMainContent, id, departmentId }) => {
  const [current, setCurrent] = useState(1);
  const [total, setTotal] = useState(1);
  const [list, setList] = useState<knowledgeListResponse['records'][number][]>([]);

  useEffect(() => {
    knowledgeList({ departmentId, catalogueId: id, page: current, limit: 10 }).then((res) => {
      setTotal(res.total);
      setList(res.records);
    });
  }, [id, departmentId, current]);

  const onChangeCurrent: PaginationProps['onChange'] = (page) => {
    setCurrent(page);
  };
  return (
    <div className={styles.knowledgeTable}>
      <div className={styles.titleWrap}>
        <div style={{ width: '216px' }}>
          <Search placeholder="搜索文件名称" />
        </div>
      </div>
      <table className={styles.baseTable}>
        <thead>
          <tr className={styles.tableHeader}>
            <th className={styles.tableCell}>知识库名称</th>
            <th className={styles.tableCell}>知识库描述</th>
            <th className={styles.tableCell}>文件数量</th>
            <th className={styles.tableCell}>知识库ID</th>
            <th className={styles.tableCell}>创建时间</th>
            <th className={styles.tableCell}>操作</th>
          </tr>
        </thead>
        <tbody>
          {list.map((item) => (
            <tr className={styles.tableBody} key={item.knowledgeId}>
              <td className={styles.tableCell}>{item.knowledgeBaseName}</td>
              <td className={styles.tableCell}>{item.description || '暂无'}</td>
              <td className={styles.tableCell}>{item.fileCount}</td>
              <td className={styles.tableCell}>
                <div className="clipText">{item.knowledgeId}</div>
              </td>
              <td className={styles.tableCell}>{item.createAt}</td>
              <td className={styles.tableCell}>
                <a
                  className={styles.companyActionBtn}
                  onClick={() =>
                    onChangeToMainContent?.(ActionEnum.KnowledgeRepositoryDetail, {
                      type: 'company',
                      id: item.knowledgeId,
                    })
                  }
                >
                  查看
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.pagination}>
        <Pagination current={current} onChange={onChangeCurrent} total={total} />
      </div>
    </div>
  );
};
const KnowledgeRepository: React.FC<KnowledgeRepositoryProps> = ({
  params,
  onChangeToMainContent,
}) => {
  if (!params) {
    return <div>请选择知识库</div>;
  }
  if (params.type === 'person') {
    return <PersonKnowledgeRepository onChangeToMainContent={onChangeToMainContent} />;
  }
  return (
    <CompanyKnowledgeRepository
      onChangeToMainContent={onChangeToMainContent}
      id={params.id}
      departmentId={params.departmentId}
    />
  );
};

export default KnowledgeRepository;
