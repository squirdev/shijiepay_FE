<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/CustomSearch'
import { Dialog } from '@/components/Dialog'
import { useI18n } from '@/hooks/web/useI18n'
import { Table, TableColumn } from '@/components/Table'
import {
  getWithdrawalStatisticsApi,
  getWithdrawalListApi,
  withdrawApi
} from '@/api/merchantmanagement/index'
import { useTable } from '@/hooks/web/useTable'
import { ref, unref, reactive } from 'vue'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { Breadcrumb } from '@/components/Breadcrumb'
import {
  ElMessage,
  ElMessageBox,
  ElDropdown,
  ElRow,
  ElCol,
  ElDropdownMenu,
  ElDropdownItem,
  ElTag
} from 'element-plus'
import { BaseButton } from '@/components/Button'
import { WithdrawListType } from '@/api/merchantmanagement/types'
import { useAppStore } from '@/store/modules/app'
import { formatToDate, todayStart, tomorrowStart } from '@/utils/dateUtil'
import NoteForm from './components/NoteForm'
import { hasPermi } from '@/components/Permission'

const ids = ref<string[]>([])

const { t } = useI18n()

const settleStatuOptons = [
  { label: '待审核', value: 'review' },
  { label: t('settlement.success'), value: 'success' },
  { label: t('settlement.rejected'), value: 'reject' }
]

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getWithdrawalListApi({
      pageIndex: unref(currentPage),
      pageSize: unref(pageSize),
      ...unref(searchParams)
    })
    return {
      list: res.data.list,
      total: res.data.total
    }
  },
  fetchDelApi: async () => {
    // const res = await delTableListApi(unref(ids))
    return false
  }
})

const totalData = reactive({
  totalAmount: 0,
  number_count: 0
})
const appStore = useAppStore()
const { loading, dataList, total, currentPage, pageSize } = tableState
const { getList } = tableMethods

const searchRef = ref()
const currentDate = formatToDate(new Date())
const searchParams = ref({
  create_time: `${todayStart}|${tomorrowStart}`
})

const processParams = (params) => {
  if (params.create_time) {
    params.create_time = params.create_time.join('|')
  }
  searchParams.value = params
}
const setSearchParams = (params: any) => {
  processParams(params)
  getList()
}

const getStatistics = async () => {
  const currentValues = await searchRef.value.getFormData()
  processParams(currentValues)
  appStore.pageLoading = true
  try {
    const res = await getWithdrawalStatisticsApi(searchParams.value)
    totalData.totalAmount = res.data.amount_total
    totalData.number_count = res.data.number_count
    totalDialogVisible.value = true
  } catch (error) {
    console.log(error)
  } finally {
    appStore.pageLoading = false
  }
}

const saveLoading = ref(false)

const crudSchemas = reactive<CrudSchema[]>([
  {
    field: 'merchant_name',
    label: t('formDemo.merchantname'),
    search: {
      component: 'Input',
      componentProps: {
        placeholder: t('formDemo.merchantname')
      }
    }
  },
  {
    field: 'merchant_id',
    label: t('merchantList.merchantID'),
    search: {
      component: 'Input',
      componentProps: {
        placeholder: t('merchantList.merchantID')
      }
    }
  },
  {
    field: 'payee_bank',
    label: t('formDemo.receivingbank'),
    search: {
      hidden: true
    }
  },
  {
    field: 'payee_bankcard',
    label: t('formDemo.paymentcardnumber'),
    search: {
      component: 'Input',
      componentProps: {
        placeholder: t('formDemo.paymentcardnumber')
      }
    }
  },
  {
    field: 'payee_username',
    label: t('formDemo.payeename'),
    search: {
      hidden: true
    }
  },
  {
    field: 'amount',
    label: t('formDemo.withdrawalamount'),
    search: {
      component: 'Input',
      componentProps: {
        placeholder: t('formDemo.withdrawalamount')
      }
    },
    formatter: (_: any, __: TableColumn, cellValue: number) => {
      return cellValue ? Number(cellValue.toFixed(2)).toLocaleString() : 0
    }
  },
  {
    field: 'repay_amount',
    label: t('formDemo.fees'),
    search: {
      hidden: true
    },
    formatter: (_: any, __: TableColumn, cellValue: number) => {
      return cellValue ? Number(cellValue.toFixed(2)).toLocaleString() : 0
    }
  },
  {
    field: 'actual_amount',
    label: t('formDemo.actualdeductionamount'),
    search: {
      hidden: true
    },
    formatter: (_: any, __: TableColumn, cellValue: number) => {
      return cellValue ? Number(cellValue.toFixed(2)).toLocaleString() : 0
    }
  },
  {
    field: 'statu',
    label: t('formDemo.processingstatus'),
    search: {
      hidden: true
    },
    formatter: (_: any, __: TableColumn, cellValue: string) => {
      const name = settleStatuOptons.find((l) => l.value === cellValue)?.label
      if (cellValue === 'success') {
        return <ElTag type="success">{name}</ElTag>
      } else if (cellValue === 'reject') {
        return <ElTag type="danger">{name}</ElTag>
      } else {
        return <ElTag type="primary">{name}</ElTag>
      }
    }
  },
  {
    field: 'create_time',
    label: '申请时间',
    search: {
      component: 'DatePicker',
      componentProps: {
        type: 'datetimerange',
        placeholder: t('formDemo.time'),
        valueFormat: 'YYYY-MM-DD HH:mm:ss'
      }
    }
  },
  {
    field: 'dealwith_time',
    label: '处理时间',
    search: {
      hidden: true
    }
  },
  {
    field: 'note',
    label: t('paymentManagement.remark'),
    search: {
      hidden: true
    }
  },
  {
    field: 'Operate',
    label: t('merchantList.operate'),
    fixed: 'right',
    search: {
      hidden: true
    },
    form: {
      hidden: true
    },
    'min-width': 160,
    table: {
      slots: {
        default: (data: any) => {
          const row = data.row as WithdrawListType
          return (
            <div style="display: flex; flex-wrap: wrap; justify-content: center; align-items: center;">
              {hasPermi('withdrawSuccess') && (
                <>
                  <BaseButton
                    type="text"
                    style="color: #67C23A"
                    onClick={() => withdrawOperate(row.uuid, 'withdrawSuccess')}
                  >
                    通过
                  </BaseButton>
                  <el-divider direction="vertical" class="w-[1px] h-[16px] bg-[#dfe6ec]" />
                </>
              )}

              {hasPermi('withdrawReject') && (
                <>
                  <BaseButton
                    type="text"
                    style="margin-left: 0; color: #F56C6C"
                    onClick={() => withdrawOperate(row.uuid, 'withdrawReject')}
                  >
                    拒绝
                  </BaseButton>
                  <el-divider direction="vertical" class="w-[1px] h-[16px] bg-[#dfe6ec]" />
                </>
              )}

              <ElDropdown
                trigger="click"
                v-slots={{
                  default: () => {
                    return <BaseButton type="text">{t('workplace.more')}</BaseButton>
                  },
                  dropdown: () => {
                    return (
                      <ElDropdownMenu>
                        {hasPermi('withdrawUpdateNote') && (
                          <ElDropdownItem key={'x'} onClick={() => showNodeModal(row)}>
                            更新备注
                          </ElDropdownItem>
                        )}
                      </ElDropdownMenu>
                    )
                  }
                }}
              ></ElDropdown>
            </div>
          )
        }
      }
    }
  }
])

