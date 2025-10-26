import { userCode } from '@/utils/Constant';
import { dataCenterRequest } from '@/utils/request';
import type { ApiResponse, AuthPayload, CokeInfo, AmnInfo, SlfacInfo } from './type';
import { toFormUrlEncoded } from '@/utils/http';

/**
 * 鉴权常量
 * @description 为方便维护集中管理；如需动态获取，可改为从配置/环境变量读取
 */
const AUTH_CODE = 'wIxyNE9O0btbGiRAWnjM2Q==' as const;

/**
 * 端点常量
 * @description 避免在多处硬编码 URL，统一修改更安全
 */
const BULK_RPT_ENDPOINTS = {
  /** 焦化（焦炭） */
  cola: '/ythAI/bulkRpt/cokeInfo/v1',
  /** 氨水/氨（NH₃） */
  nh3: '/ythAI/bulkRpt/amnInfo/v1',
  /** 硫酸（H₂SO₄） */
  h2so4: '/ythAI/bulkRpt/slfacInfo/v1',
} as const;

/**
 * 统一的 x-www-form-urlencoded POST 调用
 * @template T 返回数据类型
 * @param url 接口地址
 * @param payload 入参（会被序列化为表单）
 */
const postForm = async <T>(url: string, payload: AuthPayload): Promise<ApiResponse<T>> => {
  const body = toFormUrlEncoded({
    userCode: payload.userCode,
    authCode: payload.authCode,
  });

  const res = await dataCenterRequest.post<ApiResponse<T>, ApiResponse<T>>(url, body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return res;
};

/**
 * Tell me to... 获取焦化（焦炭）数据
 * @returns Promise<ApiResponse<CokeInfo>>
 */
export const getColaData = () => {
  return postForm<CokeInfo>(BULK_RPT_ENDPOINTS.cola, {
    userCode,
    authCode: AUTH_CODE,
  });
};

/**
 * 获取氨水/氨（NH₃）数据
 * @returns Promise<ApiResponse<AmnInfo>>
 */
export const getNh3Data = () => {
  return postForm<AmnInfo>(BULK_RPT_ENDPOINTS.nh3, {
    userCode,
    authCode: AUTH_CODE,
  });
};

/**
 * 获取硫酸（H₂SO₄）数据
 * @returns Promise<ApiResponse<SlfacInfo>>
 */
export const getH2so4Data = () => {
  return postForm<SlfacInfo>(BULK_RPT_ENDPOINTS.h2so4, {
    userCode,
    authCode: AUTH_CODE,
  });
};
