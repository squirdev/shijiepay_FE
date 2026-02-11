// src/utils/checkVersion.ts
import { ElMessageBox } from 'element-plus'

// 闭包变量，仅在当前页面生命周期有效，刷新后重置
let currentVersion: string | null = null
let isShowingUpdateDialog = false

export function checkVersion(interval = 1000 * 60) {
  const check = async () => {
    try {
      // 添加时间戳防止缓存
      const res = await fetch(`${import.meta.env.VITE_BASE_PATH}version.json?_=${Date.now()}`, {
        cache: 'no-store'
      })

      const data = await res.json()
      const remoteVersion = data.version

      // 1. 初始化：页面刚加载时，记录下“现在的版本”作为基准
      if (!currentVersion) {
        currentVersion = remoteVersion
        // 可选：如果你其他地方需要用到本地存储的版本号，可以在这里存一下，
        // 但不要用它来做更新判断逻辑
        localStorage.setItem('APP_VERSION', remoteVersion)
        return
      }

      // 2. 比较：只要远程版本 不等于 当前页面的基准版本
      // 使用 !== 比 > 更安全，因为它能同时处理回滚版本的情况
      if (remoteVersion !== currentVersion) {
        // 如果弹窗已经显示，则不再重复弹窗
        if (isShowingUpdateDialog) return

        isShowingUpdateDialog = true

        ElMessageBox.confirm(
          '检测到系统版本更新，为了您的使用体验，请点击“立即刷新”加载新版本。',
          '版本更新提示',
          {
            confirmButtonText: '立即刷新',
            showCancelButton: false, // 强制刷新
            closeOnClickModal: false,
            closeOnPressEscape: false,
            type: 'warning'
          }
        )
          .then(() => {
            // 用户点击确定，刷新页面
            window.location.reload()
          })
          .catch(() => {
            // 理论上不会走到这里，因为没有取消按钮，
            // 但为了代码健壮性，重置一下状态
            isShowingUpdateDialog = false
          })
      }
    } catch (e) {
      console.warn('自动更新检测失败:', e)
    }
  }

  // 立即执行一次初始化
  check()

  // 开启轮询
  setInterval(check, interval)
}
