<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { Search } from '@/components/CustomSearch'
import { Table, TableColumn } from '@/components/Table'
import { threePartyDataApi, tripartiteStatisticsListApi } from '@/api/financialmanagement' // Assuming this will be created
import { onMounted, reactive, ref } from 'vue'
import { Breadcrumb } from '@/components/Breadcrumb'
import { FormSchema } from '@/components/Form/src/types'
import { useEnum } from '@/hooks/web/useEnum'
import { formatToDate } from '@/utils/dateUtil'

defineOptions({
  name: 'TripartiteStatisticsList'
})

const { t } = useI18n()
const loading = ref(false)
const reportList = ref([])

const currentDate = formatToDate(new Date())
const searchParams = ref({
  date: `${currentDate}`
})
const setSearchParams = (params: any) => {
  searchParams.value = params
  getData()
}

const { threePartyOptions } = useEnum()

const getData = async () => {
  try {
    loading.value = true
    const newValues = {
      action: 'getDataTotal',
      ...searchParams.value
    }
    const res = await threePartyDataApi(newValues)
    if (res.data) {
      reportList.value = res.data
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

const schema = reactive<FormSchema[]>([
  {
    label: '选择三方',
    field: 'three_party_uuid',
    component: 'Select',
    componentProps: {
      placeholder: '选择三方',
      options: threePartyOptions
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
    field: 'name',
    label: '三方名称'
  },
  {
    field: 'payment_success_order_amount',
    label: '代付成功订单金额'
  },
  {
    field: 'payment_success_order_count',
    label: '代付成功订单量'
  },
  {
    field: 'payout_order_count',
    label: '代付订单量'
  },
  {
    field: 'payment_order_count',
    label: '代收订单量'
  },
  {
    field: 'payment_success_order_amount',
    label: '代收成功订单金额'
  },
  {
    field: 'payment_success_order_count',
    label: '代收成功订单量'
  },
  {
    field: 'payment_success_rate',
    label: '代收成功率'
  }
])
</script>

<template>
  <div>
    <ContentWrap class="search-section">
      <div>
        <Search
          :schema="schema"
          v-model="searchParams"
          :model="{ dataDate: currentDate }"
          @search="setSearchParams"
          @reset="setSearchParams"
        >
        </Search>
      </div>
    </ContentWrap>
    <ContentWrap>
      <Table :columns="columns" row-key="id" :loading="loading" sortable :data="reportList">
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
