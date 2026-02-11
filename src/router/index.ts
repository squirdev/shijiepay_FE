import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import type { App } from 'vue'
import { Layout, getParentLayout } from '@/utils/routerHelper'
import { useI18n } from '@/hooks/web/useI18n'
import { NO_RESET_WHITE_LIST } from '@/constants'

const { t } = useI18n()

export const constantRouterMap: AppRouteRecordRaw[] = [
  {
    path: '/demo', // 你的路由路径
    // @ts-ignore
    component: () => import('@/views/Demo/demo.tsx'),
    name: 'Demo',
    meta: {
      hidden: true,
      title: 'demo',
      noTagsView: true,
      ignoreAuth: true // 添加这个属性来标记该路由不需要校验 token
    }
  },
  {
    path: '/redirect',
    component: Layout,
    name: 'Redirect',
    children: [
      {
        path: '/redirect/:path(.*)',
        name: 'ChildrenRedirect',
        component: () => import('@/views/Redirect/Redirect.vue'),
        meta: {}
      }
    ],
    meta: {
      hidden: true,
      noTagsView: true
    }
  },
  {
    path: '/login',
    component: () => import('@/views/Login/Login.vue'),
    name: 'Login',
    meta: {
      hidden: true,
      title: t('router.login'),
      noTagsView: true
    }
  },
  {
    path: '/mchLogin',
    component: () => import('@/views/Merchant/Login/Login.vue'),
    name: 'MerchantLogin',
    meta: {
      hidden: true,
      title: t('router.merchantLogin'),
      noTagsView: true
    }
  },
  {
    path: '/personal',
    component: Layout,
    redirect: '/personal/personal-center',
    name: 'pay4MgrPersonal',
    meta: {
      title: t('router.personal'),
      hidden: true,
      canTo: true
    },
    children: [
      {
        path: 'personal-center',
        component: () => import('@/views/Personal/PersonalCenter/PersonalCenter.vue'),
        name: 'pay4MgrPersonalCenter',
        meta: {
          title: t('router.personalCenter'),
          hidden: true,
          canTo: true
        }
      }
    ]
  },
  {
    path: '/404',
    component: () => import('@/views/Error/404.vue'),
    name: 'NoFind',
    meta: {
      hidden: true,
      title: '404',
      noTagsView: true
    }
  }
]

export const asyncRouterMap: AppRouteRecordRaw[] = []

export function getBasePath() {
  // 通过 URL 路径判断当前部署环境
  const path = window.location.pathname
  if (path.startsWith('/pay4Mgr/') || path.startsWith('/pay4Mgr')) {
    return '/pay4Mgr/' // 注意结尾斜杠
  } else if (path.startsWith('/pay4Mch/') || path.startsWith('/pay4Mch')) {
    return '/pay4Mch/'
  }
  return '/' // 开发环境或根路径
}

let router: ReturnType<typeof createRouter>

if (!import.meta.hot || !window.__VUE_HMR_ROUTER__) {
  router = createRouter({
    history: createWebHistory(getBasePath()),
    strict: false,
    routes: constantRouterMap as RouteRecordRaw[],
    scrollBehavior: () => ({ left: 0, top: 0 })
  })

  if (import.meta.hot) {
    window.__VUE_HMR_ROUTER__ = router
  }
} else {
  router = window.__VUE_HMR_ROUTER__
}

export const resetRouter = (): void => {
  router.getRoutes().forEach((route) => {
    const { name } = route
    if (name && !NO_RESET_WHITE_LIST.includes(name as string)) {
      router.hasRoute(name) && router.removeRoute(name)
    }
  })
}

export const setupRouter = (app: App<Element>) => {
  app.use(router)
}

export default router
