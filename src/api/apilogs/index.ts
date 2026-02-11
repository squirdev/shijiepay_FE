import request from '@/axios'

export const getSystemAPILogs = (params: any) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/apiLog',
    params
  })
}

export const getChannelAPILogs = (params: any) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/channel/apiLog',
    params
  })
}
