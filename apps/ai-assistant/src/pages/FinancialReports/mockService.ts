import { QueryPayload } from './types';

export const submitQuery = async (payload: QueryPayload) => {
  // mock: 200ms 延迟
  await new Promise((r) => setTimeout(r, 200));
  return {
    ok: true,
    echo: payload,
    answer: '（Mock）已收到问题，将基于所选数据集进行智能查询与分析……',
  };
};
