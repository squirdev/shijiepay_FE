<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import Search from '@/components/CustomSearch/src/Search.vue'
import { Dialog } from '@/components/Dialog'
import { useI18n } from '@/hooks/web/useI18n'
import { Table, TableColumn } from '@/components/Table'
import { getReportApi } from '@/api/merchant'
import { useTable } from '@/hooks/web/useTable'
import { ref, unref, reactive } from 'vue'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { Breadcrumb } from '@/components/Breadcrumb'
import { useEventBus } from '@/hooks/event/useEventBus'
import { formatToDate } from '@/utils/dateUtil'
import { ElMessage } from 'element-plus'

const ids = ref<string[]>([])

const { tableRegister, tableState, tableMethods } = useTable({
   immediate: false,
  fetchDataApi: async () => {
    // 检查日期是否为当天或超过当前时间
    const selectedDate = unref(searchParams).date
    const today = formatToDate(new Date())
    
    if (selectedDate >= today) {
      ElMessage.error('目前仅支持查看当日之前日期的报表数据')
      return { list: [] }
    }

    const res = await getReportApi({
      action: 'getFormTotalData',
      ...unref(searchParams)
    })
    return {
      list: [res.data]
    }
  }
})
const { loading, dataList, total, currentPage, pageSize } = tableState
const { getList, getElTableExpose, delList } = tableMethods

const currentDate = formatToDate(new Date())
const yesterday = formatToDate(new Date(Date.now() - 24 * 60 * 60 * 1000))
const searchParams = ref({
  date: `${yesterday}`
})
const setSearchParams = (params: any) => {
  searchParams.value = params
  getList()
}

// useEventBus({
//   name: 'getList',
//   callback: (type: string) => {
//     if (type === 'add') {
//       currentPage.value = 1
//     }
//     getList()
//   }
// })
const { t } = useI18n()
const crudSchemas = reactive<CrudSchema[]>([
  {
    field: 'merchant_id',
    label: t('merchantList.merchantID'),
    search: {
      hidden: true
    }
  },
  {
    field: 'merchant_name',
    label: t('merchantList.merchantName'),
    search: {
      hidden: true
    }
  },
  {
    field: 'ds_aomunt_total',
    label: t('formDemo.collectionamount'),
    search: {
      hidden: true
    }
  },
  {
    field: 'dssxf_aomunt_total',
    label: t('formDemo.collectionfee'),
    search: {
      hidden: true
    }
  },
  {
    field: 'df_aomunt_total',
    label: t('formDemo.paymentamount'),
    search: {
      hidden: true
    }
  },
  {
    field: 'dfsxf_aomunt_total',
    label: t('formDemo.paymentofhandlingfee'),
    search: {
      hidden: true
    }
  },
  {
    field: 'sdxf_aomunt_total',
    label: t('formDemo.manualdelivery'),
    search: {
      hidden: true
    }
  },
  {
    field: 'sdxfsxf_aomunt_total',
    label: t('formDemo.manuallyissuehandlingfees'),
    search: {
      hidden: true
    }
  },
  {
    field: 'internal_charge_amount',
    label: t('formDemo.internalfeeamount'),
    search: {
      hidden: true
    }
  },
  {
    field: 'internal_fee_amount',
    label: t('formDemo.internalcharges'),
    search: {
      hidden: true
    }
  },
  {
    field: 'start_balance_amount',
    label: t('formDemo.startingmerchantbalance'),
    search: {
      hidden: true
    }
  },
  {
    field: 'end_balance_amount',
    label: t('formDemo.endingmerchantbalance'),
    search: {
      hidden: true
    }
  },
  {
    field: 'wc_vv',
    label: t('formDemo.errorvalue'),
    search: {
      hidden: true
    }
  },
  {
    field: 'date',
    label: t('formDemo.time'),
    search: {
      component: 'DatePicker',
      componentProps: {
        type: 'date',
        valueFormat: 'YYYY-MM-DD',
        placeholder: t('formDemo.datePlaceholder')
      }
    },
    table: { hidden: true }
  }
])

// @ts-expect-error useCrudSchemas is deprecated but still used here
const { allSchemas } = useCrudSchemas(crudSchemas)

const dialogVisible = ref(false)
const dialogTitle = ref('')

const currentRow = ref<null>(null)
const actionType = ref('')
</script>

<template>
  <div>
    <ContentWrap class="search-section">
      <div class="log-search">
        <!-- <p style="min-width: 50px; padding-top: 8px">{{ t('common.search') }} :</p> -->
        <Search
          :model="{ date: `${yesterday}` }"
          :schema="allSchemas.searchSchema"
          @search="setSearchParams"
          @reset="setSearchParams"
        />
      </div>
    </ContentWrap>
    <ContentWrap :style="{ minHeight: '700px' }">
      <Table
        :columns="allSchemas.tableColumns"
        :data="dataList"
        :loading="loading"
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
