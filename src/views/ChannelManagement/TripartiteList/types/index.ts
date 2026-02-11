/**
 * 三方列表管理 - 类型定义
 */

/**
 * 选项类型
 */
export interface TripartOption {
  label: string
  value: string
  country?: string
  three_party_uuid?: string
}

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
 * 三方表单数据
 */
export interface TripartForm {
  uuid?: string
  name: string
  country: string
  module_code: string
  mch_id: string
  mch_secretkey: string
  mch_login_url: string
  mch_account: string
  mch_password: string
  callback_ip: string
  payout_statu: boolean
  payment_statu: boolean
  note?: string
  max_consecutive_failures?: number
  min_limit_balance_amount?: number
  max_limit_balance_amount?: number
  countryTunnelDatas?: string[]
}

/**
 * 配置项数据
 */
export interface ConfigItem {
  tunnel_uuid: string
  rate: string
  statu: string
  mapping_param: string
}
