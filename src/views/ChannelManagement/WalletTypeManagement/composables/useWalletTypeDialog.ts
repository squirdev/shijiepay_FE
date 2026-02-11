import { ref, computed, unref } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { ElMessage } from 'element-plus'
import { walletTypeApi } from '@/api/channelmanagement'

/**
 * 钱包类型弹窗逻辑
 */
export const useWalletTypeDialog = (onSuccess?: () => void) => {
  const { t } = useI18n()

  const dialogVisible = ref(false)
  const currentRow = ref<any>()
  const writeRef = ref()
  const saveLoading = ref(false)

  const dialogTitle = computed(
    () => (currentRow.value ? t('exampleDemo.edit') : t('exampleDemo.add')) /* 编辑/添加 */
  )

  /**
   * 打开弹窗
   */
  const openDialog = (row?: any) => {
    currentRow.value = row ? { ...row } : undefined
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

    const { country, name, code, note } = formData

    const params = {
      country,
      name,
      note,
      code,
      action: currentRow.value ? 'edit_wallet' : 'add_wallet',
      data_uuid: currentRow.value?.uuid
    }

    saveLoading.value = true
    try {
      const res = await walletTypeApi(params)

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
    openDialog,
    closeDialog,
    handleSave
  }
}
