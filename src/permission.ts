import router from './router'
import { useAppStoreWithOut } from '@/store/modules/app'
import type { RouteRecordRaw } from 'vue-router'
import { useTitle } from '@/hooks/web/useTitle'
import { useNProgress } from '@/hooks/web/useNProgress'
import { usePermissionStoreWithOut } from '@/store/modules/permission'
import { usePageLoading } from '@/hooks/web/usePageLoading'
import { NO_REDIRECT_WHITE_LIST } from '@/constants'
import { useUserStoreWithOut } from '@/store/modules/user'
import { getBasePath } from '@/router'

const { start, done } = useNProgress()

const { loadStart, loadDone } = usePageLoading()

router.beforeEach(async (to, from, next) => {
  if (to.redirectedFrom?.fullPath?.includes('/doc/')) {
    window.open('https://doc.shijiepay.cc/home', '_blank')

    return false
  }

  start()
  loadStart()

  const permissionStore = usePermissionStoreWithOut()
  const appStore = useAppStoreWithOut()
  const userStore = useUserStoreWithOut()

  const isAdminLoggedIn = !!userStore.getAdminInfo
  const isMerchantLoggedIn = !!userStore.getUserInfo
  const currentMerchantId = userStore.getMerchantId
  // console.log('1', isAdminLoggedIn, userStore.getAdminInfo)
  // console.log('2', isMerchantLoggedIn, userStore.getUserInfo)

  if (to.meta.ignoreAuth) {
    next()
    return
  }

  const path = window.location.pathname

  // Logged in
  if (
    (path.startsWith('/pay4Mgr/') ||
      path.startsWith('/pay4Mgr') ||
      path.startsWith('/pay4Mch/') ||
      path.startsWith('/pay4Mch')) &&
    (isAdminLoggedIn || isMerchantLoggedIn)
  ) {
    if (to.path === '/login') {
      // console.log('admin', isAdminLoggedIn)
      if (isAdminLoggedIn) {
        next({ path: '/' })
      } else {
        next()
      }
      return
    }

    // Merchant login with uuid
    if (
      (path.startsWith('/pay4Mch/') || path.startsWith('/pay4Mch')) &&
      to.path.startsWith('/mchLogin/')
    ) {
      if (isMerchantLoggedIn) {
        next({ path: '/' })
      } else {
        next()
      }
      return
      // else continue to login page
    }

    if (permissionStore.getIsAddRouters) {
      next()
      return
    }
    // Load dynamic routes
    const roleRouters = [...(userStore.getAdminRouters || []), ...(userStore.getMerRouters || [])]

    if (appStore.getDynamicRouter) {
      if (appStore.serverDynamicRouter) {
        await permissionStore.generateRoutes('server', roleRouters as AppCustomRouteRecordRaw[])
      } else {
        await permissionStore.generateRoutes('frontEnd', roleRouters as string[])
      }
    } else {
      await permissionStore.generateRoutes('static')
    }
    // console.log(roleRouters)
    permissionStore.getAddRouters.forEach((route) => {
      router.addRoute(route as unknown as RouteRecordRaw)
    })

    const redirectPath = (from.query.redirect || to.path) as string
    const redirect = decodeURIComponent(redirectPath)
    const nextData = to.path === redirect ? { ...to, replace: true } : { path: redirect }
    permissionStore.setIsAddRouters(true)
    next(nextData)
  } else {
    // Not logged in
    if (NO_REDIRECT_WHITE_LIST.includes(to.path)) {
      next()
      return
    }
    if (path.startsWith('/pay4Mch/') || path.startsWith('/pay4Mch')) {
      next(`/mchLogin?redirect=${to.fullPath}`)
      return
    }
    if (path.startsWith('/pay4Mgr/') || path.startsWith('/pay4Mgr')) {
      next(`/login?redirect=${to.fullPath}`)
      return
    }
    next()
  }
})

router.afterEach((to) => {
  useTitle(to?.meta?.title as string)
  done() // 结束Progress
  loadDone()
})
