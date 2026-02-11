import axios, { AxiosError } from 'axios'
import { defaultRequestInterceptors } from './config'
import { AxiosInstance, InternalAxiosRequestConfig, RequestConfig, AxiosResponse } from './types'
import { ElMessage, ElMessageBox } from 'element-plus'
import { REQUEST_TIMEOUT } from '@/constants'
import { useUserStoreWithOut } from '@/store/modules/user'
import { refreshTokenApi, refreshMerTokenApi } from '@/api/login'
import { showMessageBox } from '@/utils/singletonMessageBox'

export const PATH_URL = import.meta.env.VITE_API_BASE_PATH

// 定义队列项类型：这是一个函数，接收新 token 并处理重试
type RequestCallback = (token: string) => void

// 是否正在刷新中
let isRefreshToken = false
// 请求队列
let requestList: RequestCallback[] = []
// AbortController 映射
const abortControllerMap: Map<string, AbortController> = new Map()

const axiosInstance: AxiosInstance = axios.create({
  timeout: REQUEST_TIMEOUT,
  baseURL: PATH_URL
})

// --- 请求拦截器 ---
axiosInstance.interceptors.request.use((res: InternalAxiosRequestConfig) => {
  const controller = new AbortController()
  const url = res.url || ''
  res.signal = controller.signal

  // 记录 controller 用于取消请求
  abortControllerMap.set(
    import.meta.env.VITE_USE_MOCK === 'true' ? url.replace('/mock', '') : url,
    controller
  )
  return res
})

axiosInstance.interceptors.request.use(defaultRequestInterceptors)

// --- 响应拦截器 ---
axiosInstance.interceptors.response.use(
  async (response: AxiosResponse) => {
    const { data } = response
    const config = response.config

    // 移除请求完成后的 controller
    if (config.url) {
      const key =
        import.meta.env.VITE_USE_MOCK === 'true' ? config.url.replace('/mock', '') : config.url
      abortControllerMap.delete(key)
    }

    if (!data) {
      throw new Error('请求没有返回值')
    }

    // 二进制流直接返回
    if (response.request.responseType === 'blob') {
      return response
    }

    // 业务成功
    if (data.code === 0) {
      return data
    }

    // 操作成功 (新增/编辑等)
    if (data.code === 200) {
      return {
        success: true,
        ...data
      }
    }

    if (data.code === 409) {
      return data
    }

    // Token 过期处理
    else if (data.code === 401) {
      return process(config)
    }

    // 其他业务错误
    else if (data.code === 400) {
      // ⚠️ 注意：这里绝对不能重置 isRefreshToken = false
      return data
    } else {
      // ⚠️ 注意：这里绝对不能重置 isRefreshToken = false
      return response
    }
  },
  async (error: AxiosError) => {
    const config = error.config

    if (config?.url) {
      const key =
        import.meta.env.VITE_USE_MOCK === 'true' ? config.url.replace('/mock', '') : config.url
      abortControllerMap.delete(key)
    }

    if (!config) return Promise.reject(error)

    // Http 状态码 401 处理
    if (error?.response?.status === 401) {
      return process(config)
    }

    // 特殊状态码处理
    else if (error?.response?.status === 422) {
      const { msg, code } = error?.response?.data as { msg: string; code: number }
      if (code === 4221) {
        // return handleLogout(config)
        return process(config)
      }
      ElMessage.error(msg)
    }

    // 网络或其他错误
    else {
      const { code, message } = error
      if (window.navigator.onLine && code === 'ERR_NETWORK') {
        console.log(`ERR_NETWORK`, error)
      } else {
        ElMessage.error(message || '请求失败')
      }
    }

    // ⚠️ 关键修正：删除了这里的 isRefreshToken = false
    // 锁的释放必须只由 process 的 finally 控制
    return Promise.reject(error)
  }
)

