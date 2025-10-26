export const LANGUAGE_STORE_KEY = '$_language';
export const userCode = 'YTH_AI';
export const Language = () => {
  return window.localStorage.getItem(LANGUAGE_STORE_KEY) || 'zh-CN';
};

// 数据中台参数
export const DataCenterConfig = {
  authVersion: '1',
  expirationInSeconds: '1800',
  signedHeaders: 'host;x-bce-date',
  accessKey: '65e9bffe164f4b9b831da45524b664ad',
  secretKey: 'ed4b0a37520f453e920bb98501f3eaf4',
  apiPrefix: '/gw/ai-center',
  remoteHost: 'http://gwgp-wcjmjlpkro4.i.apiverse.ythit.cn',
};

export const CurrentUser = () => {
  return JSON.parse(window.sessionStorage.getItem('$_user') || '{}');
};

export const UserRelations = () => JSON.parse(window.sessionStorage.getItem('$_relations') || '[]');

export const Token = () => {
  return window.sessionStorage.getItem('$_token') || undefined;
};

export const Setting = () => {
  return JSON.parse(window.sessionStorage.getItem('yth_form_config_setting') || '{}');
};

export function isEmpty(obj: any) {
  if (Array.isArray(obj)) {
    return obj.length < 1;
  }
  return typeof obj === 'undefined' || obj === null || obj === '' || obj === 'undefined';
}
