import { request } from '@/utils/request';

export const knowledgeApi = {
  /**
   * 分页查询历史记录
   * @param {ConversationListReq} data
   * @returns
   */
  historyList: (data: ConversationListReq) => {
    return request.get<any, ConversationListRes>('/api/conversation/history/page', {
      params: data,
    });
  },
};

export interface ConversationListReq {
  pageNum: number;
  pageSize: number;
  userId: string;
  conversationId: string;
}

export interface ConversationListRes {
  records: any[];
}
