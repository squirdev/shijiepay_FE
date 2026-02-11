/**
 * 支付方式管理 - 类型定义
 */

/**
 * 搜索参数
 */
export interface SearchParams {
  country?: string
  note?: string
  [key: string]: any
}

/**
 * 支付方式表单数据
 */
export interface TunnelForm {
  uuid?: string
  tunnel_name: string
  code: string
  country: string
  note?: string
}
