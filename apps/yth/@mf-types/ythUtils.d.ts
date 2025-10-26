declare module 'ythUtils/request' {
  export interface YthResponseInterceptor {
    onFulfilled?: (response: any) => any;
    onRejected?: (error: any) => any;
  }

  class RemoteRequest {
    instance: any;
    responseInterceptor(): YthResponseInterceptor | null;
  }

  export default RemoteRequest;
}

declare module 'ythUtils/common' {
  export function getToken(): string | null;
  export function setToken(token: string): void;
  export function clearToken(): void;
  export function setUser(user: any): void;
}

declare module 'ythUtils/localization' {
  export interface LocalizationType {
    setLocale: (locale: string) => void;
    language: string;
  }

  export interface LanguageOption {
    label: string;
    value: string;
    key: string;
  }

  export default class YTHLocalization {
    static getLanguageOptions(): LanguageOption[];
    static useLocal(): LocalizationType;
    static withLocal(component: any, props: any, language: string): any;
    static getLanguage(): string;
  }
}