const service = {
  request: axiosInstance,
  cancelRequest: (url: string | string[]) => {
    const urlList = Array.isArray(url) ? url : [url]
    for (const _url of urlList) {
      abortControllerMap.get(_url)?.abort()
      abortControllerMap.delete(_url)
    }
  },
  cancelAllRequest() {
    for (const [_, controller] of abortControllerMap) {
      controller.abort()
    }
    abortControllerMap.clear()
  }
}

/**
 * 统一登出处理
 */
function handleLogout(config: RequestConfig) {
  const userStore = useUserStoreWithOut()
  // 清空队列防止堆积
  requestList = []
  isRefreshToken = false

  const isMerchant = location.pathname.startsWith('/pay4Mch')

  if (isMerchant) {
    userStore.merLogout()
  } else {
    userStore.logout()
  }

  return Promise.reject(new Error('Token失效，已强制登出'))
}

/**
 * 核心：Token 刷新与重试逻辑
 */
async function process(config: InternalAxiosRequestConfig) {
  // 1. 如果是刷新接口本身报错 401，直接登出，避免死循环
  if (config.url?.includes('token/refresh')) {
    return handleLogout(config)
  }

  const userStore = useUserStoreWithOut()
  // 判断当前是商户端还是管理端
  const isMerchant = location.pathname.startsWith('/pay4Mch')

  showMessageBox({
    title: '提示',
    message: '会话过期请重新登录',
    confirmButtonText: '重新登录',
    showCancelButton: false,
    type: 'warning'
  })
    .then(() => {
      handleLogout(config)
    })
    .catch((error) => {
      console.log(error)
    })

  // ElMessageBox.confirm('会话过期请重新登录', '提示', {
  //   confirmButtonText: '重新登录',
  //   showCancelButton: false,
  //   closeOnClickModal: false,
  //   closeOnPressEscape: false,
  //   type: 'warning'
  // })
  //   .then(() => {
  //     handleLogout(config)
  //   })
  //   .catch((error) => {
  //     console.log(error)
  //   })
  return

  // 2. 检查是否已有正在进行的刷新任务
  if (!isRefreshToken) {
    isRefreshToken = true // 加锁

    // 获取对应的 Refresh Token
    const refreshToken = isMerchant ? userStore.getMerRefreshToken : userStore.getRefreshToken

    // 如果连 Refresh Token 都没有，直接登出
    if (!refreshToken) {
      // 这里需要手动重置状态，因为不会进入 finally
      isRefreshToken = false
      return handleLogout(config)
    }

    try {
      // 调用刷新 API
      const { data: res } = await (isMerchant
        ? refreshMerTokenApi(refreshToken)
        : refreshTokenApi(refreshToken))

      const newToken = res?.access_token || ''

      if (!newToken) {
        throw new Error('Refresh successful but no token received')
      }

      // 更新 Store 中的 Token
      if (isMerchant) {
        userStore.setMerToken(newToken)
      } else {
        userStore.setToken(newToken)
      }

      // 3. 唤醒队列：执行所有挂起的请求
      requestList.forEach((callback) => callback(newToken))
      // 清空队列
      requestList = []

      // 4. 重试当前触发 401 的请求
      config.headers.Authorization = `Bearer ${newToken}`
      return axiosInstance(config)
    } catch (error) {
      console.error('Token refresh failed:', error)
      // 刷新失败，通知队列中的请求失败（或直接登出）
      requestList.forEach((callback) => callback(''))
      requestList = []
      return handleLogout(config)
    } finally {
      // 5. ⚠️ 只有在这里，才能释放锁
      isRefreshToken = false
    }
  } else {
    // 6. 如果正在刷新，将请求放入队列，返回一个 Promise 等待唤醒
    return new Promise((resolve) => {
      requestList.push((newToken: string) => {
        // 如果 newToken 为空，说明刷新失败了
        if (newToken) {
          config.headers.Authorization = `Bearer ${newToken}`
          resolve(axiosInstance(config))
        } else {
          // 刷新失败，这里通常选择 reject 或者重定向
          resolve(handleLogout(config))
        }
      })
    })
  }
}

export default service
