import { ref, unref } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { ElMessage } from 'element-plus'
import { walletManageApi } from '@/api/channelmanagement'

/**
 * 区间费用弹窗逻辑
 */
export const useRangeDialog = (options: {
  ids: any
  getElTableExpose: () => Promise<any>
  onSuccess?: () => void
}) => {
  const { t } = useI18n()

  const rangeFormVisible = ref(false)
  const currentRow = ref<any>()
  const rangeFormRef = ref()
  const saveLoading = ref(false)
  const batchType = ref<'range' | undefined>()

  /**
   * 打开单个编辑弹窗
   */
  const openRangeDialog = (row: any) => {
    currentRow.value = row
    batchType.value = undefined
    rangeFormVisible.value = true
  }

  /**
   * 打开批量编辑弹窗
   */
  const openBatchRangeDialog = () => {
    if (!options.ids.value.length) {
      ElMessage.error(t('walletManagement.selectWallet')) /* 请选择钱包 */
      return
    }
    batchType.value = 'range'
    currentRow.value = undefined
    rangeFormVisible.value = true
  }

  /**
   * 保存区间费用
   */
  const handleSaveRange = async () => {
    const formData = await unref(rangeFormRef)?.submit()
    if (!formData) return

    let params: any

    // 单个编辑
    if (currentRow.value && !batchType.value) {
      params = {
        action: 'edit_interval_amount',
        data_uuid: currentRow.value.uuid,
        ...formData
      }
    }

    // 批量编辑
    if (batchType.value === 'range' && !currentRow.value) {
      params = {
        action: 'batch_edit_interval_amount',
        data_uuids: options.ids.value,
        ...formData
      }
    }

    saveLoading.value = true
    try {
      const res = await walletManageApi(params)
      const tableRef = await options.getElTableExpose()

      if (res?.success) {
        if (batchType.value) {
          // @ts-ignore
          tableRef?.clearSelection()
        }
        ElMessage.success(t('common.successOperation')) /* 操作成功 */
        rangeFormVisible.value = false
        options.onSuccess?.()
        return true
      } else {
        ElMessage.error(res.message)
        return false
      }
    } catch (error) {
      console.error('Failed to save range:', error)
      ElMessage.error(t('common.failedOperation')) /* 操作失败 */
      return false
    } finally {
      saveLoading.value = false
    }
  }

  return {
    rangeFormVisible,
    currentRow,
    rangeFormRef,
    saveLoading,
    batchType,
    openRangeDialog,
    openBatchRangeDialog,
    handleSaveRange
  }
}
