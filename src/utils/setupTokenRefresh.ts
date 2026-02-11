import { useUserStoreWithOut } from '@/store/modules/user'
import { refreshTokenApi, refreshMerTokenApi } from '@/api/login'
import router from '@/router'

let refreshInterval: NodeJS.Timeout
let refreshMerInterval: NodeJS.Timeout
export const setupTokenRefresh = () => {
  clearInterval(refreshInterval)
  const userStore = useUserStoreWithOut()
  refreshInterval = setInterval(
    async () => {
      try {
        const refresh_token = userStore.getRefreshToken
        if (!refresh_token) return
        const res = await refreshTokenApi(refresh_token)
        if (res?.access_token) {
          userStore.setToken(res.access_token)
          console.log('🔁 Token refreshed')
        } else {
          handleLogout()
        }
      } catch (err) {
        console.error('Token refresh failed:', err)
        handleLogout()
      }
    },
    2 * 60 * 1000
  ) // every 9 minutes
}

export const setupMerTokenRefresh = () => {
  clearInterval(refreshInterval)
  const userStore = useUserStoreWithOut()
  refreshMerInterval = setInterval(
    async () => {
      try {
        const refresh_token = userStore.getMerRefreshToken
        if (!refresh_token) return
        const res = await refreshMerTokenApi(refresh_token)
        if (res?.access_token) {
          userStore.setMerToken(res.access_token)
          console.log('🔁 Token refreshed')
        } else {
          handleMerLogout()
        }
      } catch (err) {
        console.error('Token refresh failed:', err)
        handleMerLogout()
      }
    },
    2 * 60 * 1000
  ) // every 9 minutes
}

const handleLogout = () => {
  const userStore = useUserStoreWithOut()
  userStore.logout()
}

const handleMerLogout = () => {
  const userStore = useUserStoreWithOut()
  userStore.merLogout()
}

export const clearTokenRefresh = () => {
  console.log('kill refresh')
  clearInterval(refreshInterval)
}

export const clearMerTokenRefresh = () => {
  console.log('kill mer_refresh')
  clearInterval(refreshMerInterval)
}
