import { ref, unref } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { ElMessage } from 'element-plus'
import { walletManageApi } from '@/api/channelmanagement'
import { Decimal } from 'decimal.js'

/**
 * 钱包编辑弹窗逻辑
 */
export const useWalletDialog = (options: {
  ids: any
  getElTableExpose: () => Promise<any>
  onSuccess?: () => void
}) => {
  const { t } = useI18n()

  const dialogVisible = ref(false)
  const currentRow = ref<any>()
  const writeRef = ref()
  const saveLoading = ref(false)
  const batchType = ref<'rate' | undefined>()

  /**
   * 打开编辑弹窗
   */
  const openEditDialog = (row: any) => {
    batchType.value = undefined
    currentRow.value = {
      ...row,
      rate: new Decimal(row.rate || 0).mul(100).toNumber()
    }
    dialogVisible.value = true
  }

  /**
   * 打开批量编辑弹窗
   */
  const openBatchDialog = (type: 'rate') => {
    if (!options.ids.value.length) {
      ElMessage.error(t('walletManagement.selectWallet')) /* 请选择钱包 */
      return
    }
    batchType.value = type
    currentRow.value = undefined
    dialogVisible.value = true
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
      const res = await walletManageApi(params)
      const tableRef = await options.getElTableExpose()

      if (res?.success) {
        if (batchType.value) {
          // @ts-ignore
          tableRef?.clearSelection()
        }
        ElMessage.success(t('common.successOperation')) /* 操作成功 */
        dialogVisible.value = false
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
    dialogVisible,
    currentRow,
    writeRef,
    saveLoading,
    batchType,
    openEditDialog,
    openBatchDialog,
    handleSave
  }
}
