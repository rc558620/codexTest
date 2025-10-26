/** 数据集字段行 */
export interface DatasetFieldRow {
  /** 字段中文名；示例："公司(维度)" */
  name: string;
  /** 字段编码；示例："company" */
  code: string;
  /** 数据类型；示例："文本" | "数值" | "时间" */
  dataType: string;
  /** 字段描述 */
  desc: string;
}

/** 数据集预览数据 */
export interface DatasetPreview {
  /** 数据集名称；示例："云天化财务主表" */
  datasetName: string;
  /** 推荐问题 chips */
  recommendedQueries: string[];
  /** 字段表格 */
  fields: DatasetFieldRow[];
}
