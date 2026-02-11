import { ref, unref } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createTripartApi } from '@/api/channelmanagement'

/**
 * 密钥查看弹窗逻辑
 */
export const useSecretDialog = (onSuccess?: () => void) => {
  const { t } = useI18n()

  const secretVisible = ref(false)
  const secretFormRef = ref()
  const currentRow = ref<any>()
  const saveLoading = ref(false)

  /**
   * 打开密钥弹窗
   */
  const openSecretDialog = (row: any) => {
    currentRow.value = row
    secretVisible.value = true
  }

  /**
   * 获取密钥
   */
  const handleGetSecret = async () => {
    const formData = await unref(secretFormRef)?.submit()
    if (!formData) return

    const params = {
      action: 'getSecretkeyData',
      data_uuid: currentRow.value.uuid,
      ...formData
    }

    saveLoading.value = true
    try {
      const res = await createTripartApi(params)

      if (res?.success) {
        ElMessage.success(t('common.successOperation')) /* 操作成功 */
        secretVisible.value = false

        // 显示密钥信息
        ElMessageBox.alert(
          `<div>
            <div class="flex h-54px items-center text-18px">
              <span class="w-180px text-right mr-20px color-[#636363]">${t('tripartiteList.upstreamKey') /* 上游秘钥 */}:</span>
              <span class="color-[#0e0e0e]">${res.data.mch_secretkey ?? ''}</span>
          </div>
          <div class="flex h-54px items-center text-18px">
              <span class="w-180px text-right mr-20px color-[#636363]">${t('tripartiteList.upstreamPassword') /* 上游商户登陆密码 */}:</span>
            <span class="color-[#0e0e0e]">${res.data.mch_password ?? ''}</span>
          </div>
        </div>`,
          t('tripartiteList.viewSecret') /* 查看秘钥 */,
          {
            confirmButtonText: t('common.delOk') /* 确定 */,
            dangerouslyUseHTMLString: true,
            customStyle: {
              '--el-messagebox-width': '576px',
              width: '576px!important'
            }
          }
        )

        onSuccess?.()
        return true
      } else {
        ElMessage.error(res.message)
        return false
      }
    } catch (error) {
      console.error('Failed to get secret:', error)
      ElMessage.error(t('common.failedOperation')) /* 操作失败 */
      return false
    } finally {
      saveLoading.value = false
    }
  }

  return {
    secretVisible,
    secretFormRef,
    currentRow,
    saveLoading,
    openSecretDialog,
    handleGetSecret
  }
}
