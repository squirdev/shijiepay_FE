import { ref, unref } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { ElMessage } from 'element-plus'
import { mchPayoutBankApi } from '@/api/channelmanagement'
import { Decimal } from 'decimal.js'
import type { PaymentChannelType } from '@/api/channelmanagement/types'

/**
 * 代付银行弹窗逻辑
 * 负责编辑弹窗的打开、关闭、保存等操作
 */
export const useBankDialog = (options: {
  ids: any
  getElTableExpose: () => Promise<any>
  onSuccess?: () => void
}) => {
  const { t } = useI18n()

  const dialogVisible = ref(false)
  const currentRow = ref<PaymentChannelType>()
  const writeRef = ref()
  const saveLoading = ref(false)
  const batchType = ref<'rate' | undefined>()

  /**
   * 打开编辑弹窗
   */
  const openEditDialog = (row: PaymentChannelType) => {
    batchType.value = undefined
    currentRow.value = {
      ...row,
      // @ts-ignore
      rate: new Decimal(row.rate || 0).mul(100).toNumber()
    }
    dialogVisible.value = true
  }

  /**
   * 打开批量编辑弹窗
   */
  const openBatchDialog = (type: 'rate') => {
    if (!options.ids.value.length) {
      ElMessage.error(t('paymentBank.selectBank')) /* 请选择代付银行 */
      return
    }
    batchType.value = type
    currentRow.value = undefined
    dialogVisible.value = true
  }

  /**
   * 关闭弹窗
   */
  const closeDialog = () => {
    dialogVisible.value = false
    currentRow.value = undefined
    batchType.value = undefined
  }

  /**
   * 保存编辑
   */
  const handleSave = async () => {
    const formData = await unref(writeRef)?.submit()
    if (!formData) return

    const { rate } = formData

    let params: any = {
      action: '',
      rate: new Decimal(rate ?? 0).dividedBy(100).toNumber()
    }

    // 单个编辑
    if (!batchType.value && currentRow.value) {
      params = {
        ...params,
        action: 'edit_data',
        data_uuid: currentRow.value.uuid
      }
    }

    // 批量编辑费率
    if (batchType.value === 'rate') {
      params = {
        ...params,
        action: 'batch_edit_rate',
        data_uuids: options.ids.value
      }
    }

    saveLoading.value = true
    try {
      const res = await mchPayoutBankApi(params)
      const tableRef = await options.getElTableExpose()
      // @ts-ignore
      tableRef?.clearSelection()

      if (res?.success) {
        ElMessage.success(t('common.successOperation')) /* 操作成功 */
        closeDialog()
        options.onSuccess?.()
        return true
      } else {
        ElMessage.error(res.message)
        return false
      }
    } catch (error) {
      console.error('Failed to save:', error)
      ElMessage.error(t('common.failedOperation')) /* 操作失败 */
      return false
    } finally {
      saveLoading.value = false
    }
  }

  return {
    // 状态
    dialogVisible,
    currentRow,
    writeRef,
    saveLoading,
    batchType,
    // 方法
    openEditDialog,
    openBatchDialog,
    closeDialog,
    handleSave
  }
}
