<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/CustomSearch'
import { useI18n } from '@/hooks/web/useI18n'
import { Table, TableColumn } from '@/components/Table'
import { getOrderMonitorApi } from '@/api/systemmonitoring'
import { useTable } from '@/hooks/web/useTable'
import { ref, unref, reactive } from 'vue'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { useEventBus } from '@/hooks/event/useEventBus'
import { formatToDate, todayStart, tomorrowStart } from '@/utils/dateUtil'
import { orderAbnormalTypesOptions, orderTypesOptions } from '@/utils/options'

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getOrderMonitorApi({
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
const { getList } = tableMethods

const currentDate = formatToDate(new Date())
const searchParams = ref({
  create_time: `${todayStart}|${tomorrowStart}`
})
const setSearchParams = (params: any) => {
  if (params.create_time) {
    params.create_time = params.create_time.join('|')
  }
  searchParams.value = params
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
    field: 'order_type',
    label: t('security.orderType'),
    search: {
      component: 'Select',
      componentProps: {
        placeholder: t('security.orderType'),
        options: orderTypesOptions
      }
    },
    table: {
      hidden: true
    }
  },
  {
    field: 'abnormal_type',
    label: t('security.exceptionType'),
    search: {
      component: 'Select',
      componentProps: {
        placeholder: t('security.exceptionType'),
        options: orderAbnormalTypesOptions
      }
    },
    table: {
      hidden: true
    }
  },
  {
    field: 'order_id',
    label: '订单号',
    'min-width': 150,
    search: {
      component: 'Input',
      componentProps: {
        placeholder: t('security.orderID')
      }
    }
  },

  {
    field: 'merchant_order_id',
    label: '商户订单号',
    'min-width': 150,
    search: {
      component: 'Input',
      componentProps: {
        placeholder: t('security.merchantOrderNumber')
      }
    }
  },
  {
    field: 'merchant_id',
    label: t('security.merchantId'),
    search: {
      hidden: true
    }
  },
  {
    field: 'order_type',
    label: t('security.orderType'),
    search: {
      hidden: true
    },
    formatter: (_: any, __: TableColumn, cellValue: string) => {
      const name = orderTypesOptions?.find((l) => l.value === cellValue)?.label
      return name ?? ''
    }
  },
  {
    field: 'abnormal_type',
    label: t('security.exceptionType'),
    search: {
      hidden: true
    },
    formatter: (_: any, __: TableColumn, cellValue: string) => {
      const name = orderAbnormalTypesOptions?.find((l) => l.value === cellValue)?.label
      return name ?? ''
    }
  },

  {
    field: 'create_time',
    label: '创建时间',
    search: {
      component: 'DatePicker',
      componentProps: {
        type: 'datetimerange',
        startPlaceholder: t('security.orderStartTime'),
        endPlaceholder: t('security.orderEndTime'),
        valueFormat: 'YYYY-MM-DD HH:mm:ss'
      }
    }
  },
  {
    field: 'order_time',
    label: '订单时间',
    search: {
      hidden: true
    }
  }
])

// @ts-ignore
const { allSchemas } = useCrudSchemas(crudSchemas)
</script>

<template>
  <div>
    <ContentWrap class="search-section">
      <div class="log-search">
        <!-- <p style="min-width: 50px; padding-top: 8px">{{ t('common.search') }} :</p> -->
        <Search
          :model="{ create_time: [todayStart, tomorrowStart] }"
          :schema="allSchemas.searchSchema"
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
  </div>
</template>
