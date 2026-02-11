import request from '@/axios'

export const getPayoutConfigApi = () => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/payoutConfig'
  })
}

export const updatePayoutConfigApi = (data) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/payoutConfig',
    data
  })
}

export const getPayOrderApi = (params: any) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/payout',
    params
  })
}

export const getPayCallbackApi = (params: any) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/payout/callbackLog',
    params
  })
}

export const exportPayOrderApi = (params) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/payout',
    data: {
      action: 'export_order'
    },
    params
  })
}

export const getPayConfigStatisticsApi = (params) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/payout',
    data: {
      action: 'getTotalData'
    },
    params
  })
}

export const fetchPayoutApi = (data) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/payout',
    data
  })
}

export const batchDistributiontApi = (data) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/batchDistribution',
    data
  })
}

export const getBatchDistributiontStatisticsApi = (params) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/batchDistribution',
    data: {
      action: 'getTotalData'
    },
    params
  })
}

export const exportBatchDistributiontApi = (params) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/batchDistribution',
    data: {
      action: 'exportData'
    },
    params
  })
}

export const fetchBatchDistributiontApi = (params) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/batchDistribution',
    params
  })
}

export const fetchTunnelTypeApi = (params) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/batchDistribution',
    params
  })
}
