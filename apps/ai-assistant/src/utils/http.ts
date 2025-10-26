/**
 * 将对象序列化为 application/x-www-form-urlencoded
 * 仅支持一层键值（后端如需嵌套，请与后端确认格式）
 * @param payload 任意键值对象
 * @returns URLSearchParams
 */
export const toFormUrlEncoded = (payload: Record<string, string>) => {
  const params = new URLSearchParams();
  Object.entries(payload).forEach(([k, v]) => {
    // 统一转为字符串；后端表单接口通常只接受 string
    params.append(k, String(v));
  });
  return params;
};
