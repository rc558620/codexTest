export interface IRequestConfig {
  baseUrl: string;
  timeout: number;
  contentType: string;
  useInterceptors?: boolean;
}
const isDev = process.env.NODE_ENV === 'development';
export const RequestConfig: IRequestConfig = {
  baseUrl: isDev ? '/' : '/gw/ai-oa-assistant',
  timeout: 30 * 1000,
  contentType: 'application/json',
  useInterceptors: true,
};
