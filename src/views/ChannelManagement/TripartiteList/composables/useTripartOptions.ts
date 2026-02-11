import { ref, computed, onMounted } from 'vue'
import { useEnum } from '@/hooks/web/useEnum'
import { getTripartListApi, getTunnelApi, getPayModules } from '@/api/channelmanagement'
import type { TripartOption } from '../types'

/**
 * 三方选项数据管理
 */
export const useTripartOptions = () => {
  const { countryOptions } = useEnum()

  const payModuleOptions = ref<TripartOption[]>([])
  const tunnelOptions = ref<TripartOption[]>([])
  const currentCountry = ref('')

  /**
   * 获取支付模块
   */
  const fetchPayModules = async () => {
    try {
      const res = await getPayModules({})
      if (!res?.success) return

      payModuleOptions.value = res.data?.map((item: any) => ({
        label: item.name,
        value: item.code,
        country: item.country
      }))
    } catch (error) {
      console.error('Failed to fetch pay modules:', error)
    }
  }

  /**
   * 获取通道列表
   */
  const fetchTunnels = async () => {
    try {
      const res = await getTunnelApi({})
      if (!res.success) return

      tunnelOptions.value = res.data.list
        .filter((item: any) => !!item.country)
        .map((item: any) => ({
          label: item.tunnel_name,
          value: item.uuid,
          country: item.country
        }))
    } catch (error) {
      console.error('Failed to fetch tunnels:', error)
    }
  }

  /**
   * 根据国家过滤模块选项
   */
  const filteredModuleOptions = computed(() => {
    if (!currentCountry.value) return []
    return payModuleOptions.value?.filter((l) => l.country === currentCountry.value) ?? []
  })

  /**
   * 初始化所有选项
   */
  const initOptions = async () => {
    await Promise.all([fetchPayModules(), fetchTunnels()])
  }

  onMounted(() => {
    initOptions()
  })

  return {
    countryOptions,
    payModuleOptions,
    tunnelOptions,
    currentCountry,
    filteredModuleOptions,
    initOptions,
    fetchPayModules,
    fetchTunnels
  }
}
