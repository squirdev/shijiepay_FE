import { defineStore } from 'pinia'
import { asyncRouterMap, constantRouterMap } from '@/router'
import {
  generateRoutesByFrontEnd,
  generateRoutesByServer,
  flatMultiLevelRoutes
} from '@/utils/routerHelper'
import { store } from '../index'
import { cloneDeep } from 'lodash-es'

// 添加路由缓存
const routeCache = new Map<string, AppRouteRecordRaw[]>()

// 常用路由预加载配置
const commonRoutes = ['/home', '/personal/personal-center']

// 根据角色预加载的路由配置
const rolePreloadRoutes = {
  admin: ['/channelmanagement', '/merchantmanagement'],
  merchant: ['/collectionorder', '/paymentorder']
}

export interface PermissionState {
  routers: AppRouteRecordRaw[]
  addRouters: AppRouteRecordRaw[]
  isAddRouters: boolean
  menuTabRouters: AppRouteRecordRaw[]
  preloadedRoutes: Set<string>
}

export const usePermissionStore = defineStore('permission', {
  state: (): PermissionState => ({
    routers: [],
    addRouters: [],
    isAddRouters: false,
    menuTabRouters: [],
    preloadedRoutes: new Set()
  }),
  getters: {
    getRouters(): AppRouteRecordRaw[] {
      return this.routers
    },
    getAddRouters(): AppRouteRecordRaw[] {
      return flatMultiLevelRoutes(cloneDeep(this.addRouters))
    },
    getIsAddRouters(): boolean {
      return this.isAddRouters
    },
    getMenuTabRouters(): AppRouteRecordRaw[] {
      return this.menuTabRouters
    }
  },
  actions: {
    // 智能预加载路由
    async preloadRoutes(role: 'admin' | 'merchant') {
      // 预加载常用路由
      for (const route of commonRoutes) {
        await this.preloadRoute(route)
      }

      // 预加载角色相关路由
      const roleRoutes = rolePreloadRoutes[role] || []
      for (const route of roleRoutes) {
        await this.preloadRoute(route)
      }
    },

    // 预加载单个路由
    async preloadRoute(routePath: string) {
      if (this.preloadedRoutes.has(routePath)) {
        return
      }

      try {
        const route = this.routers.find((r) => r.path === routePath)
        if (route?.component) {
          // 如果是异步组件，预加载它
          if (typeof route.component === 'function') {
            await route.component()
          }
          this.preloadedRoutes.add(routePath)
        }
      } catch (error) {
        console.error(`Failed to preload route: ${routePath}`, error)
      }
    },

    generateRoutes(
      type: 'server' | 'frontEnd' | 'static',
      routers?: AppCustomRouteRecordRaw[] | string[]
    ): Promise<unknown> {
      return new Promise<void>((resolve) => {
        // 生成缓存key
        const cacheKey = `${type}-${JSON.stringify(routers)}`

        // 检查缓存
        if (routeCache.has(cacheKey)) {
          const cachedRoutes = routeCache.get(cacheKey)
          if (cachedRoutes) {
            this.addRouters = cachedRoutes
            this.routers = cloneDeep(constantRouterMap).concat(cachedRoutes)
          }
          resolve()
          return
        }

        let routerMap: AppRouteRecordRaw[] = []
        if (type === 'server') {
          // 模拟后端过滤菜单
          routerMap = generateRoutesByServer(routers as AppCustomRouteRecordRaw[])
        } else if (type === 'frontEnd') {
          // 模拟前端过滤菜单
          routerMap = generateRoutesByFrontEnd(cloneDeep(asyncRouterMap), routers as string[])
        } else {
          // 直接读取静态路由表
          routerMap = cloneDeep(asyncRouterMap)
        }

        // 动态路由，404一定要放到最后面
        const finalRoutes = routerMap.concat([
          {
            path: '/:path(.*)*',
            redirect: '/404',
            name: '404Page',
            meta: {
              hidden: true,
              breadcrumb: false
            }
          }
        ])

        // 存入缓存
        routeCache.set(cacheKey, finalRoutes)

        // 更新路由
        this.addRouters = finalRoutes
        // 渲染菜单的所有路由
        this.routers = cloneDeep(constantRouterMap).concat(routerMap)
        resolve()
      })
    },
    setIsAddRouters(state: boolean): void {
      this.isAddRouters = state
    },
    setMenuTabRouters(routers: AppRouteRecordRaw[]): void {
      this.menuTabRouters = routers
    },
    // 添加清除缓存的方法
    clearRouteCache(): void {
      routeCache.clear()
      this.preloadedRoutes.clear()
    }
  },
  persist: {
    paths: ['routers', 'addRouters', 'menuTabRouters']
  }
})

export const usePermissionStoreWithOut = () => {
  return usePermissionStore(store)
}
