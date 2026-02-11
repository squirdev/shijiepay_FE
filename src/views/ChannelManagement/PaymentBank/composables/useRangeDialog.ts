import { ref, unref } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { ElMessage } from 'element-plus'
import { mchPayoutBankApi } from '@/api/channelmanagement'
import type { FeeRangeRow } from '../types'

/**
 * 区间费用弹窗逻辑
 * 负责区间费用配置弹窗的打开、关闭、保存等操作
 */
export const useRangeDialog = (options: {
  ids: any
  getElTableExpose: () => Promise<any>
  onSuccess?: () => void
}) => {
  const { t } = useI18n()

  const rangeFormVisible = ref(false)
  const currentRow = ref<FeeRangeRow>()
  const rangeFormRef = ref()
  const saveLoading = ref(false)
  const batchType = ref<'range' | undefined>()

  /**
   * 打开单个编辑弹窗
   */
  const openRangeDialog = (row: any) => {
    currentRow.value = row as FeeRangeRow
    batchType.value = undefined
    rangeFormVisible.value = true
  }

  /**
   * 打开批量编辑弹窗
   */
  const openBatchRangeDialog = () => {
    if (!options.ids.value.length) {
      ElMessage.error(t('paymentBank.selectWallet')) /* 请选择钱包 */
      return
    }
    batchType.value = 'range'
    currentRow.value = undefined
    rangeFormVisible.value = true
  }

  /**
   * 关闭弹窗
   */
  const closeRangeDialog = () => {
    rangeFormVisible.value = false
    currentRow.value = undefined
    batchType.value = undefined
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
      const res = await mchPayoutBankApi(params)
      const tableRef = await options.getElTableExpose()

      if (res?.success) {
        if (batchType.value) {
          // @ts-ignore
          tableRef?.clearSelection()
        }
        ElMessage.success(t('common.successOperation')) /* 操作成功 */
        closeRangeDialog()
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
    // 状态
    rangeFormVisible,
    currentRow,
    rangeFormRef,
    saveLoading,
    batchType,
    // 方法
    openRangeDialog,
    openBatchRangeDialog,
    closeRangeDialog,
    handleSaveRange
  }
}
