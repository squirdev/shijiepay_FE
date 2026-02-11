<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/CustomSearch'
import { Dialog } from '@/components/Dialog'
import { useI18n } from '@/hooks/web/useI18n'
import { Table, TableColumn } from '@/components/Table'
import { getDeductionListApi, getDeductionListStatisticsApi } from '@/api/merchantmanagement/index'
import { useTable } from '@/hooks/web/useTable'
import { ref, unref, reactive, onMounted } from 'vue'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { Breadcrumb } from '@/components/Breadcrumb'
import { ElMessage, ElMessageBox, ElRow, ElCol } from 'element-plus'
import { useAppStore } from '@/store/modules/app'
import { formatToDate, todayStart, tomorrowStart } from '@/utils/dateUtil'
import { getWalletManageList } from '@/api/channelmanagement'
import { hasPermi } from '@/components/Permission'

const ids = ref<string[]>([])

const walletTypeOptions = ref<Record<'label' | 'value', string>[]>()

onMounted(() => {
  fetchWalletType()
})
const fetchWalletType = async () => {
  try {
    const res = (await getWalletManageList({})) as unknown as Record<string, CountryItem>

    if (!res?.success) return

    walletTypeOptions.value = Object.values(res.data).map((item) => ({
      label: item.name,
      value: item.uuid
    }))
  } catch (error) {
    console.error('Failed to fetch module codes:', error)
  }
}

const { t } = useI18n()
const appStore = useAppStore()
const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getDeductionListApi({
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

const totalData = reactive({
  totalDeductionAmount: 0
})

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

const saveLoading = ref(false)
const getStatistics = async () => {
  const currentValues = await searchRef.value.getFormData()
  processParams(currentValues)
  appStore.pageLoading = true
  try {
    const res = await getDeductionListStatisticsApi(searchParams.value)
    totalData.totalDeductionAmount = res.data.kc_amount_total
    totalDialogVisible.value = true
  } catch (error) {
    console.log(error)
  } finally {
    appStore.pageLoading = false
  }
}

const crudSchemas = reactive<CrudSchema[]>([
  {
    field: 'user_name',
    label: t('formDemo.operator'),
    search: {
      component: 'Input',
      componentProps: {
        placeholder: t('formDemo.operator')
      }
    }
  },
  {
    field: 'merchant_id',
    label: t('merchantList.merchantID'),
    'min-width': 140,
    search: {
      component: 'Input',
      componentProps: {
        placeholder: t('merchantList.merchantID')
      }
    }
  },
  {
    field: 'merchant_name',
    label: t('merchantList.merchantName'),
    'min-width': 120,
    search: {
      component: 'Input',
      componentProps: {
        placeholder: t('merchantList.merchantName')
      }
    }
  },
  {
    field: 'wallet_type_uuid',
    label: '交易钱包类型',
    'min-width': 80,
    search: {
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: walletTypeOptions
      }
    },
    formatter: (_: any, __: TableColumn, cellValue: string) => {
      const name = walletTypeOptions.value?.find((l) => l.value === cellValue)?.label
      return name ?? ''
    }
  },
  {
    field: 'amount',
    label: t('formDemo.deductionamount'),
    search: {
      hidden: true
    },
    formatter: (_: any, __: TableColumn, cellValue: number) => {
      return cellValue ? Number(cellValue.toFixed(2)).toLocaleString() : 0
    }
  },
  {
    field: 'create_time',
    label: t('formDemo.time'),
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
    field: 'note',
    label: t('merchantList.remark'),
    'min-width': 140,
    search: {
      hidden: true
    }
  }
])

// @ts-ignore
const { allSchemas } = useCrudSchemas(crudSchemas)
const totalDialogVisible = ref(false)

const currentRow = ref<null>(null)
const actionType = ref('')
</script>

<template>
  <div>
    <ContentWrap class="search-section">
      <div class="log-search">
        <!-- <p style="min-width: 50px; padding-top: 8px">{{ t('common.search') }} :</p> -->
        <Search
          ref="searchRef"
          :schema="allSchemas.searchSchema"
          :model="{ create_time: [todayStart, tomorrowStart] }"
          :show-order-statistics="hasPermi('reduceMoneyTotal')"
          @search="setSearchParams"
          @reset="setSearchParams"
          @order-statistics="getStatistics"
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

    <Dialog
      v-model="totalDialogVisible"
      :title="t('merchantList.orderDataStatistics')"
      :style="{ maxWidth: '500px' }"
    >
      <ElRow>
        <ElCol :span="13" :tag="'span'" style="text-align: right; padding: 10px">
          {{ t('merchantList.totalDeductionAmount') + ' :' }}
        </ElCol>
        <ElCol :span="11" :tag="'span'" style="color: black; padding: 10px">
          {{ totalData.totalDeductionAmount }}
        </ElCol>
      </ElRow>
    </Dialog>
  </div>
</template>
