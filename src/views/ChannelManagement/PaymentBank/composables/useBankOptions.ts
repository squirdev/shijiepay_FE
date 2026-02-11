import { ref, onMounted, computed } from 'vue'
import { useEnum } from '@/hooks/web/useEnum'
import { getWalletManageList } from '@/api/channelmanagement'
import type { BankOption } from '../types'

/**
 * 代付银行选项数据管理
 * 负责获取和管理所有下拉选项数据
 */
export const useBankOptions = () => {
  const currentCountry = ref('')

  // 使用全局枚举
  const { countryOptions } = useEnum()

  // 本地选项
  const walletTypeOptions = ref<BankOption[]>([])

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
   * 初始化所有选项
   */
  const initOptions = async () => {
    await fetchWalletTypes()
  }

  /**
   * 根据国家过滤钱包类型选项
   */
  const filteredWalletTypeOptions = computed(() => {
    if (!currentCountry.value) return []
    return walletTypeOptions.value?.filter((l) => l.country === currentCountry.value) ?? []
  })

  onMounted(() => {
    initOptions()
  })

  return {
    currentCountry,
    // 全局枚举
    countryOptions,
    walletTypeOptions,
    // 本地选项
    filteredWalletTypeOptions,
    // 方法
    initOptions,
    fetchWalletTypes
  }
}
