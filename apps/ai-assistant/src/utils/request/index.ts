import axios, { AxiosInstance, AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios';
import message from 'antd/es/message';
import login from './login';
import { IRequestConfig, RequestConfig } from './config';

const statusWhiteList = [404, 503];

// 请求队列管理
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const getUserNameFromUrl = () => {
  try {
    const url = window.location.href;
    const urlParams = new URLSearchParams(new URL(url).search);
    return urlParams.get('userName') || '';
  } catch (e) {
    return '';
  }
};
const getToken = () => {
  const userNameWidthToken = sessionStorage.getItem('ai-assistant-token');
  if (userNameWidthToken) {
    const [, token] = userNameWidthToken.split('@@');
    return token;
  }
  return null;
};
class Request {
  instance: AxiosInstance;

  constructor(config: IRequestConfig) {
    // 创建 axios 实例
    this.instance = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout,
      headers: {
        'Content-Type': config.contentType,
      },
    });
    if (config.useInterceptors) this.interceptors();
  }

  interceptors() {
    // 处理 401 错误
    const retry401 = async (originalRequest: AxiosRequestConfig<any> & { _retry: boolean }) => {
      if (isRefreshing) {
        // 如果正在刷新 token，则将请求加入队列等待
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            // 重新发送请求
            return this.instance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;
      originalRequest._retry = true;

      try {
        // 调用登录方法重新获取认证信息
        const userName = getUserNameFromUrl();
        await login(userName);

        // 处理队列中的请求
        processQueue(null, 'new_token');
        isRefreshing = false;

        // 重新发送原始请求
        return this.instance(originalRequest);
      } catch (loginError) {
        // 登录失败，清空队列并拒绝所有请求
        processQueue(loginError, null);
        isRefreshing = false;
        return Promise.reject(loginError);
      }
    };
    // 添加请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        const uaserNameWidthToken = sessionStorage.getItem('ai-assistant-token');

        if (uaserNameWidthToken && config.headers) {
          const userName = getUserNameFromUrl();
          const [name, token] = uaserNameWidthToken.split('@@');
          if (name === userName) {
            config.headers.token = token;
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // 添加响应拦截器
    this.instance.interceptors.response.use(
      async (response: AxiosResponse) => {
        if (response.status === 200) {
          if (response.data.status === 'ok') return response.data;
          if (response.data.code === 200) return response.data.data;
          const config = response.config as AxiosRequestConfig & { _retry: boolean };
          config._retry = false;
          if (response.data.code === 401 && config && !config._retry) {
            return await retry401(config);
          }
        }
        message.error(response.data.message || '请求失败');
        return Promise.reject(response.data);
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry: boolean };
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          return await retry401(originalRequest);
        }
        // 处理其他错误
        if (
          originalRequest?.headers &&
          originalRequest.headers['Disabled-Msg'] !== '1' &&
          error.response?.status &&
          !statusWhiteList.includes(error.response.status)
        ) {
          message.error(error.message || '请求失败');
        }

        return Promise.reject(error);
      },
    );
  }
}

const request = new Request(RequestConfig).instance;
export { Request, getToken };
export default request;
