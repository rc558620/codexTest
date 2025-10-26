import { YTHToken, YTHCommon } from '@yth/utils';
export declare const getToken: typeof YTHToken.getToken, setUser: (user: unknown) => void, getUser: typeof YTHToken.getUser, setToken: (token: string) => void, setPost: (list: YTHToken.Relations[]) => void, setRefreshToken: (token: string) => void, getPost: () => YTHToken.Relations[], getRefreshToken: () => string | null, currentReload: typeof YTHToken.currentReload, clearToken: typeof YTHToken.clearToken;
export declare const isMobile: () => boolean, isIOS: () => boolean, isAndroid: () => boolean, tryParseJson: (str: any, defaultValue?: {} | undefined) => any, debounce: <TArgs extends any[]>({ delay }: {
    delay: number;
}, func: (...args: TArgs) => any) => YTHCommon.DebounceFunction<TArgs>;
