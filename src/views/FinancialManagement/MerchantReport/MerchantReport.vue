<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/CustomSearch'
import { useI18n } from '@/hooks/web/useI18n'
import { Table, TableColumn } from '@/components/Table'
import { merchantFormApi } from '@/api/financialmanagement'
import { reactive, ref, unref } from 'vue'
import { FormSchema } from '@/components/Form'
import { formatToDate } from '@/utils/dateUtil'
import type { VNode } from 'vue'
import { hasPermi } from '@/components/Permission'
import { ElMessage, ElMessageBox } from 'element-plus'

defineOptions({
  name: 'ExamplePage'
})

const { t } = useI18n()
const currentDate = formatToDate(new Date())
const yesterday = formatToDate(new Date(Date.now() - 24 * 60 * 60 * 1000))
const searchParams = ref({
  dataDate: `${yesterday}`
})
const taskId = ref()
const currentTimer = ref()
const loading = ref(false)
const reportList = ref([])
const reportSum = ref()
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(30)
const searchRef = ref()
const saveLoading = ref(false)

const createTotalData = async () => {
  // 检查日期是否为当天或超过当前时间
  const selectedDate = unref(searchParams).dataDate
  const today = formatToDate(new Date())
  
  if (selectedDate >= today) {
    ElMessage.error('目前仅支持查看当日之前日期的报表数据')
    return
  }

  try {
    loading.value = true
    const res = await merchantFormApi({
      ...unref(searchParams),
      action: 'createTotalData',
      pageIndex: currentPage.value,
      pageSize: pageSize.value
    })
    taskId.value = res.data?.mkey ?? ''
    total.value = res.data.total
    fetchReportList(res.data?.mkey ?? '')
  } catch (error) {
    console.log(error)
  }
}

const fetchReportList = async (task_id: string) => {
  try {
    const res = await merchantFormApi({
      action: 'getMkeyData',
      task_id
    })

    if (res.data.success) {
      loading.value = false

      clearTimeout(currentTimer.value)
      const { datas, total_data } = res.data
      reportList.value = datas
      reportSum.value = total_data
    } else {
      const timer = setTimeout(() => {
        fetchReportList(taskId.value)
      }, 3000)
      currentTimer.value = timer
      return []
    }
  } catch (error) {
    loading.value = false
    console.log(error)
  }
}

const exportData = async () => {
  const currentValues = await searchRef.value.getFormData()
  
  // 检查日期是否为当天或超过当前时间
  const selectedDate = currentValues.dataDate
  const today = formatToDate(new Date())
  
  if (selectedDate >= today) {
    ElMessage.error('目前仅支持查看当日之前日期的报表数据')
    return
  }

  ElMessageBox.confirm(t('paymentManagement.confirmExportData'), t('common.delWarning'), {
    confirmButtonText: t('common.delOk'),
    cancelButtonText: t('common.delCancel'),
    type: 'warning',
    boxType: 'confirm'
  })
    .then(async () => {
      try {
        saveLoading.value = true
        const res = await merchantFormApi({ merchant: '', action: 'exportData', ...currentValues })

        ElMessage.success(res?.message || '导出成功')
      } catch (error) {
        console.log(error)
      } finally {
        saveLoading.value = false
      }
    })
    .catch(() => {})
}

const setSearchParams = (params: any) => {
  currentPage.value = 1
  searchParams.value = params
  createTotalData()
}

const getSummaries = (param: any) => {
  const { columns } = param
  const sums: (string | VNode)[] = []

  columns.forEach((column: any, index: number) => {
    if (index === 0) {
      sums[index] = <div>合计</div>
      return
    }

    switch (column.property) {
      case 'ds_aomunt_total':
        sums[index] = reportSum.value?.total_dsje ?? 0
        break
      case 'dssxf_aomunt_total':
        sums[index] = reportSum.value?.total_dssxf ?? 0
        break
      case 'df_aomunt_total':
        sums[index] = reportSum.value?.total_sfje ?? 0
        break
      case 'dfsxf_aomunt_total':
        sums[index] = reportSum.value?.total_sfsxf ?? 0
        break

      case 'sdxf_aomunt_total':
        sums[index] = reportSum.value?.total_sdxfje ?? 0
        break
      case 'sdxfsxf_aomunt_total':
        sums[index] = reportSum.value?.total_sdxfjxf ?? 0
        break

      case 'internal_charge_amount':
        sums[index] = reportSum.value?.total_incharge_amount ?? 0
        break
      case 'internal_fee_amount':
        sums[index] = reportSum.value?.total_incharge_fee ?? 0
        break

      case 'dfclz_aomunt_total':
        sums[index] = reportSum.value?.total_sfclzje ?? 0
        break
      case 'dfclzsxf_aomunt_total':
        sums[index] = reportSum.value?.total_sfclzsxf ?? 0
        break

      default:
        break
    }
  })
  return sums
}

