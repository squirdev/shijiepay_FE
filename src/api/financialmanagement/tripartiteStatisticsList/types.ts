export interface TripartiteStatisticsItem {
  tripartite_name: string
  collection_order_data: number
  successful_collection_orders: number
  payment_orders: number
  successful_payment_orders: number
  success_rate: string
}

export interface TripartiteStatisticsResponse {
  list: TripartiteStatisticsItem[]
  total: number
}
