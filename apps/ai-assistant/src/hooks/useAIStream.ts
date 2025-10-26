import { useState, useEffect, useRef } from 'react';

interface UseAIStreamOptions {
  onMessage?: (data: string) => void;
  onComplete?: () => void;
  onError?: (error: any) => void;
}

const _toString = Object.prototype.toString;
const isAsyncFunction = (fn: any) => {
  return _toString.call(fn) === '[object AsyncFunction]';
};
/**
 * AI流式数据处理Hook
 * @param url - 请求地址
 * @param options - 配置选项
 * @returns
 */
const useAIStream = (url: string, options?: UseAIStreamOptions) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [isThink, setIsThink] = useState<boolean>(false);

  // const [data, setData] = useState<string>('');
  const [error, setError] = useState<any>(null);

  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * 发送请求并处理流式响应
   * @param body - 请求体
   * @param headers - 请求头
   */
  const sendRequest = async (body?: any, headers?: Record<string, string>) => {
    if (loading) return;

    setLoading(true);
    setIsThink(true);
    // setData('');
    setError(null);

    try {
      // 创建中断控制器
      abortControllerRef.current = new AbortController();

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(body),
        redirect: 'follow',
        signal: abortControllerRef.current.signal,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported');
      }

      // 获取流读取器
      readerRef.current = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      setIsThink(false);

      // 逐块读取数据
      while (true) {
        const { done, value } = await readerRef.current.read();

        if (done) {
          break;
        }

        // 解码并处理数据
        const chunk = decoder.decode(value, { stream: true });
        // setData((prev) => prev + chunk);
        const isDone = options?.onMessage?.(chunk);
        if (isAsyncFunction(isDone)) {
          const res = await isDone;
          if (res) break;
        }
        if (isDone) break;
      }
      setLoading(false);
      options?.onComplete?.();
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err);
        options?.onError?.(err);
      }
    } finally {
      setLoading(false);
      setIsThink(false);

      if (readerRef.current) {
        readerRef.current.releaseLock();
        readerRef.current = null;
      }
    }
  };

  /**
   * 中断请求
   */
  const abort = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (readerRef.current) {
      readerRef.current.cancel();
      readerRef.current.releaseLock();
      readerRef.current = null;
    }
    setLoading(false);
  };

  // 组件卸载时清理资源
  useEffect(() => {
    return () => {
      abort();
    };
  }, []);

  return {
    loading,
    isThink,
    error,
    sendRequest,
    abort,
  };
};

export default useAIStream;
