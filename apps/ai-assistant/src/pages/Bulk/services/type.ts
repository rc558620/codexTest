/* eslint-disable @typescript-eslint/consistent-type-definitions */

/**
 * 统一的 API 返回体
 * @template T 业务数据类型
 * @property code 状态码；0 表示成功。不可空。示例：0
 * @property msg 文本信息；成功为空或"OK"；失败为错误提示。可空。示例："OK"
 * @property data 业务数据载荷；成功时存在。可空（失败时可能为空）。
 */
export type ApiResponse<T> = {
  code: number;
  msg?: string | null;
  data?: T | null;
};

/**
 * 公共入参：鉴权与用户信息
 * @property userCode 用户代码/账号。不可空。示例："u123456"
 * @property authCode 鉴权码/签名。不可空。示例："wIxyNE9O0btbGiRAWnjM2Q=="
 */
export type AuthPayload = {
  userCode: string;
  authCode: string;
};

/**
 * 焦化（焦炭）信息返回结构占位类型
 * ⚠️ 如果有确切字段，请在此处完善并添加 JSDoc
 */
export type CokeInfo = {
  /** 示例字段：产量（吨/天），不可空。示例：1200 */
  // outputTpd: number;

  /** 预留扩展；当后端未定时，先用 unknown 占位 */
  [k: string]: unknown;
};

/**
 * 氨水/氨（NH₃）信息返回结构占位类型
 */
export type AmnInfo = {
  /** 预留扩展 */
  [k: string]: unknown;
};

/**
 * 硫酸（H₂SO₄）信息返回结构占位类型
 */
export type SlfacInfo = {
  /** 预留扩展 */
  [k: string]: unknown;
};
