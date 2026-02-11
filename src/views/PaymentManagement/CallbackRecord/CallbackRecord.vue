<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/CustomSearch'
import { useI18n } from '@/hooks/web/useI18n'
import { Table } from '@/components/Table'
import { getPayCallbackApi } from '@/api/paymentmanagement'
import { useTable } from '@/hooks/web/useTable'
import { ref, unref, reactive } from 'vue'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { useEventBus } from '@/hooks/event/useEventBus'
import { formatToDate, todayStart, tomorrowStart } from '@/utils/dateUtil'
import { ElTag } from 'element-plus'
import qs from 'qs'

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getPayCallbackApi({
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

const { order_id, create_time } = qs.parse(location.search.slice(1)) ?? {}

const currentDate = formatToDate(new Date())
const searchParams = ref({
  create_time: create_time ?? `${todayStart}|${tomorrowStart}`,
  order_id
})

const setSearchParams = (params: any) => {
  const newParams = { ...params }
  if (newParams.create_time) {
    newParams.create_time = newParams.create_time.join('|')
  }
  searchParams.value = newParams
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
    field: 'order_id',
    label: t('paymentManagement.orderID') /* 订单ID */,
    width: 240,
    search: {
      component: 'Input',
      componentProps: {
        placeholder: t('paymentManagement.orderID') /* 订单ID */
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
    field: 'merchant_uuid',
    label: t('paymentManagement.merchantName') /* 商户名称 */,
    width: 240,
    search: {
      hidden: true
    }
  },
  {
    field: 'merchant_order_id',
    label: t('paymentManagement.merchantOrderID') /* 商户订单ID */,
    width: 240,
    search: {
      hidden: true
    }
  },
  {
    field: 'callback_url',
    label: t('paymentManagement.callbackAddress') /* 回调地址 */,
    'min-width': 160,
    search: {
      hidden: true
    },
    table: {
      'show-overflow-tooltip': false
    }
  },
  {
    field: 'request_text',
    label: t('paymentManagement.callbackContent') /* 回调内容 */,
    'min-width': 200,
    search: {
      component: 'Input',
      componentProps: {
        placeholder: t('common.inputText') /* 请输入 */
      }
    },
    table: {
      'show-overflow-tooltip': false,
      slots: {
        default: (data: any) => {
          const { request_text } = data.row ?? {}
          if (typeof request_text === 'object') {
            return JSON.stringify(request_text)
          }
          return request_text
        }
      }
    }
  },

  {
    field: 'statu',
    label: t('paymentManagement.callbackStatus') /* 回调状态 */,
    'min-width': 80,
    search: {
      component: 'Select',
      componentProps: {
        placeholder: t('paymentManagement.callbackStatus') /* 回调状态 */,
        options: [
          {
            label: t('paymentManagement.success') /* 成功 */,
            value: true
          },
          {
            label: t('paymentManagement.failed') /* 失败 */,
            value: false
          }
        ]
      }
    },
    table: {
      slots: {
        default: (data: any) => {
          const { statu } = data?.row ?? {}

          if (statu) {
            return <ElTag type="success">{t('paymentManagement.success') /* 成功 */}</ElTag>
          } else {
            return <ElTag type="danger">{t('paymentManagement.failed') /* 失败 */}</ElTag>
          }
        }
      }
    }
  },
  {
    field: 'response_code',
    label: t('paymentManagement.responseCode') /* 响应CODE */,
    'min-width': 80,
    search: {
      hidden: true
    }
  },
  {
    field: 'response_text',
    label: t('paymentManagement.responseContent') /* 响应内容 */,
    search: {
      hidden: true
    }
  },
  {
    field: 'create_time',
    label: t('paymentManagement.time') /* 时间 */,
    'min-width': 120,
    search: {
      component: 'DatePicker',
      componentProps: {
        type: 'datetimerange',
        placeholder: t('paymentManagement.time') /* 时间 */,
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
  },
  {
    field: 'note',
    label: t('paymentManagement.remark') /* 备注 */,
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
        <Search
          :model="{
          create_time: create_time
            ? (create_time as unknown as string).split('|')
            : [todayStart, tomorrowStart],
          order_id
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
  </div>
</template>
