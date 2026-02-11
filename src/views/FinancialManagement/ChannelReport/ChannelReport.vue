<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/CustomSearch'
import { useI18n } from '@/hooks/web/useI18n'
import { Table, TableColumn } from '@/components/Table'

import { useTable } from '@/hooks/web/useTable'
import { reactive, ref, unref } from 'vue'
import { useEventBus } from '@/hooks/event/useEventBus'
import { FormSchema } from '@/components/Form'
import { Breadcrumb } from '@/components/Breadcrumb'
import { formatToDate, todayStart, tomorrowStart } from '@/utils/dateUtil'
import { useEnum } from '@/hooks/web/useEnum'
import { threepartyFormApi } from '@/api/financialmanagement'

defineOptions({
  name: 'ExamplePage'
})
const currentDate = formatToDate(new Date())
const searchParams = ref({
  dataDate: `${currentDate}`
})

const { threePartyOptions } = useEnum()

const setSearchParams = (params: any) => {
  searchParams.value = params
  getList()
}
const { tableRegister, tableState, tableMethods } = useTable({
  immediate: false,
  fetchDataApi: async () => {
    const res = await threepartyFormApi({
      action: 'getData',
      ...unref(searchParams)
    })
    return {
      list: res.data
    }
  }
})
const { loading, total, dataList, currentPage, pageSize } = tableState
const { getList } = tableMethods

const { t } = useI18n()

const schema = reactive<FormSchema[]>([
  {
    label: '选择三方',
    field: 'sf_uuid',
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
    field: 'sf_name',
    label: '三方名称'
  },
  {
    field: 'ds_success_amount',
    label: '代收成功金额'
  },
  {
    field: 'ds_success_count',
    label: '代收成功数量'
  },
  {
    field: 'ds_cb_repay_amount',
    label: '代收成本手续费'
  },
  {
    field: 'ds_repay_amount',
    label: '代收商户手续费'
  },
  {
    field: 'df_success_amount',
    label: '代付成功金额'
  },
  {
    field: 'df_cb_repay_amount',
    label: '代付成本手续费'
  },
  {
    field: 'df_repay_amount',
    label: '代付商户手续费'
  },
  {
    field: 'dfclz_success_amount',
    label: '代付处理中金额'
  },
  {
    field: 'ddfclz_cb_repay_amount',
    label: '代付处理中三方手续费'
  },
  {
    field: 'dfclz_repay_amount',
    label: '代付处理中商户手续费'
  },
  {
    field: 'sf_start_balance',
    label: '三方初始余额'
  },
  {
    field: 'sf_end_balance',
    label: '三方结束余额'
  },
  {
    field: 'wc_amount',
    label: '误差'
  },
  {
    field: 'yl_amount',
    label: '盈利'
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
        />
      </div>
    </ContentWrap>
    <ContentWrap>
      <Table
        :columns="columns"
        row-key="id"
        :loading="loading"
        :data="dataList"
        sortable
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
