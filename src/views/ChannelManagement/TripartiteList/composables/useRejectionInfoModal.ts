import { ref } from 'vue'

/**
 * 驳回信息弹窗管理
 */
export const useRejectionInfoModal = (onSuccess?: () => void) => {
  const rejectionInfoModalVisible = ref(false)
  const currentRows = ref<any[]>()

  const openRejectionInfoModal = (rows: any) => {
    currentRows.value = rows
    rejectionInfoModalVisible.value = true
  }

  const handleSave = () => {
    rejectionInfoModalVisible.value = false
    onSuccess?.()
  }

  return {
    rejectionInfoModalVisible,
    currentRows,
    openRejectionInfoModal,
    handleSave
  }
}
