import { ref, computed, unref } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { ElMessage } from 'element-plus'
import { createTunnelApi } from '@/api/channelmanagement'
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
  const openDialog = (type: 'add' | 'edit', row?: TunnelType) => {
    actionType.value = type
    currentRow.value = row ? { ...row, password: '' } : undefined
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

    const { tunnel_name, code, note, country } = formData
    const params: Record<string, any> = {
      tunnel_name,
      code,
      note,
      country,
      action: actionType.value === 'add' ? 'addPaymentMethods' : 'editPaymentMethods'
    }

    if (actionType.value === 'edit') {
      params.data_uuid = currentRow.value?.uuid ?? ''
    }

    saveLoading.value = true
    try {
      const res = await createTunnelApi(params)

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
