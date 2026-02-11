<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import Search from '@/components/CustomSearch/src/Search.vue'
import { Dialog } from '@/components/Dialog'
import { useI18n } from '@/hooks/web/useI18n'
import { Table, TableColumn } from '@/components/Table'
import { useTable } from '@/hooks/web/useTable'
import { getFundflowApi, exportFundflowApi, getWalletManageList } from '@/api/merchant'
import { ref, unref, reactive, onMounted } from 'vue'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { Breadcrumb } from '@/components/Breadcrumb'
import { useEventBus } from '@/hooks/event/useEventBus'
import { ElMessage, ElMessageBox, ElRow, ElCol } from 'element-plus'
import { formatToDate, todayStart, tomorrowStart } from '@/utils/dateUtil'
import { fundflowTypeOptions } from '@/utils/options'
import { hasPermi } from '@/components/Permission'
// import { getWalletManageList } from '@/api/channelmanagement'

const ids = ref<string[]>([])

const walletTypeOptions = ref<Record<'label' | 'value', string>[]>()

onMounted(() => {
  fetchWalletType()
})

const fetchWalletType = async () => {
  try {
    const res = await getWalletManageList({})

    if (!res?.success) return

    walletTypeOptions.value = Object.values(res.data).map((item: Record<string, string>) => ({
      label: item.name,
      value: item.uuid
    }))
  } catch (error) {
    console.error('Failed to fetch module codes:', error)
  }
}

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getFundflowApi({
      pageIndex: unref(currentPage),
      pageSize: unref(pageSize),
      ...unref(searchParams)
    })
    return {
      list: res.data.list,
      total: res.data.total
    }
  }
})
const { loading, dataList, total, currentPage, pageSize } = tableState
const { getList, getElTableExpose, delList } = tableMethods

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

useEventBus({
  name: 'getList',
  callback: (type: string) => {
    if (type === 'add') {
      currentPage.value = 1
    }
    getList()
  }
})
const { t } = useI18n()

const crudSchemas = reactive<CrudSchema[]>([
  {
    field: 'merchant_name',
    label: t('merchantList.merchantName'),
    search: {
      hidden: true
    }
  },
  {
    field: 'bill_type',
    label: t('merchantList.billType'),
    search: {
      component: 'Select',
      componentProps: {
        placeholder: t('merchantList.billType'),
        options: fundflowTypeOptions
      }
    },
    formatter: (_: any, __: TableColumn, cellValue: string) => {
      const name = fundflowTypeOptions.find((l) => l.value === cellValue)?.label
      return name ?? ''
    }
  },
  {
    field: 'order_id',
    label: t('APILogs.orderNumber'),
    width: 240,
    search: {
      component: 'Input',
      componentProps: {
        placeholder: t('common.inputText')
      }
    }
  },
  {
    field: 'merchant_order_id',
    label: t('merchantList.merchantOrderNumber'),
    width: 240,
    search: {
      component: 'Input',
      componentProps: {
        placeholder: t('APILogs.requestIP')
      }
    }
  },
  {
    field: 'amount',
    label: t('fundflow.transactionAmount'),
    search: {
      component: 'Input',
      componentProps: {
        placeholder: t('analysis.transactionAmount')
      }
    },
    formatter: (_: any, __: TableColumn, cellValue: number) => {
      return cellValue ? Number(cellValue.toFixed(2)).toLocaleString() : 0
    }
  },
  {
    field: 'repay_amount',
    label: t('merchantList.handlingFee'),
    search: {
      hidden: true
    },
    formatter: (_: any, __: TableColumn, cellValue: number) => {
      return cellValue ? Number(cellValue.toFixed(2)).toLocaleString() : 0
    }
  },
  {
    field: 'wallet_type_uuid',
    label: '交易钱包类型',
    search: {
      // component: 'Select',
      // componentProps: {
      //   placeholder: '请选择',
      //   options: walletTypeOptions
      // }
      hidden: true
    },
    colProps: {
      span: 24
    },
    formatter: (_: any, __: TableColumn, cellValue: string) => {
      const name = walletTypeOptions.value?.find((l) => l.value === cellValue)?.label
      return name ?? ''
    }
  },

  {
    field: 'balance_amount',
    label: '当前余额',
    form: {
      hidden: true
    },
    search: { hidden: true },
    formatter: (_: any, __: TableColumn, cellValue: number) => {
      return cellValue ? Number(cellValue.toFixed(2)).toLocaleString() : 0
    }
  },
  {
    field: 'note',
    label: t('userDemo.remark'),
    search: {
      component: 'Input',
      componentProps: {
        placeholder: t('userDemo.remark')
      }
    }
  },
  {
    field: 'create_time',
    label: t('systemManagement.creationTime'),
    search: {
      component: 'DatePicker',
      componentProps: {
        type: 'datetimerange',
        placeholder: t('systemManagement.creationTime'),
        valueFormat: 'YYYY-MM-DD HH:mm:ss'
      }
    },
    form: {
      hidden: true
    }
  }
])

// @ts-ignore
const { allSchemas } = useCrudSchemas(crudSchemas)

const dialogVisible = ref(false)
const dialogTitle = ref('')
const saveLoading = ref(false)

const showExport = async () => {
  const currentValues = await searchRef.value.getFormData()
  processParams(currentValues)
  ElMessageBox.confirm(t('paymentManagement.confirmExportData'), t('common.delWarning'), {
    confirmButtonText: t('common.delOk'),
    cancelButtonText: t('common.delCancel'),
    type: 'warning',
    boxType: 'confirm'
  })
    .then(async () => {
      try {
        saveLoading.value = true
        const res = await exportFundflowApi(searchParams.value)
        ElMessage.success(res?.message)

        // 这里可以调用修改密码的接口
      } catch (error) {
        console.log(error)
      } finally {
        saveLoading.value = false
      }
    })
    .catch(() => {})
}
const currentRow = ref<any | null>(null)
const actionType = ref('')
</script>

<template>
  <div>
    <ContentWrap class="search-section">
      <div class="log-search">
        <!-- <p style="min-width: 50px; padding-top: 8px">{{ t('common.search') }} :</p> -->
        <Search
          ref="searchRef"
          :model="{ create_time: [todayStart, tomorrowStart] }"
          :schema="allSchemas.searchSchema"
          :show-export-data="hasPermi('merFundflowExport')"
          @search="setSearchParams"
          @reset="setSearchParams"
          @export-data="showExport"
        />
      </div>
      <!-- <div class="mb-10px">
      <BaseButton type="primary" @click="AddAction">{{ t('exampleDemo.add') }}</BaseButton>
      <BaseButton :loading="delLoading" type="danger" @click="delData(null)">
        {{ t('exampleDemo.del') }}
      </BaseButton>
    </div> -->
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

    <Dialog v-model="dialogVisible" :title="dialogTitle">
      <Write
        v-if="actionType !== 'detail'"
        ref="writeRef"
        :form-schema="allSchemas.formSchema"
        :current-row="currentRow"
      />

      <Detail
        v-if="actionType === 'detail'"
        :detail-schema="allSchemas.detailSchema"
        :current-row="currentRow"
      />
    </Dialog>
  </div>
</template>
<style lang="css">
/* //search-section */
</style>
