// BulkDashboard.tsx
import React, { Suspense, useEffect } from 'react';
import { useViewportQuery } from '@/hooks/useViewportQuery';
import styles from './index.module.less';

const Desktop = React.lazy(() => import('./components/desktop'));
const Mobile = React.lazy(() => import('./components/mobile'));

const BulkDashboard: React.FC = () => {
  const isMobile = useViewportQuery('(max-width: 1365px)');

  // ✅ Hook 顶层调用（不会被条件 return 截断）
  useEffect(() => {
    // 视口未判定时不做预加载
    if (isMobile === null) return;

    const preload = () => {
      if (isMobile) {
        import('./components/desktop');
      } else {
        import('./components/mobile');
      }
    };

    // 用 globalThis 做统一类型，避免 "never 上不存在 setTimeout"
    const ric = (globalThis as any).requestIdleCallback as ((cb: () => void) => number) | undefined;
    const cancelRic = (globalThis as any).cancelIdleCallback as ((id: number) => void) | undefined;

    let timeoutId: number | undefined;
    let idleId: number | undefined;

    if (typeof ric === 'function') {
      idleId = ric(preload);
    } else {
      timeoutId = setTimeout(preload, 300) as unknown as number;
    }

    return () => {
      if (typeof cancelRic === 'function' && typeof idleId === 'number') {
        cancelRic(idleId);
      }
      if (typeof timeoutId === 'number') {
        clearTimeout(timeoutId);
      }
    };
  }, [isMobile]);

  // 视口未判定前不渲染，避免先挂错分支
  if (isMobile === null) return null; // 可替换为骨架屏

  return (
    <div className={isMobile ? styles['bulk-page'] : ''}>
      <Suspense fallback={null}>{isMobile ? <Mobile /> : <Desktop />}</Suspense>
    </div>
  );
};

export default BulkDashboard;