// @ts-ignore
const { allSchemas } = useCrudSchemas(crudSchemas)
const totalDialogVisible = ref(false)
const currentRow = ref()
const noteVisible = ref(false)
const noteFormRef = ref()

const withdrawOperate = async (uuid: string, action: string) => {
  try {
    const newValues = {
      action,
      data_uuid: uuid
    }
    // appStore.pageLoading = true
    const res = await withdrawApi(newValues)

    if (res?.success) {
      const msg = action === 'queryOrder' ? res.message : t('common.successOperation')
      ElMessage.success(msg)
    } else {
      ElMessage.error(res.message)
      return
    }

    getList()
  } catch (error) {
    console.log(error)
  } finally {
    appStore.pageLoading = false
  }
}
const showNodeModal = (row) => {
  noteVisible.value = true
  currentRow.value = row
}

const updateNote = async () => {
  const noteForm = unref(noteFormRef)
  const formData = await noteForm?.submit()

  if (!formData) return

  const newValues = {
    action: 'updateNote',
    data_uuid: currentRow.value.uuid,
    note: '',
    ...formData
  }
  saveLoading.value = true
  try {
    const res = await withdrawApi(newValues)

    if (res?.success) {
      ElMessage.success(t('common.successOperation'))
    } else {
      ElMessage.error(res.message)
      return
    }
    noteVisible.value = false
    getList()
  } catch (error) {
    console.log(error)
  } finally {
    saveLoading.value = false
  }
}
</script>

<template>
  <ContentWrap class="search-section">
    <div class="log-search">
      <!-- <p style="min-width: 50px; padding-top: 8px">{{ t('common.search') }} :</p> -->
      <Search
        ref="searchRef"
        :schema="allSchemas.searchSchema"
        :model="{ create_time: [todayStart, tomorrowStart] }"
        :show-order-statistics="hasPermi('withdrawTotal')"
        @order-statistics="getStatistics"
        @search="setSearchParams"
        @reset="setSearchParams"
      />
    </div>
  </ContentWrap>
  <ContentWrap :style="{ minHeight: '700px' }">
    <Table
      v-model:pageSize="pageSize"
      v-model:currentPage="currentPage"
      :columns="allSchemas.tableColumns"
      :data="dataList"
      :loading="loading"
      :pagination="{
        total: total
      }"
      @register="tableRegister"
    >
      <template #empty>
        <div style="text-align: center; padding: 40px; color: #999">
          <img src="@/assets/imgs/no_data.png" style="width: 120px" />
          <p style="line-height: 30px">{{ t('common.noData') }}</p>
        </div>
      </template>
    </Table>
  </ContentWrap>

  <Dialog
    v-model="totalDialogVisible"
    :title="t('merchantList.orderDataStatistics')"
    :style="{ maxWidth: '500px' }"
  >
    <ElRow>
      <ElCol :span="13" :tag="'span'" style="text-align: right; padding: 10px">
        {{ t('merchantList.totalAmount') + ' :' }}
      </ElCol>
      <ElCol :span="11" :tag="'span'" style="color: black; padding: 10px">
        {{ totalData.totalAmount }}
      </ElCol>
    </ElRow>
    <ElRow>
      <ElCol :span="13" :tag="'span'" style="text-align: right; padding: 10px">
        {{ t('merchantList.totalItem') + ' :' }}
      </ElCol>
      <ElCol :span="11" :tag="'span'" style="color: black; padding: 10px">
        {{ totalData.number_count }}
      </ElCol>
    </ElRow>
  </Dialog>
  <Dialog v-model="noteVisible" title="更新备注">
    <div class="mr-20px">
      <NoteForm ref="noteFormRef" :row="currentRow" />
    </div>
    <template #footer>
      <BaseButton type="primary" :loading="saveLoading" @click="updateNote"> 提交 </BaseButton>
      <BaseButton @click="noteVisible = false">{{ t('dialogDemo.close') }}</BaseButton>
    </template>
  </Dialog>
</template>
