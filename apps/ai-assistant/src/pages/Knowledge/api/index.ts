import request from '@/utils/request/index';

/**
  知识库群组列表
  GET /knowledge/groupList
 */
export const knowledgeGroupList = () => {
  return request.get<any, any[]>('/api/knowledge/groupList');
};
export interface ConversationListRequest {
  pageNum: number;
  pageSize: number;
  userId: string;
  conversationId: string;
}

export interface historyListResponse {
  records: Array<{
    id: number;
    conversationId: string;
    userId: string;
    agentType: string;
    question: string;
    answer: string;
    status: number;
    statusDesc: string;
    errorMessage: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

/**
 * 分页查询历史记录
 * @param {ConversationListRequest} ConversationListRequest
 * @returns
 */
export const historyList = (data: ConversationListRequest) => {
  return request.get<any, historyListResponse>('/api/conversation/history/page', {
    params: data,
  });
};

/**
 * 返回所有的模型名称
 * @returns
 */
export const generalAbilityModels = () => {
  return request.get<any, string[]>('/api/generalAbility/models');
};
/**
 * 根据ID查询历史记录
 * @param {number} id
 * @returns
 */
export const historyItem = (id: number) => {
  return request.get<any, { answer: string }>(`/api/conversation/history/${id}`);
};
export interface deleteHistoryByIdResponse {
  id: number;
  conversationId: string;
  userId: string;
  agentType: string;
  question: string;
  answer: string;
  status: number;
  statusDesc: string;
  errorMessage: string;
  createdAt: string;
  updatedAt: string;
}
/**
 * 删除历史记录
 * @param {id} string | number
 * @returns
 */
export const deleteHistoryById = (id: string | number) => {
  return request.delete<any, deleteHistoryByIdResponse>(`/api/conversation/history/${id}`, {});
};

export interface innovationSpaceRes {
  records: any[];
}
/**
 * 获取用户可见的创新空间列表
 * @returns
 */
export const innovationSpace = () => {
  return request.get<any, innovationSpaceRes>(`/api/innovation-space/user/visible`, {});
};

/**
 * 通过栏目类别号获取OA新闻列表
 * @returns
 */
export const generalAbility = (data: any) => {
  return request.post<any, any>(`/seeyon/rest/yth_ai/agentMethod`, data);
};

interface oaNewsRequest {
  method?: string;
  page?: number;
  pageSize?: number;
  columnType: string;
}
/**
 * 今日集团要闻（需要四个参数：method、page、pageSize、columnType）
 * @returns
 */
export const oaNews = ({
  method = 'queryMoreNews',
  page = 1,
  pageSize = 10,
  columnType,
}: oaNewsRequest) => {
  return request.post<any, any>(`/api/seeyon-oa/news`, { method, page, pageSize, columnType });
};

interface oaQueryRequest {
  method?: string;
  userCode: string;
}
/**
 * (页面我的公休假)根据用户工号查询本年度考勤数据
 * @returns
 */
export const oaQuery = ({ method = 'queryPersonDataByCode', userCode }: oaQueryRequest) => {
  return request.post<any, any>(`/api/seeyon-oa/attendance/query`, { method, userCode });
};

/**
 * 帮我查询某人联系方式
 * @returns
 */
export const findContactByName = (name: string) => {
  return request.get<any, any>(`/api/user-contact/with-mobile/${name}`);
};

/**
 * 上传文件-临时文件问答
 * @returns
 */
export const generalAbilityUpoad = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return request.post<any, any>(`/api/generalAbility/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
interface KnowledgeListRequest {
  catalogueId: string;
  page: number;
  limit: number;
  departmentId: string;
}
export interface knowledgeListResponse {
  records: Array<{
    knowledgeBaseName: string;
    description: string;
    fileCount: number;
    knowledgeId: string;
    createAt: string;
  }>;
  total: number;
  size: number;
  current: number;
}
/**
 * 查询公司知识库列表
 * @param { KnowledgeListRequest } KnowledgeListRequest
 * @returns
 */
export const knowledgeList = ({ catalogueId, page, limit, departmentId }: KnowledgeListRequest) => {
  return request.post<any, knowledgeListResponse>(`/api/knowledge/list`, {
    catalogueId,
    page,
    limit,
    departmentId,
  });
};

export interface KnowledgePersonListRequest {
  query?: string;
  pageSize: number;
  pageNum: number;
}
export interface KnowledgePersonListResponse {
  records: Array<{
    id: number;
    knowledgeName: string;
    knowledgeId: string;
    fileNum: number;
    description: string;
    createBy: string;
    createTime: string;
  }>;
  total: number;
  size: number;
  current: number;
}

/**
 * 查询个人知识库列表
 * @param { KnowledgePersonListRequest } KnowledgePersonListRequest
 * @returns
 */
export const knowledgePersonList = ({ query, pageSize, pageNum }: KnowledgePersonListRequest) => {
  return request.get<any, KnowledgePersonListResponse>(`/api/knowledge/person`, {
    params: {
      query,
      pageSize,
      pageNum,
    },
  });
};

export interface knowledgeCreateRequest {
  knowledgeName: string;
  description?: string;
  pathPrefix?: string;
}

/**
 * 查询个人知识库列表
 * @param { knowledgeCreateRequest } knowledgeCreateRequest
 * @returns
 */
export const knowledgeCreate = ({
  knowledgeName,
  description,
  pathPrefix,
}: knowledgeCreateRequest) => {
  return request.post<any, string>(`/api/knowledge/create`, {
    knowledgeName,
    description,
    pathPrefix,
  });
};

export interface knowledgeEditRequest {
  id: number;
  knowledgeName?: string;
  description?: string;
}

/**
 * 查询个人知识库列表
 * @param { knowledgeEditRequest } knowledgeEditRequest
 * @returns
 */
export const knowledgeEdit = ({ knowledgeName, description, id }: knowledgeEditRequest) => {
  return request.put<any, string>(`/api/knowledge/person`, {
    params: {
      knowledgeName,
      description,
      id,
    },
  });
};

/**
 * 查询个人知识库列表
 * @param { string } knowledgeId
 * @returns
 */
export const knowledgeDelete = (knowledgeId: string) => {
  return request.delete<any, string>(`/api/knowledge/${knowledgeId}`);
};

/**
 * 获取用户可见的创新空间列表
 * @returns
 */
export const innovationSpacelist = () => {
  return request.get<any, innovationSpaceRes>(`/api/innovation-space/user/visible`, {});
};

/**
 * 获取所有标签列表
 * @returns
 */
export const alltag = () => {
  return request.get<any, any>(`/api/tag/all`);
};

/**
 * 获取创新空间详情
 * @returns
 */
export const getInnovationById = (id: number) => {
  return request.get<any, any>(`/api/innovation-space/detail/${id}`);
};

/**
 * 创建标签
 * @returns
 */
export const createtag = (data: any) => {
  return request.post<any, any>(`/api/tag/create`, data);
};

/**
 * 编辑创新空间（仅管理员）
 * @returns
 */
export const updateinnovation = (data: any) => {
  return request.post<any, any>(`/api/innovation-space/update`, data);
};

/**
 * 添加创新空间（仅管理员）
 * @returns
 */
export const addinnovation = (data: any) => {
  return request.post<any, any>(`/api/innovation-space/add`, data);
};

/**
 * 更新创新空间排序（仅管理员）
 * @returns
 */
export const sortinnovation = (data: any) => {
  return request.post<any, any>(`/api/innovation-space/sort`, data);
};

/**
 * 分页查询用户列表
 * @returns
 */
export const getOrgUsersList = (data: any) => {
  return request.get<any, any>(`/api/orgs/users`, {
    params: data,
  });
};

/**
 * 查询组织信息
 * @returns
 */
export const getOrgInfo = (data: any) => {
  return request.get<any, any>(`/api/orgs/info`, {
    params: data,
  });
};

/**
 * 删除标签
 * @param {id} string | number
 * @returns
 */
export const deletetag = (id: string | number) => {
  return request.delete<any, any>(`/api/tag/${id}`);
};

/**
 * 删除创新空间（仅管理员）
 * @param {id} number
 * @returns
 */
export const deleteinnovationspace = (id: number) => {
  return request.delete<any, any>(`/api/innovation-space/delete/${id}`);
};

/**
 * 获取组织树
 * @returns
 */
export const getOrgTree = (data: any) => {
  return request.get<any, any>(`/api/orgs/tree`, {
    params: data,
  });
};
