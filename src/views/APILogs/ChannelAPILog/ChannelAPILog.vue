<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/CustomSearch'
import { useI18n } from '@/hooks/web/useI18n'
import { Table, TableColumn } from '@/components/Table'
import { getChannelAPILogs } from '@/api/apilogs'
import { useTable } from '@/hooks/web/useTable'
import { ref, unref, reactive } from 'vue'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { Breadcrumb } from '@/components/Breadcrumb'
import { useEventBus } from '@/hooks/event/useEventBus'
import { formatToDate, todayStart, tomorrowStart } from '@/utils/dateUtil'

const { t } = useI18n()
const ids = ref<string[]>([])

const apiTypeOptions = [
  { label: t('APILogs.collection') /* 代收 */, value: 'payment' },
  { label: t('APILogs.payment') /* 代付 */, value: 'payout' },
  { label: t('APILogs.paymentCheckOrder') /* 代收查单 */, value: 'payment_check_order' },
  { label: t('APILogs.payoutCheckOrder') /* 代付查单 */, value: 'payout_check_order' },
  { label: t('APILogs.getBalance') /* 余额查询 */, value: 'get_balance' }
]

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getChannelAPILogs({
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

const crudSchemas = reactive<CrudSchema[]>([
  {
    field: 'three_party_name',
    label: t('APILogs.upstreamName') /* 上游名称 */
  },
  {
    field: 'request_type',
    label: t('APILogs.requestMode') /* 请求模式 */,
    search: {
      component: 'Select',
      label: t('APILogs.requestMode') /* 请求模式 */,
      componentProps: {
        placeholder: t('APILogs.requestMode') /* 请求模式 */,
        options: [
          { label: t('APILogs.get') /* GET */, value: 'get' },
          { label: t('APILogs.post') /* POST */, value: 'post' }
        ]
      }
    }
  },
  {
    field: 'api_type',
    label: t('APILogs.apiType') /* 接口类型 */,
    search: {
      component: 'Select',
      componentProps: {
        placeholder: t('APILogs.pleaseSelectApiType') /* 请选择接口类型 */,
        options: apiTypeOptions
      }
    },
    formatter: (_: any, __: TableColumn, cellValue: string) => {
      const name = apiTypeOptions.find((l) => l.value === cellValue)?.label
      return name ?? ''
    }
  },
  {
    field: 'request_url',
    label: t('APILogs.requestAddress') /* 请求地址 */,
    search: {
      hidden: true
    }
  },
  {
    field: 'OurOrderNumber',
    label: t('APILogs.ourOrderNumber') /* 我方订单号 */,
    search: {
      hidden: true
    },
    table: { hidden: true }
  },
  {
    field: 'request_data',
    label: t('APILogs.requestContent') /* 请求内容 */,
    search: {
      component: 'Input',
      label: t('APILogs.requestContent') /* 请求内容 */,
      componentProps: {
        placeholder: t('APILogs.requestContent') /* 请求内容 */
      }
    },
    table: {
      'show-overflow-tooltip': false
    }
  },
  {
    field: 'response_code',
    label: t('APILogs.responseCode') /* 响应码 */,
    search: {
      hidden: true
    }
  },
  {
    field: 'response_data',
    label: t('APILogs.responseData') /* 响应内容 */,
    search: {
      hidden: true
    },
    table: {
      'show-overflow-tooltip': false
    }
  },
  {
    field: 'error_text',
    label: t('APILogs.errorMessage') /* 错误信息 */,
    search: {
      hidden: true
    }
  },
  {
    field: 'create_time',
    label: t('APILogs.requestTime') /* 请求时间 */,
    search: {
      component: 'DatePicker',
      componentProps: {
        type: 'datetimerange',
        placeholder: t('APILogs.requestTime') /* 请求时间 */,
        valueFormat: 'YYYY-MM-DD HH:mm:ss'
      }
    },
    form: {
      component: 'DatePicker',
      componentProps: {
        type: 'datetimerange',
        defaultValue: [todayStart, tomorrowStart]
        // valueFormat: 'YYYY-MM-DD HH:mm:ss'
      }
    }
  }
])

// @ts-ignore
const { allSchemas } = useCrudSchemas(crudSchemas)
</script>

<template>
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
</template>
<style lang="css">
/* //search-section */
</style>
