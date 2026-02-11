import { ref, unref } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { ElMessage } from 'element-plus'
import { getSerkeyApi } from '@/api/merchantmanagement'

/**
 * 复制配置弹框逻辑
 */
export const useCopyMerchantDialog = (options: { onSuccess?: () => void }) => {
  const { t } = useI18n()

  const copyMerchantVisible = ref(false)
  const copyMerchantFormRef = ref()
  const currentRow = ref<any>()
  const saveLoading = ref(false)

  /**
   * 打开密钥弹窗
   */
  const opencopyMerchantDialog = (row: any) => {
    currentRow.value = row
    copyMerchantVisible.value = true
  }

  /**
   * 关闭弹窗
   */
  const closecopyMerchantDialog = () => {
    copyMerchantVisible.value = false
    currentRow.value = undefined
  }

  /**
   * 保存数据
   */
  const savecopyMerchant = async () => {
    const copyMerchantForm = unref(copyMerchantFormRef)
    const formData = await copyMerchantForm?.submit()

    if (!formData) return

    const params = {
      ...formData,
      action: 'copyNewMch',
      data_uuid: currentRow.value.uuid
    }

    saveLoading.value = true
    try {
      const res = await getSerkeyApi(params)

      if (res?.success) {
        ElMessage.success(t('common.successOperation')) /* 操作成功 */
        closecopyMerchantDialog()
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
    copyMerchantVisible,
    copyMerchantFormRef,
    currentRow,
    saveLoading,
    opencopyMerchantDialog,
    closecopyMerchantDialog,
    savecopyMerchant
  }
}
