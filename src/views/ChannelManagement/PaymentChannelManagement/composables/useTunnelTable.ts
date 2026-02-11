import { ref, unref, type Ref } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { useTable } from '@/hooks/web/useTable'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTunnelApi, deleteTunnelApi, updateTunnelApi } from '@/api/channelmanagement'
import type { TunnelType } from '@/api/channelmanagement/types'
import type { SearchParams } from '../types'
import { hasPermi } from '@/components/Permission'

/**
 * 支付方式表格逻辑
 */
export const useTunnelTable = (searchParams: Ref<SearchParams>) => {
  const { t } = useI18n()
  const ids = ref<string[]>([])

  const { tableRegister, tableState, tableMethods } = useTable({
    fetchDataApi: async () => {
      const { currentPage, pageSize } = tableState

      try {
        const res = await getTunnelApi({
          pageIndex: unref(currentPage),
          pageSize: unref(pageSize),
          ...unref(searchParams)
        })
        return {
          list: res.data?.list ?? [],
          total: res.data.total ?? 0
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
        return { list: [], total: 0 }
      }
    },
    fetchDelApi: async () => {
      const res = await deleteTunnelApi(unref(ids)[0])
      return !!res.success
    }
  })

  const { loading, dataList, total, currentPage, pageSize } = tableState
  const { getList, delList } = tableMethods

  /**
   * 删除数据
   */
  const handleDelete = async (row: TunnelType) => {
    ids.value = [row.uuid]
    await delList(1)
  }

  /**
   * 更新状态
   */
  const handleStatusChange = async (row: TunnelType) => {
    if (!hasPermi('tunnleManageKg')) {
      ElMessage.error('暂无权限!')
      return
    }
    try {
      await ElMessageBox.confirm(
        row.tunnel_statu
          ? t('channelManagement.tunnelCloseStatu') /* 您确定要关闭此通道吗？ */
          : t('channelManagement.tunnelOpenStatu') /* 您确定要打开此通道吗？ */,
        t('paymentManagement.warning') /* 警告 */,
        {
          confirmButtonText: t('paymentManagement.ok') /* 确定 */,
          cancelButtonText: t('paymentManagement.cancel') /* 取消 */,
          type: 'warning',
          center: true
        }
      )

      const res = await updateTunnelApi(row)
      if (res?.success) {
        ElMessage.success(t('common.successOperation')) /* 操作成功 */
        getList()
      } else {
        ElMessage.error(res.message)
      }
    } catch (error) {
      if (error !== 'cancel') {
        console.error('Failed to update status:', error)
        ElMessage.error(t('common.error')) /* 错误 */
      } else {
        ElMessage.info(t('common.operationCanceled')) /* 操作已取消 */
      }
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
    handleDelete,
    handleStatusChange
  }
}