const schema = reactive<FormSchema[]>([
  {
    field: 'merchant',
    label: t('formDemo.search'),
    component: 'Input',
    componentProps: {
      placeholder: t('formDemo.merchantnameormerchantid') // Set the placeholder text
    }
  },
  {
    field: 'dataDate',
    label: t('formDemo.datePlaceholder'),
    component: 'DatePicker',
    componentProps: {
      type: 'date',
      valueFormat: 'YYYY-MM-DD',
      placeholder: t('formDemo.datePlaceholder')
    }
  }
])

const columns = reactive<TableColumn[]>([
  {
    field: 'merchant_id',
    label: t('formDemo.merchantid')
  },
  {
    field: 'merchant_name',
    label: t('formDemo.merchantname')
  },
  {
    field: 'ds_aomunt_total',
    label: t('formDemo.collectionamount')
  },
  {
    field: 'dssxf_aomunt_total',
    label: t('formDemo.collectionfee')
  },
  {
    field: 'df_aomunt_total',
    label: t('formDemo.paymentamount')
  },
  {
    field: 'dfsxf_aomunt_total',
    label: t('formDemo.paymentofhandlingfee')
  },
  {
    field: 'dfclz_aomunt_total',
    label: '代付处理中金额'
  },
  {
    field: 'dfclzsxf_aomunt_total',
    label: '代付处理中手续费'
  },
  {
    field: 'sdxf_aomunt_total',
    label: '下发金额'
  },
  {
    field: 'sdxfsxf_aomunt_total',
    label: '下发手续费'
  },
  {
    field: 'internal_charge_amount',
    label: '内充金额'
  },
  {
    field: 'internal_fee_amount',
    label: '内充手续费'
  },
  {
    field: 'start_balance_amount',
    label: t('formDemo.startingmerchantbalance')
  },
  {
    field: 'end_balance_amount',
    label: t('formDemo.endingmerchantbalance')
  },
  {
    field: 'wc_vv',
    label: t('formDemo.errorvalue')
  }
])

const onPageChange = (page: number) => {
  currentPage.value = page
  createTotalData()
}

const onPageSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1 // 通常切换条数要回第一页
  createTotalData()
}
</script>

<template>
  <div>
    <ContentWrap class="search-section">
      <div>
        <Search
          ref="searchRef"
          :model="{ dataDate: `${yesterday}` }"
          :schema="schema"
          v-model="searchParams"
          @search="setSearchParams"
          @reset="setSearchParams"
        >
          <template #moreBtn>
            <BaseButton
              v-if="hasPermi('merchantFormExportData')"
              type="warning"
              :loading="saveLoading"
              @click="exportData"
              >下载当前数据</BaseButton
            >
          </template>
        </Search>
      </div>
    </ContentWrap>
    <ContentWrap>
      <Table
        :columns="columns"
        row-key="id"
        :loading="loading"
        sortable
        show-summary
        :summary-method="getSummaries"
        :data="reportList"
        :pagination="{
          total: total,
          pageSize: pageSize,
          currentPage: currentPage,
          pageSizes: [30, 50, 100, 200, 500]
        }"
        v-model:currentPage="currentPage"
        v-model:pageSize="pageSize"
        @update:currentPage="onPageChange"
        @update:pageSize="onPageSizeChange"
      >
        <template #empty>
          <div style="text-align: center; padding: 40px; color: #999">
            <img src="@/assets/imgs/no_data.png" style="width: 120px" />
            <p style="line-height: 30px">{{ t('common.noData') }}</p>
          </div>
        </template>
      </Table>
    </ContentWrap>
  </div>
</template>

<style>
.list-of-roles {
  min-width: auto !important;
}

.el-form-item:has(.list-of-roles) {
  margin-right: 0.5rem !important;
}
</style>
