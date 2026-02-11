import { ref, unref } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { ElMessage } from 'element-plus'
import { createTripartApi } from '@/api/channelmanagement'

/**
 * 对接信息弹窗逻辑
 */
export const useDockingDialog = (onSuccess?: () => void) => {
  const { t } = useI18n()

  const infoVisible = ref(false)
  const infoFormRef = ref()
  const currentRow = ref<any>()
  const saveLoading = ref(false)

  /**
   * 打开对接信息弹窗
   */
  const openDockingDialog = async (row: any) => {
    try {
      const params = {
        action: 'cat_docking_info',
        data_uuid: row.uuid
      }
      const { data } = await createTripartApi(params)
      infoVisible.value = true
      currentRow.value = { ...row, ...data }
    } catch (error) {
      console.error('Failed to get docking info:', error)
      ElMessage.error(t('common.failedOperation')) /* 操作失败 */
    }
  }

  /**
   * 保存对接信息
   */
  const handleSaveDocking = async () => {
    const formData = await unref(infoFormRef)?.submit()
    if (!formData) return

    const params = {
      action: 'edit_docking_info',
      data_uuid: currentRow.value.uuid,
      ...formData
    }

    saveLoading.value = true
    try {
      const res = await createTripartApi(params)

      if (res?.success) {
        ElMessage.success(t('common.successOperation')) /* 操作成功 */
        infoVisible.value = false
        onSuccess?.()
        return true
      } else {
        ElMessage.error(res.message)
        return false
      }
    } catch (error) {
      console.error('Failed to save docking info:', error)
      ElMessage.error(t('common.failedOperation')) /* 操作失败 */
      return false
    } finally {
      saveLoading.value = false
    }
  }

  return {
    infoVisible,
    infoFormRef,
    currentRow,
    saveLoading,
    openDockingDialog,
    handleSaveDocking
  }
}
