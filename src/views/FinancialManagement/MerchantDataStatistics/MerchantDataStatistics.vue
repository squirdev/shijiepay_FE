<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/CustomSearch'
import { useI18n } from '@/hooks/web/useI18n'
import { Table, TableColumn } from '@/components/Table'
import { merchantDataStatisticsApi } from '@/api/financialmanagement' // Assuming this will be created
import { onMounted, reactive, ref, unref } from 'vue'
import { FormSchema } from '@/components/Form'
import { formatToDate } from '@/utils/dateUtil'

defineOptions({
  name: 'MerchantDataStatistics'
})

const { t } = useI18n()
const loading = ref(false)
const reportList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(30)

const currentDate = formatToDate(new Date())
const searchParams = ref({
  dataDate: `${currentDate}`
})

const setSearchParams = (params: any) => {
  searchParams.value = params
  currentPage.value = 1
  searchParams.value.action = 'getDataTotal'
  getData({ action: 'getDataTotal' })
}

const getData = async (newValues?: any) => {
  try {
    loading.value = true
    const res = await merchantDataStatisticsApi({
      pageIndex: currentPage.value,
      pageSize: pageSize.value,
      ...searchParams.value,
      ...newValues
    })
    if (res.data) {
      reportList.value = res.data.result_data
      total.value = res.data.total
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

const schema = reactive<FormSchema[]>([
  {
    field: 'merchant_id',
    label: '商户ID',
    component: 'Input',
    componentProps: {
      placeholder: '请输入商户ID'
    }
  },
  {
    field: 'merchant_name',
    label: '商户名称',
    component: 'Input',
    componentProps: {
      placeholder: '请输入商户名称'
    }
  },
  {
    field: 'dataDate',
    label: '日期',
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
    label: '商户ID'
  },
  {
    field: 'merchant_name',
    label: '商户名称'
  },

  {
    field: 'payout_success_order_amount',
    label: '代付成功订单金额'
  },
  {
    field: 'payout_success_order_count',
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

const onPageChange = (page: number) => {
  currentPage.value = page
  getData()
}

const onPageSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1 // 通常切换条数要回第一页
  getData()
}
const coustomSearch = (params) => {
  currentPage.value = 1
  searchParams.value.action = params.action
  getData(params)
}
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
          <template #moreBtn>
            <BaseButton
              type="warning"
              @click="coustomSearch({ ...searchParams, action: 'dataTotal5', dataDate: undefined })"
              >5分钟数据</BaseButton
            >
            <BaseButton
              type="warning"
              @click="
                coustomSearch({ ...searchParams, action: 'dataTotal30', dataDate: undefined })
              "
              >30分钟数据</BaseButton
            >
            <BaseButton
              type="warning"
              @click="
                coustomSearch({ ...searchParams, action: 'dataTotal60', dataDate: undefined })
              "
              >1小时数据</BaseButton
            >
            <!-- <BaseButton type="warning">下载当前数据</BaseButton> -->
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
