/**
 * 代付银行管理 - 类型定义
 */

/**
 * 选项类型
 */
export interface BankOption {
  label: string
  value: string
  country?: string
  rate?: number
}

/**
 * 搜索参数
 */
export interface SearchParams {
  merchant_name?: string
  merchant_id?: string
  country?: string
  wallet_type_uuid?: string
  statu?: boolean
  [key: string]: any
}

/**
 * 保存参数
 */
export interface SaveValue {
  action: string
  data_uuid?: string
  data_uuids?: string[]
  single_fee_amount?: number
  rate?: number
}

/**
 * 费率表单
 */
export interface RateForm {
  rate: number
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

/**
 * 区间费用表单数据
 */
export interface RangeFormData {
  interval_datas?: IntervalData[]
  [key: string]: any
}

/**
 * FeeRangeForm 组件的 Row 类型
 */
export interface FeeRangeRow {
  uuid: string
  interval_datas: IntervalData[]
  [key: string]: any
}
