import { ref, onUnmounted, computed } from 'vue'

export function useAutoRefresh(callback: () => Promise<void> | void) {
  // 当前倒计时秒数
  const count = ref<number>(0)
  // 当前选中的间隔（0表示不自动刷新）
  const activeInterval = ref<number>(0)
  // 定时器引用
  let timer: any = null

  // 是否处于激活状态
  const isActive = computed(() => activeInterval.value > 0)

  // 清除定时器
  const stopTimer = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  // 开始倒计时
  const startTimer = () => {
    stopTimer() // 确保没有旧的定时器
    if (activeInterval.value <= 0) return

    // 注意：这里不要重置 count.value，因为可能是 handleRefresh 里面重置好了才调用的
    // 如果是第一次启动，count 应该已经在 setRefreshInterval 里被赋值了

    timer = setInterval(() => {
      count.value--
      if (count.value <= 0) {
        // 归零后，立刻停止定时器，防止它继续跑到 -1
        stopTimer()
        handleRefresh()
      }
    }, 1000)
  }

  // 执行刷新逻辑
  const handleRefresh = async () => {
    try {
      await callback()
    } catch (error) {
      console.error('自动刷新失败:', error)
    } finally {
      // 请求结束后，如果还处于开启状态，重置倒计时并重新启动
      if (isActive.value) {
        count.value = activeInterval.value // 重置回 30
        startTimer() // 重新开始跑
      }
    }
  }

  // 设置新的刷新间隔
  const setRefreshInterval = (seconds: number) => {
    activeInterval.value = seconds
    if (seconds === 0) {
      stopTimer()
      count.value = 0
    } else {
      // 首次设置时，先赋值 count，再启动
      count.value = seconds
      startTimer()
    }
  }

  // 手动刷新
  const manualRefresh = () => {
    // 手动刷新时，先停掉定时器，防止冲突
    stopTimer()
    handleRefresh()
  }

  // 组件卸载时清理定时器
  onUnmounted(() => {
    stopTimer()
  })

  return {
    count, // 当前倒计时数值
    isActive, // 是否开启了自动刷新
    activeInterval, // 当前设定的间隔秒数
    setRefreshInterval, // 设置间隔的方法
    manualRefresh // 手动刷新的方法
  }
}
