import { ref, onMounted, computed } from 'vue'
import { useEnum } from '@/hooks/web/useEnum'
import { getWalletManageList } from '@/api/channelmanagement'
import type { WalletOption } from '../types'

/**
 * 钱包选项数据管理
 */
export const useWalletOptions = () => {
  const { countryOptions } = useEnum()
  const currentCountry = ref('')

  const walletTypeOptions = ref<WalletOption[]>([])

  /**
   * 获取钱包类型
   */
  const fetchWalletTypes = async () => {
    try {
      const res = await getWalletManageList({})
      if (!res?.success) return

      walletTypeOptions.value = Object.values(res.data).map((item: any) => ({
        label: item.name,
        value: item.uuid,
        country: item.country
      }))
    } catch (error) {
      console.error('Failed to fetch wallet types:', error)
    }
  }

  /**
   * 根据国家过滤钱包类型选项
   */
  const filteredWalletTypeOptions = computed(() => {
    if (!currentCountry.value) return []
    return walletTypeOptions.value?.filter((l) => l.country === currentCountry.value) ?? []
  })

  onMounted(() => {
    fetchWalletTypes()
  })

  return {
    currentCountry,
    countryOptions,
    walletTypeOptions,
    filteredWalletTypeOptions,
    fetchWalletTypes
  }
}
