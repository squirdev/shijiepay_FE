import { ref, computed, unref } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { ElMessage } from 'element-plus'
import { addPaymentChannelApi, editPaymentChannelApi } from '@/api/channelmanagement'
import type { PaymentChannelType } from '@/api/channelmanagement/types'

/**
 * 支付通道弹窗逻辑
 * 负责弹窗的打开、关闭、保存等操作
 */
export const useWeightsConfigDialog = (onSuccess?: () => void) => {
  const { t } = useI18n()

  const dialogVisible = ref(false)
  const currentRow = ref<PaymentChannelType>()
  const writeRef = ref()
  const saveLoading = ref(false)

  /**
   * 打开弹窗
   */
  const openDialog = (row?: PaymentChannelType) => {
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
    dialogVisible.value = false
    onSuccess?.()
  }

  return {
    // 状态
    dialogVisible,
    currentRow,
    writeRef,
    saveLoading,
    // 方法
    openDialog,
    closeDialog,
    handleSave
  }
}
