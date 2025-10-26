export interface RemoteComponentConfigSchema {
  type: string;
}

/**
 * 导出组件API配置(预留)
 */
export interface RemoteComponentApiSchema {
  configs?: RemoteComponentConfigSchema[];
}
