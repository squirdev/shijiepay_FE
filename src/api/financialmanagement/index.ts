import request from '@/axios'

export const merchantFormApi = (data: any) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/merchantForm',
    data
  })
}

export const getChannelFormApi = (params: any) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/channelForm',
    params
  })
}

export const threePartyDataApi = (data: any) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/threePartyDataTotal',
    data
  })
}

export const merchantDataStatisticsApi = (data: any) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/MerchantDataTotal',
    data
  })
}

export const threepartyFormApi = (data: any) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/threepartyForm',
    data
  })
}
