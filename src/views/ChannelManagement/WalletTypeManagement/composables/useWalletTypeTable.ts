import { ref, unref, type Ref } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { useTable } from '@/hooks/web/useTable'
import { ElMessage } from 'element-plus'
import { getWalletTypeApi, walletTypeApi } from '@/api/channelmanagement'
import type { SearchParams } from '../types'

/**
 * 钱包类型表格逻辑
 */
export const useWalletTypeTable = (searchParams: Ref<SearchParams>) => {
  const { t } = useI18n()

  const { tableRegister, tableState, tableMethods } = useTable({
    fetchDataApi: async () => {
      const { currentPage, pageSize } = tableState

      try {
        const res = await getWalletTypeApi({
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
  const { getList } = tableMethods

  /**
   * 删除数据
   */
  const handleDelete = async (row: any) => {
    const data = { data_uuid: row.uuid, action: 'del' }

    try {
      const res = await walletTypeApi(data)

      if (res?.success) {
        ElMessage.success(t('common.delSuccess')) /* 删除成功 */
        currentPage.value = 1
        getList()
      } else {
        ElMessage.error(res.message)
      }
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  return {
    tableRegister,
    loading,
    dataList,
    total,
    currentPage,
    pageSize,
    getList,
    handleDelete
  }
}
