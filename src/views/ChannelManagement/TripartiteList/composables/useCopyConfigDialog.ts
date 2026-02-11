import { ref, unref } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { ElMessage } from 'element-plus'
import { createTripartApi } from '@/api/channelmanagement'
import { useEnum } from '@/hooks/web/useEnum'

/**
 * 复制配置弹框逻辑
 */
export const useCopyConfigDialog = (options: { onSuccess?: () => void }) => {
  const { t } = useI18n()

  const copyConfigVisible = ref(false)
  const copyConfigFormRef = ref()
  const currentRow = ref<any>()
  const saveLoading = ref(false)
  const { fetchThreePartyDatas } = useEnum()

  /**
   * 打开密钥弹窗
   */
  const openCopyConfigDialog = (row: any) => {
    currentRow.value = row
    copyConfigVisible.value = true
  }

  /**
   * 关闭弹窗
   */
  const closeCopyConfigDialog = () => {
    copyConfigVisible.value = false
    currentRow.value = undefined
  }

  /**
   * 保存数据
   */
  const saveCopyConfig = async () => {
    const copyConfigForm = unref(copyConfigFormRef)
    const formData = await copyConfigForm?.submit()

    if (!formData) return

    const params = {
      ...formData,
      action: 'copyNewThreeParty',
      data_uuid: currentRow.value.uuid
    }

    saveLoading.value = true
    try {
      const res = await createTripartApi(params)

      if (res?.success) {
        ElMessage.success(t('common.successOperation')) /* 操作成功 */
        closeCopyConfigDialog()
        options.onSuccess?.()
        fetchThreePartyDatas(true)
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
    copyConfigVisible,
    copyConfigFormRef,
    currentRow,
    saveLoading,
    openCopyConfigDialog,
    closeCopyConfigDialog,
    saveCopyConfig
  }
}
