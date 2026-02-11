import { ref, unref, onMounted, type Ref } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { useTable } from '@/hooks/web/useTable'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAppStore } from '@/store/modules/app'
import {
  getTripartListApi,
  deleteTripartApi,
  updateTripartBalanceApi,
  createTripartApi
} from '@/api/channelmanagement'
import { useEnum } from '@/hooks/web/useEnum'
import type { SearchParams } from '../types'
import { hasPermi } from '@/components/Permission'
import { useAutoRefresh } from '@/hooks/web/useAutoRefresh'

/**
 * 三方表格逻辑
 */
export const useTripartTable = (searchParams: Ref<SearchParams>) => {
  const { t } = useI18n()
  const appStore = useAppStore()
  const ids = ref<string[]>([])
  const selectedRows = ref<any[]>([])
  const newDataList = ref([])
  const { fetchThreePartyDatas } = useEnum()

  const { tableRegister, tableState, tableMethods } = useTable({
    fetchDataApi: async () => {
      const { currentPage, pageSize } = tableState

      try {
        const res = await getTripartListApi({
          pageIndex: unref(currentPage),
          pageSize: unref(pageSize),
          ...unref(searchParams)
        })
        const newList = res.data.list.map((item) => ({
          ...item,
          payout_rate: item.payout_rate * 100
        }))
        newDataList.value = newList
        return {
          list: newList,
          total: res.data.total
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
        return { list: [], total: 0 }
      }
    },
    fetchDelApi: async () => {
      const res = await deleteTripartApi(unref(ids))
      fetchThreePartyDatas(true)
      return !!res.success
    }
  })

  const { loading, dataList, total, currentPage, pageSize } = tableState
  const { getList, getElTableExpose, delList } = tableMethods

  const pollList = async () => {
    const { currentPage, pageSize } = tableState

    try {
      const res = await getTripartListApi({
        pageIndex: unref(currentPage),
        pageSize: unref(pageSize),
        ...unref(searchParams)
      })

      const map = new Map(res.data.list.map((item) => [item.uuid, item]))

      newDataList.value.forEach((row: Record<string, string>) => {
        const newRow = map.get(row.uuid)
        if (newRow) {
          row.balance_amount = newRow.balance_amount
        }
      })
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const { setRefreshInterval } = useAutoRefresh(pollList)

  onMounted(() => {
    setRefreshInterval(30)
  })

  /**
   * 选择变化
   */
  const handleSelectionChange = (selection: any[]) => {
    ids.value = selection.map((item) => item.uuid)
  }

  /**
   * 删除数据
   */
  const handleDelete = async (row?: any) => {
    const elTableExpose = await getElTableExpose()
    ids.value = row ? [row.uuid] : elTableExpose?.getSelectionRows().map((v: any) => v.uuid) || []

    if (ids.value.length === 0) {
      ElMessage.warning(t('common.delNoData')) /* 请选择需要删除的数据 */
      return
    }

    await delList(unref(ids).length)
  }

  /**
   * 更新余额
   */
  const handleUpdateBalance = async (row: any) => {
    try {
      const data = {
        data_uuid: row?.uuid ?? '',
        action: 'getBalance'
      }

      const res = await updateTripartBalanceApi(data)

      if (res?.success) {
        ElMessage.success({ message: t('common.successOperation'), grouping: false }) /* 操作成功 */
        getList(false)
      } else {
        ElMessage.error(res?.message || t('tripartiteList.balanceUpdateFailed')) /* 余额更新失败 */
      }
    } catch (error) {
      if (error !== 'cancel') {
        console.error('Failed to update balance:', error)
      }
    }
  }

  /**
   * 批量更新余额
   */
  const handleBatchBalance = async () => {
    if (!ids.value.length) {
      ElMessage.error(t('common.selectData')) /* 请选择数据 */
      return
    }

    const params = {
      action: 'batchUpdateBalance',
      three_party_uuids: ids.value
    }

    try {
      const res = await updateTripartBalanceApi(params)
      const tableRef = await getElTableExpose()
      // @ts-ignore
      tableRef?.clearSelection()

      if (res?.success) {
        ElMessage.success(t('common.successOperation')) /* 操作成功 */
        currentPage.value = 1
        getList(false)
      } else {
        ElMessage.error(res.message)
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  /**
   * 更新状态
   */
  const handleStatusChange = async (row: any, values: any) => {
    if (!hasPermi('threePartyDsDfKz')) {
      ElMessage.error('暂无权限!')
      return
    }
    const {
      country,
      name,
      mch_id,
      mch_secretkey,
      mch_login_url,
      mch_account,
      mch_password,
      callback_ip,
      payout_statu,
      payment_statu,
      module_code,
      note,
      uuid
    } = row

    const params = {
      country,
      name,
      mch_id,
      mch_secretkey,
      mch_login_url,
      mch_account,
      mch_password,
      callback_ip,
      payout_statu,
      payment_statu,
      module_code,
      note,
      countryTunnelDatas: [],
      action: 'edit_threeParty',
      data_uuid: uuid,
      ...values
    }

    try {
      const res = await createTripartApi(params)

      if (res?.success) {
        ElMessage.success(t('common.successOperation')) /* 操作成功 */
        currentPage.value = 1
        getList()
        fetchThreePartyDatas(true)
      } else {
        ElMessage.error(res.message)
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const payoutStatusChange = async (action, data_uuid) => {
    if (
      (action === 'update_payout_zdzf_statu' && !hasPermi('threePartyPayoutzdzfstatu')) ||
      (action === 'update_payout_qqsfxd_statu' && !hasPermi('threePartyPayoutqqsfxdstatu')) ||
      (action === 'update_payout_znjdqjdd_statu' && !hasPermi('threePartyPayoutznjdqjddstatu'))
    ) {
      ElMessage.error('暂无权限!')
      return
    }

    const params = { action, data_uuid }
    try {
      const res = await createTripartApi(params)

      if (res?.success) {
        ElMessage.success(t('common.successOperation')) /* 操作成功 */
        currentPage.value = 1
        getList()
        fetchThreePartyDatas(true)
      } else {
        ElMessage.error(res.message)
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const clearSelection = async () => {
    const tableRef = await getElTableExpose()
    // @ts-ignore
    tableRef?.clearSelection()
  }
  console.log(`dataList`, dataList)
  return {
    tableRegister,
    loading,
    dataList: newDataList,
    total,
    currentPage,
    pageSize,
    getList,
    handleDelete,
    clearSelection,
    handleUpdateBalance,
    handleStatusChange,
    payoutStatusChange,
    handleBatchBalance,
    handleSelectionChange,
    ids
  }
}
