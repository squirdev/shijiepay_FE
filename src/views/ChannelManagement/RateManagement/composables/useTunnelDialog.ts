import { ref, computed, unref } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { ElMessage } from 'element-plus'
import { tunnelRateApi } from '@/api/channelmanagement'
import { Decimal } from 'decimal.js'
import type { TunnelType } from '@/api/channelmanagement/types'

/**
 * 支付方式弹窗逻辑
 */
export const useTunnelDialog = (onSuccess?: () => void) => {
  const { t } = useI18n()

  const dialogVisible = ref(false)
  const actionType = ref<'add' | 'edit'>('add')
  const currentRow = ref<TunnelType>()
  const writeRef = ref()
  const saveLoading = ref(false)

  const dialogTitle = computed(
    () => t(actionType.value === 'edit' ? 'exampleDemo.edit' : 'exampleDemo.add') /* 编辑/添加 */
  )

  /**
   * 打开弹窗
   */
  const openDialog = (type: 'add' | 'edit', row) => {
    actionType.value = type
    currentRow.value = row
      ? { ...row, rate: new Decimal(row.rate || 0).mul(100).toNumber() }
      : undefined
    dialogVisible.value = true
  }

  /**
   * 关闭弹窗
   */
  const closeDialog = () => {
    dialogVisible.value = false
    currentRow.value = undefined
  }

  /**
   * 保存数据
   */
  const handleSave = async () => {
    const formData = await unref(writeRef)?.submit()
    if (!formData) return

    const { name, tunnel_uuid, country, rate } = formData
    const params: Record<string, any> = {
      name,
      tunnel_uuid,
      rate: new Decimal(rate ?? 0).dividedBy(100).toNumber(),
      country,
      action: actionType.value === 'add' ? 'add' : 'edit'
    }

    if (actionType.value === 'edit') {
      params.data_uuid = currentRow.value?.uuid ?? ''
    }

    saveLoading.value = true
    try {
      const res = await tunnelRateApi(params)

      if (res?.success) {
        ElMessage.success(t('common.successOperation')) /* 操作成功 */
        closeDialog()
        onSuccess?.()
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
    dialogTitle,
    currentRow,
    writeRef,
    saveLoading,
    actionType,
    openDialog,
    closeDialog,
    handleSave
  }
}
