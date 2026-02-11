import type { TripartiteStatisticsResponse } from './types'

export const tripartiteStatisticsListApi = (
  params: any
): Promise<IResponse<TripartiteStatisticsResponse>> => {
  // This is a mock implementation.
  console.log('API called with params:', params)
  const mockData: TripartiteStatisticsResponse = {
    list: [
      {
        tripartite_name: '三方平台A',
        collection_order_data: 150,
        successful_collection_orders: 145,
        payment_orders: 70,
        successful_payment_orders: 68,
        success_rate: '96.67%'
      },
      {
        tripartite_name: '三方平台B',
        collection_order_data: 250,
        successful_collection_orders: 240,
        payment_orders: 120,
        successful_payment_orders: 118,
        success_rate: '97.50%'
      }
    ],
    total: 2
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        message: 'success',
        data: mockData
      } as any) // Casting to any to bypass IResponse type check for mock
    }, 500)
  })
}
