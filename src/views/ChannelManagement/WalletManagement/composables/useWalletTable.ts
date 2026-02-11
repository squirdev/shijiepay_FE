import { ref, unref, type Ref } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { useTable } from '@/hooks/web/useTable'
import { ElMessage } from 'element-plus'
import { getWalletManageApi } from '@/api/channelmanagement'
import type { SearchParams } from '../types'

/**
 * 钱包表格逻辑
 */
export const useWalletTable = (searchParams: Ref<SearchParams>) => {
  const { t } = useI18n()
  const ids = ref<string[]>([])

  const { tableRegister, tableState, tableMethods } = useTable({
    fetchDataApi: async () => {
      const { currentPage, pageSize } = tableState

      try {
        const res = await getWalletManageApi({
          pageIndex: unref(currentPage),
          pageSize: unref(pageSize),
          ...unref(searchParams)
        })
        return {
          list: res.data.list,
          total: res.data.total
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
        return { list: [], total: 0 }
      }
    }
  })

  const { loading, dataList, total, currentPage, pageSize } = tableState
  const { getList, getElTableExpose } = tableMethods

  /**
   * 选择变化
   */
  const handleSelectionChange = (selection: any[]) => {
    ids.value = selection.map((item) => item.uuid)
  }

  return {
    tableRegister,
    loading,
    dataList,
    total,
    currentPage,
    pageSize,
    ids,
    getList,
    getElTableExpose,
    handleSelectionChange
  }
}
