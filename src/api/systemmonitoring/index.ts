import request from '@/axios'

export const getOrderMonitorApi = (params: any) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/orderMonitor',
    params
  })
}

export const getPayoutOrderCheckApi = (params: any) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/payoutOrderCheck',
    params
  })
}
