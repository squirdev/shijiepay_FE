import { ref, computed, unref } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { ElMessage } from 'element-plus'
import { createTripartApi } from '@/api/channelmanagement'
import { useEnum } from '@/hooks/web/useEnum'

/**
 * 三方弹窗逻辑
 */
export const useTripartDialog = (options: {
  currentCountry: any
  tunnelOptions: any
  onSuccess?: () => void
}) => {
  const { t } = useI18n()

  const dialogVisible = ref(false)
  const actionType = ref<'add' | 'edit'>('add')
  const currentRow = ref<any>()
  const writeRef = ref()
  const saveLoading = ref(false)
  const { fetchThreePartyDatas } = useEnum()

  const dialogTitle = computed(
    () => t(actionType.value === 'edit' ? 'exampleDemo.edit' : 'exampleDemo.add') /* 编辑/添加 */
  )

  /**
   * 打开弹窗
   */
  const openDialog = (type: 'add' | 'edit', row?: any) => {
    actionType.value = type

    if (type === 'edit' && row) {
      options.currentCountry.value = row.country
      currentRow.value = {
        ...row,
        name: row.name,
        note: row.note,
        country: row.country,
        mch_id: row.mch_id,
        mch_secretkey: '',
        mch_secretkey2: '',
        mch_login_url: row.mch_login_url,
        mch_account: row.mch_account,
        mch_password: row.mch_password,
        callback_ip: row.callback_ip,
        payout_statu: row.payout_statu,
        payment_statu: row.payment_statu,
        module_code: row.module_code,
        max_consecutive_failures: row.max_consecutive_failures,
        min_limit_balance_amount: row.min_limit_balance_amount,
        max_limit_balance_amount: row.max_limit_balance_amount,
        countryTunnelDatas: row?.countryTunnelDatas?.map((l: any) => l.tunnel_uuid) ?? [],
        uuid: row.uuid,
        payout_verification_amount: row.payout_verification_amount
      }

      // 更新通道选项的费率
      options.tunnelOptions.value = options.tunnelOptions.value.map((item: any) => {
        const rate =
          row?.countryTunnelDatas?.find((l: any) => l.tunnel_uuid === item.value)?.rate ?? ''
        return { ...item, rate }
      })
    } else {
      options.currentCountry.value = ''
      currentRow.value = undefined
    }

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

    const {
      country,
      name,
      mch_id,
      mch_secretkey,
      mch_login_url,
      mch_account,
      mch_password,
      mch_secretkey2,
      callback_ip,
      payout_statu,
      payment_statu,
      module_code,
      payout_verification_amount,
      note
    } = formData

    const params = {
      country,
      name,
      mch_id,
      mch_secretkey,
      mch_login_url,
      mch_account,
      mch_password,
      mch_secretkey2,
      callback_ip,
      payout_statu,
      payment_statu,
      module_code,
      note,
      payout_verification_amount: +payout_verification_amount,
      countryTunnelDatas: [],
      action: actionType.value === 'add' ? 'add_threeParty' : 'edit_threeParty',
      data_uuid: currentRow.value?.uuid
    }

    saveLoading.value = true
    try {
      const res = await createTripartApi(params)

      if (res?.success) {
        ElMessage.success(t('common.successOperation')) /* 操作成功 */
        closeDialog()
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
