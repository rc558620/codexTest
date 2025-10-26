import { request } from '@/utils/request';

const pcHeaders = {
  'content-type': 'application/json',
  Authorization: 'Basic d2ViOndlYg==',
  tenantId: 1,
  source: 'mf-module-dev',
};

const mobileHeaders = {
  'content-type': 'application/json',
  Authorization: 'Basic YXBwOmFwcA==',
  tenantId: 1,
  source: 'mf-module-dev',
};

export const userApi = {
  pcLogin: (data: LoginReq): any => {
    return request.post('/sys/auth/login', data, {
      headers: pcHeaders,
    });
  },
  mobileLogin: (data: LoginReq): any => {
    return request.post('/sys/auth/login', data, {
      headers: mobileHeaders,
    });
  },
  currentUser: (): any => request.get('sys/user/currentUser'),
};

export interface LoginReq {
  autoLogin: boolean;
  grantType: string;
  scope: string;
  type: string;
  password: string;
  username: string;
}
