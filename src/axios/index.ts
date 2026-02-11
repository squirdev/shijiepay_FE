import service from './service'
import { CONTENT_TYPE } from '@/constants'
import { useUserStoreWithOut } from '@/store/modules/user'
import { ApiResponse } from './types'

const request = (option: AxiosConfig) => {
  const { url, method, params, data, headers, ...otherOption } = option

  const userStore = useUserStoreWithOut()

  // Determine which token to send based on the URL
  let token: string | null = null

  if (url?.includes('/SJP4-padmin/token/refresh')) {
    token = userStore.getRefreshToken
  } else if (url?.includes('/SJP4-padmin/')) {
    token = userStore.getToken
  } else if (url?.includes('/pay4Mch/token/refresh')) {
    token = userStore.getMerRefreshToken
  } else if (url?.includes('/pay4Mch/')) {
    token = userStore.getMerToken
  }

  // Default headers
  const finalHeaders = {
    'Content-Type': CONTENT_TYPE,
    ...headers
  }

  // Add token to headers if needed
  if (token) {
    finalHeaders[userStore.getTokenKey ?? 'Authorization'] = `Bearer ${token}`
  }

  return service.request({
    ...otherOption,
    url: url,
    method,
    params,
    data: data,
    headers: finalHeaders
  })
}

export default {
  get: <T = any>(option: AxiosConfig) => {
    return request({ method: 'get', ...option }) as unknown as Promise<ApiResponse<T>>
  },
  post: <T = any>(option: AxiosConfig) => {
    return request({ method: 'post', ...option }) as unknown as Promise<ApiResponse<T>>
  },
  delete: <T = any>(option: AxiosConfig) => {
    return request({ method: 'delete', ...option }) as unknown as Promise<ApiResponse<T>>
  },
  put: <T = any>(option: AxiosConfig) => {
    return request({ method: 'put', ...option }) as unknown as Promise<ApiResponse<T>>
  },
  cancelRequest: (url: string | string[]) => {
    return service.cancelRequest(url)
  },
  cancelAllRequest: () => {
    return service.cancelAllRequest()
  }
}
