import { useEffect, useState } from 'react';

/**
 * 把 visualViewport.height 写入 CSS 变量 --vvh，并暴露 keyboardOpen。
 * - 不做 transform，不改 DOM 结构
 * - 通过 .maid-root { height: var(--vvh) } 保证容器高度=真实可视高度（不含键盘）
 */
export function useViewportVH() {
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const vv = (window as any).visualViewport as VisualViewport | undefined;

    const apply = () => {
      const h = vv ? vv.height : window.innerHeight;
      // 写到根变量，任何容器都可以使用
      document.documentElement.style.setProperty('--vvh', `${Math.round(h)}px`);

      // 键盘是否打开：对比 innerHeight 与 vv.height（或 offsetTop）
      if (vv) {
        const keyboard = window.innerHeight - vv.height - vv.offsetTop;
        setKeyboardOpen(keyboard > 30); // 阈值避免误报
      } else {
        setKeyboardOpen(false);
      }
    };

    // 初始应用一次
    apply();

    if (vv) {
      vv.addEventListener('resize', apply);
      vv.addEventListener('scroll', apply); // iOS 键盘上移会触发 scroll
    } else {
      window.addEventListener('resize', apply);
    }

    return () => {
      if (vv) {
        vv.removeEventListener('resize', apply);
        vv.removeEventListener('scroll', apply);
      } else {
        window.removeEventListener('resize', apply);
      }
    };
  }, []);

  return { keyboardOpen };
}
