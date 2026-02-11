export interface MerchantDataStatisticsItem {
  merchant_id: string
  merchant_name: string
  collection_order_data: number
  successful_collection_orders: number
  payment_orders: number
  successful_payment_orders: number
  success_rate: string
}

export interface MerchantDataStatisticsResponse {
  list: MerchantDataStatisticsItem[]
  total: number
}
