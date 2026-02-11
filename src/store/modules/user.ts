import { defineStore } from 'pinia'
import { store } from '../index'
import { UserLoginType, UserType } from '@/api/login/types'
import { ElMessageBox } from 'element-plus'
import { useI18n } from '@/hooks/web/useI18n'
import { loginOutApi, merLoginOutApi } from '@/api/login'
import { useTagsViewStore } from './tagsView'
import router from '@/router'
import { clearTokenRefresh, clearMerTokenRefresh } from '@/utils/setupTokenRefresh'
import { usePermissionStore } from './permission'

interface UserState {
  userInfo?: UserType
  adminInfo?: UserType
  tokenKey: string
  token: string
  mer_token: string
  merRouters?: string[] | AppCustomRouteRecordRaw[]
  adminRouters?: string[] | AppCustomRouteRecordRaw[]
  rememberMe: boolean
  loginInfo?: UserLoginType
  refreshToken: string
  mer_refreshToken: string
  merchantId: string
}

export const useUserStore = defineStore('user', {
  state: (): UserState => {
    return {
      userInfo: undefined,
      tokenKey: 'Authorization',
      token: '',
      adminRouters: undefined,
      merRouters: undefined,
      // 记住我
      rememberMe: true,
      loginInfo: undefined,
      adminInfo: undefined,
      refreshToken: '',
      merchantId: '',
      mer_refreshToken: '',
      mer_token: ''
    }
  },
  getters: {
    getTokenKey(): string {
      return this.tokenKey
    },
    getToken(): string {
      return this.token
    },
    getMerToken(): string {
      return this.mer_token
    },
    getRefreshToken(): string {
      return this.refreshToken
    },
    getMerRefreshToken(): string {
      return this.mer_refreshToken
    },
    getUserInfo(): UserType | undefined {
      return this.userInfo
    },
    getAdminInfo(): UserType | undefined {
      return this.adminInfo
    },
    getAdminRouters(): string[] | AppCustomRouteRecordRaw[] | undefined {
      return this.adminRouters
    },
    getMerRouters(): string[] | AppCustomRouteRecordRaw[] | undefined {
      return this.merRouters
    },
    getRememberMe(): boolean {
      return this.rememberMe
    },
    getLoginInfo(): UserLoginType | undefined {
      return this.loginInfo
    },
    getMerchantId(): string {
      return this.merchantId
    }
  },
  actions: {
    setTokenKey(tokenKey: string) {
      this.tokenKey = tokenKey
    },
    setMerchantId(id: string) {
      this.merchantId = id
    },
    setToken(token: string) {
      this.token = token
    },
    setMerToken(token: string) {
      this.mer_token = token
    },
    setRefreshToken(token: string) {
      this.refreshToken = token
    },
    setMerRefreshToken(token: string) {
      this.mer_refreshToken = token
    },
    setUserInfo(userInfo?: UserType) {
      this.userInfo = userInfo
    },
    setAdminInfo(userInfo?: UserType) {
      this.adminInfo = userInfo
    },
    setAdminRouters(roleRouters: string[] | AppCustomRouteRecordRaw[]) {
      this.adminRouters = roleRouters
    },
    setMerRouters(roleRouters: string[] | AppCustomRouteRecordRaw[]) {
      this.merRouters = roleRouters
    },
    logoutConfirm() {
      const { t } = useI18n()
      ElMessageBox.confirm(t('common.loginOutMessage'), t('common.reminder'), {
        confirmButtonText: t('common.ok'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      })
        .then(async () => {
          const res = await loginOutApi().catch(() => {})

          if (res?.success) {
            const logoutChannel = new BroadcastChannel('logout-channel')
            logoutChannel.postMessage('admin')
            logoutChannel.close()
          }
        })
        .catch(() => {})
        .finally(() => {
          this.reset()
        })
    },
    merLogoutConfirm() {
      const { t } = useI18n()
      ElMessageBox.confirm(t('common.loginOutMessage'), t('common.reminder'), {
        confirmButtonText: t('common.ok'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      })
        .then(async () => {
          const res = await merLoginOutApi().catch(() => {})
          if (res?.success) {
            const logoutChannel = new BroadcastChannel('logout-channel')
            logoutChannel.postMessage('merchant')
            logoutChannel.close()
          }
        })
        .catch(() => {})
        .finally(() => {
          this.merReset()
        })
    },
    reset() {
      const tagsViewStore = useTagsViewStore()
      const permissionStore = usePermissionStore()
      tagsViewStore.delAllViews()
      this.setAdminRouters([])
      this.setToken('')
      clearTokenRefresh()
      this.setRefreshToken('')
      this.setAdminInfo(undefined)
      permissionStore.clearRouteCache()
      sessionStorage.clear()
      router.replace('/login')
    },
    merReset() {
      const tagsViewStore = useTagsViewStore()
      const permissionStore = usePermissionStore()
      tagsViewStore.delAllViews()
      this.setMerRouters([])
      this.setUserInfo(undefined)
      this.setMerToken('')
      clearMerTokenRefresh()
      this.setMerRefreshToken('')
      permissionStore.clearRouteCache()
      sessionStorage.clear()
      if (!router.currentRoute.value.path.startsWith('/mchLogin/'))
        router.replace('/mchLogin' + this.merchantId)
    },
    logout() {
      this.reset()
    },
    merLogout() {
      this.merReset()
    },
    setRememberMe(rememberMe: boolean) {
      this.rememberMe = rememberMe
    },
    setLoginInfo(loginInfo: UserLoginType | undefined) {
      this.loginInfo = loginInfo
    }
  },
  persist: true
})

export const useUserStoreWithOut = () => {
  return useUserStore(store)
}
