import React, { useEffect, useState } from 'react';
import styles from './index.module.less';

import { Pagination, PaginationProps } from 'antd';
import { knowledgeList, knowledgeListResponse } from '@/pages/Knowledge/api';
import Search from '../Base/Search';
import { ExclamationCircleOutlined } from '@yth/icons';
import AiInput, { AiInputActionEnum } from '../AiInput';
import { DatePicker } from '@yth/ui';

interface KnowledgeRepositoryProps {
  params?: {
    id: string;
    departmentId: string;
    type?: 'company' | 'person';
  };
}

const KnowledgeRepositoryDetail: React.FC<KnowledgeRepositoryProps> = ({ params }) => {
  console.log(params);

  const { id = '', type, departmentId = '' } = params ?? {};
  const [current, setCurrent] = useState(1);
  const [total, setTotal] = useState(1);
  const [list, setList] = useState<knowledgeListResponse['records'][number][]>([]);
  console.log(type);

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
      <div className={styles.titleHead}>Agent相关知识</div>
      <div className={styles.titleWrap}>
        <div className={styles.lfBtn}>
          <div className={styles.uploadBtn}>+&nbsp;&nbsp;上传文件</div>
          <ExclamationCircleOutlined size={14} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className={styles.customPicker}>
            <DatePicker.RangePicker
              showTime
              placeholder={['开始时间', '结束时间']}
              format="YYYY/MM/DD"
            />
          </div>
          <div style={{ width: '216px', marginLeft: '12px' }}>
            <Search placeholder="搜索文件名称" />
          </div>
        </div>
      </div>

      <div className={styles.baseTable}>
        <div className={`${styles.tableRow} ${styles.tableHeader}`}>
          <div className={styles.tableCell}>知识库名称</div>
          <div className={styles.tableCell}>文件数量</div>
          <div className={styles.tableCell}>知识库ID</div>
          <div className={styles.tableCell}>创建时间</div>
          <div className={styles.tableCell}>操作</div>
        </div>
        {list.map((item) => (
          <div className={`${styles.tableRow} ${styles.tableBody}`} key={item.knowledgeId}>
            <div className={styles.tableCell}>{item.knowledgeBaseName}</div>
            <div className={styles.tableCell}>{item.fileCount}</div>
            <div className={styles.tableCell}>
              <div className="clipText">{item.knowledgeId}</div>
            </div>
            <div className={styles.tableCell}>{item.createAt}</div>
            <div className={styles.tableCell}>
              <a className={styles.actionBtn} href="">
                查看
              </a>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.pagination}>
        <Pagination current={current} onChange={onChangeCurrent} total={total} />
      </div>
      <div className={styles.conversationWrap}>
        <div className={styles.conversationTitle}>历史对话</div>
        <AiInput
          disabledKnowLedge
          onChange={(action) => {
            if (action !== AiInputActionEnum.InputAnswer) return;
            console.log(action);
          }}
        />
      </div>
    </div>
  );
};

export default KnowledgeRepositoryDetail;
