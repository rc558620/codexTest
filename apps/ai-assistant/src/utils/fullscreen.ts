// utils/fullscreen.ts
import React from 'react';

type FSChangeHandler = (isFullscreen: boolean) => void;

const getFullscreenElement = (): Element | null => {
  const doc: any = document;
  return (
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullScreenElement ||
    doc.msFullscreenElement ||
    null
  );
};

export const isFullscreen = (): boolean => !!getFullscreenElement();

const requestFs = async (el: HTMLElement) => {
  const anyEl: any = el;
  // 带上 navigationUI 可隐藏浏览器 UI（部分浏览器支持）
  if (el.requestFullscreen) return el.requestFullscreen({ navigationUI: 'hide' as any });
  if (anyEl.webkitRequestFullscreen) return anyEl.webkitRequestFullscreen();
  if (anyEl.mozRequestFullScreen) return anyEl.mozRequestFullScreen();
  if (anyEl.msRequestFullscreen) return anyEl.msRequestFullscreen();
};

const exitFs = async () => {
  const doc: any = document;
  if (doc.exitFullscreen) return doc.exitFullscreen();
  if (doc.webkitExitFullscreen) return doc.webkitExitFullscreen();
  if (doc.mozCancelFullScreen) return doc.mozCancelFullScreen();
  if (doc.msExitFullscreen) return doc.msExitFullscreen();
};

export const useFullscreen = (
  elementRef: React.RefObject<HTMLElement>,
  opts?: { onChange?: FSChangeHandler; classWhenFs?: string },
) => {
  const { onChange, classWhenFs = 'is-fullscreen' } = opts || {};
  const [fullscreen, setFullscreen] = React.useState(isFullscreen());

  React.useEffect(() => {
    const handler = () => {
      const fs = isFullscreen();
      setFullscreen(fs);

      // 给目标元素加/去类名，便于写定向样式
      const el = elementRef.current;
      if (el) {
        if (fs) el.classList.add(classWhenFs);
        else el.classList.remove(classWhenFs);
      }

      // 通知外部（比如让 ECharts resize）
      onChange?.(fs);

      // 触发一次窗口 resize，兼容各类图表库
      // Safari/Chrome 有时需要多触发一次
      requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
      setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
    };

    // 监听全屏变更（含各前缀）
    document.addEventListener('fullscreenchange', handler);
    document.addEventListener('webkitfullscreenchange', handler as any);
    document.addEventListener('mozfullscreenchange', handler as any);
    document.addEventListener('MSFullscreenChange', handler as any);

    return () => {
      document.removeEventListener('fullscreenchange', handler);
      document.removeEventListener('webkitfullscreenchange', handler as any);
      document.removeEventListener('mozfullscreenchange', handler as any);
      document.removeEventListener('MSFullscreenChange', handler as any);
    };
  }, [elementRef, onChange, classWhenFs]);

  const enterFullscreen = React.useCallback(async () => {
    if (elementRef.current) await requestFs(elementRef.current);
  }, [elementRef]);

  const exitFullscreen = React.useCallback(async () => {
    await exitFs();
  }, []);

  const toggleFullscreen = React.useCallback(async () => {
    if (isFullscreen()) await exitFs();
    else if (elementRef.current) await requestFs(elementRef.current);
  }, [elementRef]);

  return { isFullscreen: fullscreen, enterFullscreen, exitFullscreen, toggleFullscreen };
};
