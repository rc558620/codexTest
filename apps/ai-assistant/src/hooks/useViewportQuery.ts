// src/hooks/useViewportQuery.ts
import { useEffect, useState } from 'react';

export function useViewportQuery(query: string): boolean | null {
  const [matches, setMatches] = useState<boolean | null>(null); // null = 未就绪（SSR/首帧）

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') return;

    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);

    update(); // 首次同步
    // 兼容 Safari 旧版
    if (mql.addEventListener) mql.addEventListener('change', update);
    else mql.addListener(update);

    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', update);
      else mql.removeListener(update);
    };
  }, [query]);

  return matches;
}
