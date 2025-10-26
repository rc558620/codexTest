import RemoteRequest, { YthResponseInterceptor } from 'ythUtils/request';

import axios from 'axios';

import message from 'antd/es/message';

import { DataCenterConfig } from './Constant';
import { generateAuthorization } from '@/utils/encrypt';

const statusWhiteList = [404, 503];

class Request extends RemoteRequest {
  responseInterceptor() {
    const options = super.responseInterceptor();
    return {
      ...options,
      onFulfilled: (res) => {
        if (res.status === 200) {
          if (res.data.status === 'ok') return res.data;
          if (res.data.code === 200) return res.data.data;
        }
        return Promise.reject(res.data);
      },
      onRejected: async (err) => {
        try {
          return await super.responseInterceptor()!.onRejected!(err);
        } catch (e) {
          if (
            err.config?.headers?.['Disabled-Msg'] !== '1' &&
            !statusWhiteList.includes(err.response.status)
          ) {
            message.error(err.message);
          }
          if (err.response.status === 401) {
            // window.location.href = '/login';
          }
          return Promise.reject(err);
        }
      },
    } satisfies YthResponseInterceptor;
  }
}

const request = new Request().instance;

// 中台请求方式开始
const dataCenterRequest = axios.create({
  baseURL: DataCenterConfig.apiPrefix,
  timeout: 1000 * 20,
});

dataCenterRequest.interceptors.request.use((config) => {
  // 创建一个新的配置对象，避免直接修改参数
  const newConfig = { ...config };

  // 添加类型检查确保 config.url 存在
  if (newConfig.url) {
    // 使用 set 方法设置 headers，避免类型错误
    newConfig.headers.set(
      'X-Bce-Signature',
      generateAuthorization(newConfig.url, {
        params: newConfig.params,
        data: newConfig.data,
        method: newConfig.method,
      }),
    );
  }
  return newConfig;
});
// 中台请求方式结束

export { request, dataCenterRequest };
