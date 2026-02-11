import 'vue/jsx'

// 引入windi css
import '@/plugins/unocss'

// 导入全局的svg图标
import '@/plugins/svgIcon'

// 初始化多语言
import { setupI18n } from '@/plugins/vueI18n'

// 引入状态管理
import { setupStore } from '@/store'

// 全局组件
import { setupGlobCom } from '@/components'

// 引入element-plus
import { setupElementPlus } from '@/plugins/elementPlus'

// 引入全局样式
import '@/styles/index.less'

// 引入动画
import '@/plugins/animate.css'

// 路由
import router, { setupRouter } from './router'

// 权限
import { setupPermission, openNewTabDirective } from './directives'

import { createApp } from 'vue'

import App from './App.vue'

import './permission'

import { useUserStoreWithOut } from './store/modules/user'
import { checkVersion } from './utils/checkVersion'
import 'element-plus/theme-chalk/el-message.css'
// 创建实例
const setupAll = async () => {
  const app = createApp(App)

  await setupI18n(app)

  setupStore(app)

  setupGlobCom(app)

  setupElementPlus(app)

  setupRouter(app)

  setupPermission(app)

  // 注册全局指令
  app.directive('open-new-tab', openNewTabDirective)

  // Cross-tab logout listener
  const logoutChannel = new BroadcastChannel('logout-channel')
  logoutChannel.onmessage = (event) => {
    const userStore = useUserStoreWithOut()
    if (event.data === 'admin') {
      userStore.reset()
    } else if (event.data === 'merchant') {
      userStore.merReset()
    }
  }

  // Cross-tab login listener
  const loginChannel = new BroadcastChannel('login-channel')
  loginChannel.onmessage = (event) => {
    if (event.data === 'admin-login') {
      // Navigate to the root, letting the navigation guards handle the rest.
      router.push('/home')
    }
  }
  if (import.meta.env.PROD) {
    checkVersion()
  }
  // 添加路由守卫确保路由就绪
  router.isReady().then(() => {
    app.mount('#app')
  })
}

setupAll()
