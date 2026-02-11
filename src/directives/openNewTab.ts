export default {
  mounted(el, binding) {
    // 获取要打开的URL（支持动态值）
    const url = binding.value ?? location.href

    // 点击事件处理器
    const handler = (e) => {
      // 检查是否按下了 Ctrl/Cmd + 鼠标左键
      if ((e.ctrlKey || e.metaKey) && e.button === 0) {
        e.preventDefault()

        // 打开新标签页（添加安全属性）
        const newWindow = window.open(url, '_blank')
        if (newWindow) {
          newWindow.opener = null // 防止安全漏洞
          newWindow.rel = 'noopener noreferrer'
        }
      }
    }

    // 保存处理器引用以便卸载时使用
    el._openNewTabHandler = handler

    // 添加事件监听
    el.addEventListener('click', handler)

    // 添加键盘支持（可选）
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        handler(e)
      }
    })
  },

  updated(el, binding) {
    // 当绑定的URL更新时，更新处理器
    if (binding.oldValue !== binding.value) {
      el._openNewTabHandler = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.button === 0) {
          e.preventDefault()
          window.open(binding.value, '_blank', 'noopener,noreferrer')
        }
      }
    }
  },

  unmounted(el) {
    // 清理事件监听器
    if (el._openNewTabHandler) {
      el.removeEventListener('click', el._openNewTabHandler)
      el.removeEventListener('keydown', el._openNewTabHandler)
      delete el._openNewTabHandler
    }
  }
}
