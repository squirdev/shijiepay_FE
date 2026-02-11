/**
 * 钱包管理 - 类型定义
 */

/**
 * 选项类型
 */
export interface WalletOption {
  label: string
  value: string
  country?: string
}

/**
 * 搜索参数
 */
export interface SearchParams {
  wallet_type_uuid?: string
  country?: string
  [key: string]: any
}

/**
 * 区间费用数据
 */
export interface IntervalData {
  id?: string
  start_amount: number
  end_amount: number
  amount: number
}
