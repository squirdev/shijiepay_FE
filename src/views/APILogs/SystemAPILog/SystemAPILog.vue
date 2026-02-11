<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/CustomSearch'
import { useI18n } from '@/hooks/web/useI18n'
import { Table, TableColumn } from '@/components/Table'
import { getSystemAPILogs } from '@/api/apilogs'
import { useTable } from '@/hooks/web/useTable'
import { ref, unref, reactive } from 'vue'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { Breadcrumb } from '@/components/Breadcrumb'
import { useEventBus } from '@/hooks/event/useEventBus'
import { formatToDate, todayStart, tomorrowStart } from '@/utils/dateUtil'
import qs from 'qs'

const order_id = qs.parse(location.search.slice(1))?.order_id ?? ''

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getSystemAPILogs({
      pageIndex: unref(currentPage),
      pageSize: unref(pageSize),
      ...unref(searchParams)
    })
    console.log(res)
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
  create_time: `${todayStart}|${tomorrowStart}`,
  request_data: order_id
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
    field: 'ip',
    label: t('APILogs.requestIP') /* 请求IP */,
    search: {
      component: 'Input',
      label: t('APILogs.requestIP') /* 请求IP */,
      componentProps: {
        placeholder: t('APILogs.requestIP') /* 请求IP */
      }
    },
    form: {
      component: 'Input',
      colProps: {
        span: 24
      }
    },
    detail: {
      span: 24
    }
  },
  {
    field: 'request_method',
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
    field: 'url_path',
    label: t('APILogs.requestAddress') /* 请求地址 */,
    'min-width': 160,
    search: {
      hidden: true
    }
  },
  {
    field: 'request_data',
    label: t('APILogs.requestContent') /* 请求内容 */,
    'min-width': 160,
    search: {
      component: 'Input',
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
    field: 'response_text',
    label: t('APILogs.responseData') /* 响应内容 */,
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
        type: 'datetimerange'
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
      <Search
        :model="{
          create_time: [todayStart, tomorrowStart],
          request_data: order_id
        }"
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
