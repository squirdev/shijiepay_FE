import { service } from '@/axios'
import type { MerchantDataStatisticsResponse } from './types'

export const merchantDataStatisticsApi = (
  params: any
): Promise<IResponse<MerchantDataStatisticsResponse>> => {
  // This is a mock implementation.
  // In a real application, you would make an API call to the backend.
  console.log('API called with params:', params)
  const mockData: MerchantDataStatisticsResponse = {
    list: [
      {
        merchant_id: 'M001',
        merchant_name: '测试商户一',
        collection_order_data: 100,
        successful_collection_orders: 95,
        payment_orders: 50,
        successful_payment_orders: 48,
        success_rate: '96.00%'
      },
      {
        merchant_id: 'M002',
        merchant_name: '测试商户二',
        collection_order_data: 200,
        successful_collection_orders: 190,
        payment_orders: 100,
        successful_payment_orders: 98,
        success_rate: '98.00%'
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
  // In a real scenario, you would use the service to make a request, e.g.:
  // return service.get({ url: '/merchant-data-statistics', params })
}
