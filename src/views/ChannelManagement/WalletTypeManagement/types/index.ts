/**
 * 钱包类型管理 - 类型定义
 */

/**
 * 搜索参数
 */
export interface SearchParams {
  name?: string
  country?: string
  note?: string
  [key: string]: any
}

/**
 * 钱包类型表单数据
 */
export interface WalletTypeForm {
  uuid?: string
  name: string
  country: string
  code: string
  note?: string
}
