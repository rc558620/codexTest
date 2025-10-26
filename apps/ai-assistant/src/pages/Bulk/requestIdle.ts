export const idle = (cb: () => void) =>
  (window as any).requestIdleCallback
    ? (window as any).requestIdleCallback(cb)
    : setTimeout(cb, 250);
