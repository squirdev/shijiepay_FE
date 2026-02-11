import { useEnumStore } from '@/store/modules/enum'
import { getThreePartyDatasApi } from '@/api/collectionmanagement'
import { getCountryListApi } from '@/api/merchantmanagement'
import { computed, onMounted } from 'vue'

interface CountryItem {
  code: string
  currencyCode: string
  currencyName: string
  flag: string
  name: string
}

// 全局标志，确保只初始化一次
let isInitialized = false
let isInitializing = false

/**
 * 枚举数据管理 Hook
 * @param autoLoad 是否自动加载数据，默认 false（按需加载）
 *                 如果为 true，会在 onMounted 时自动加载所有枚举数据
 */
export const useEnum = (autoLoad = false) => {
  const enumStore = useEnumStore()

  // 获取三方数据
  const fetchThreePartyDatas = async (isForce = false) => {
    // 如果已有数据，不重复请求
    if (!isForce && enumStore.getThreePartyOptions.length > 0) {
      return
    }

    try {
      const res = (await getThreePartyDatasApi({})) as Record<string, any>
      if (!res.success) {
        return
      }
      const options =
        res.data.getThreePartyDatas?.map((item: any) => ({
          label: item.name,
          value: item.uuid
        })) ?? []

      enumStore.setThreePartyOptions(options)
    } catch (error) {
      console.error('Failed to fetch three party datas:', error)
    }
  }

  // 获取国家数据
  const fetchCountryOptions = async (isForce = false) => {
    // 如果已有数据，不重复请求
    if (!isForce && enumStore.getCountryOptions.length > 0) {
      return
    }
    try {
      const res = (await getCountryListApi({})) as unknown as Record<string, any>
      if (!res?.success) {
        return
      }

      const options = Object.values(res.data).map((item: CountryItem) => ({
        label: item.name,
        value: item.code
      }))

      enumStore.setCountryOptions(options)
    } catch (error) {
      console.error('Failed to fetch country options:', error)
    }
  }

  // 初始化所有枚举数据（用于全局初始化）
  const initAllEnums = async () => {
    // 如果已经初始化过或正在初始化，直接返回
    if (isInitialized || isInitializing) {
      return
    }

    isInitializing = true
    try {
      await Promise.all([fetchThreePartyDatas(), fetchCountryOptions()])
      isInitialized = true
    } finally {
      isInitializing = false
    }
  }

  // 如果设置了自动加载，则在组件挂载时加载所有枚举（只会执行一次）

  onMounted(() => {
    const path = window.location.pathname
    const isMgr = path.startsWith('/pay4Mgr/')
    if (!isMgr || !autoLoad) return

    initAllEnums()
  })

  return {
    // 响应式数据
    threePartyOptions: computed(() => enumStore.getThreePartyOptions),
    countryOptions: computed(() => enumStore.getCountryOptions),

    // 方法
    fetchThreePartyDatas,
    fetchCountryOptions,
    initAllEnums
  }
}
