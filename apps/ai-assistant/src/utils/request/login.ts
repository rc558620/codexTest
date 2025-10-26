import axios from 'axios';
import { RequestConfig } from './config';

// 创建 axios 实例
const request = axios.create({
  baseURL: RequestConfig.baseUrl,
  timeout: RequestConfig.timeout,
});

const login = async (userName: string) => {
  try {
    const response = await request.post('/api/auth/login', {
      userName,
    });

    const { token } = response.data.data;
    sessionStorage.setItem('ai-assistant-token', `${userName}@@${token}`);
    return response.data;
  } catch (error) {
    throw new Error('登录失败');
  }
};

export default login;
