import { ref, unref, type Ref } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { useTable } from '@/hooks/web/useTable'
import { ElMessage } from 'element-plus'
import { getMchPayoutBankApi, mchPayoutBankApi } from '@/api/channelmanagement'
import { Decimal } from 'decimal.js'
import type { SearchParams } from '../types'
import { hasPermi } from '@/components/Permission'

/**
 * 代付银行表格逻辑
 * 负责表格数据获取、状态更新等操作
 */
export const useBankTable = (searchParams: Ref<SearchParams>) => {
  const { t } = useI18n()
  const ids = ref<string[]>([])

  // 使用 useTable hook
  const { tableRegister, tableState, tableMethods } = useTable({
    fetchDataApi: async () => {
      const { currentPage, pageSize } = tableState

      try {
        const res = await getMchPayoutBankApi({
          pageIndex: unref(currentPage),
          pageSize: unref(pageSize),
          ...unref(searchParams)
        })
        return {
          list: res.data.list.map((item) => ({
            ...item,
            payout_rate: item.payout_rate * 100
          })),
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

  /**
   * 批量更新状态
   */
  const handleBatchStatus = async (status: boolean, singleId?: string) => {
    if (!hasPermi('mchPayoutBankStatu')) {
      ElMessage.error('暂无权限!')
      return
    }

    if (!ids.value.length && !singleId) {
      ElMessage.error(t('common.selectData')) /* 请选择数据 */
      return
    }

    const params = {
      action: status ? 'batch_statu_open' : 'batch_statu_close',
      data_uuids: singleId ? [singleId] : ids.value
    }

    try {
      const res = await mchPayoutBankApi(params)
      const tableRef = await getElTableExpose()
      // @ts-ignore
      tableRef?.clearSelection()

      if (res?.success) {
        ElMessage.success(t('common.successOperation')) /* 操作成功 */
        currentPage.value = 1
        getList()
      } else {
        ElMessage.error(res.message)
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  return {
    // 表格状态
    tableRegister,
    loading,
    dataList,
    total,
    currentPage,
    pageSize,
    ids,
    // 方法
    getList,
    getElTableExpose,
    handleSelectionChange,
    handleBatchStatus
  }
}
