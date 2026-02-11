<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/CustomSearch'
import { useI18n } from '@/hooks/web/useI18n'
import { Table, TableColumn } from '@/components/Table'
import { getCallbackRecordApi } from '@/api/collectionmanagement'
import { useTable } from '@/hooks/web/useTable'
import { ref, unref, reactive } from 'vue'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { formatToDate, todayStart, tomorrowStart } from '@/utils/dateUtil'
import { ElTag } from 'element-plus'
import qs from 'qs'

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getCallbackRecordApi({
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
  if (params.create_time) {
    params.create_time = params.create_time.join('|')
  }
  searchParams.value = params
  getList()
}

const { t } = useI18n()

const crudSchemas = reactive<CrudSchema[]>([
  {
    field: 'order_id',
    label: t('collectionManagement.orderID'),
    width: 240,
    search: {
      component: 'Input',
      componentProps: {
        placeholder: t('collectionManagement.orderID')
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
    field: 'merchant_name',
    label: t('collectionManagement.merchantName'),
    search: {
      hidden: true
    }
  },
  {
    field: 'merchant_order_id',
    label: t('collectionManagement.merchantOrderID'),
    width: 240,
    search: {
      hidden: true
    }
  },
  {
    field: 'callback_url',
    label: t('collectionManagement.callbackAddress'),
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
    label: t('collectionManagement.callbackContent'),
    'min-width': 200,
    search: {
      hidden: true
    },
    table: {
      'show-overflow-tooltip': false,
      slots: {
        default: (data: any) => {
          const { request_text } = data.row
          // const str = request_text?.replace(/\\/g, "")
          return request_text ?? ''
        }
      }
    }
  },
  {
    field: 'statu',
    label: t('collectionManagement.callbackStatus'),
    'min-width': 80,
    search: {
      component: 'Select',
      componentProps: {
        placeholder: t('collectionManagement.callbackStatus'),
        options: [
          {
            label: '成功',
            value: true
          },
          {
            label: '失败',
            value: false
          }
        ]
      }
    },
    table: {
      slots: {
        default: (data: any) => {
          const { statu } = data.row

          if (statu) {
            return <ElTag type="success">成功</ElTag>
          } else {
            return <ElTag type="danger">失败</ElTag>
          }
        }
      }
    }
  },
  {
    field: 'response_code',
    label: t('collectionManagement.responseCode'),
    'min-width': 80,
    search: {
      hidden: true
    }
  },
  {
    field: 'response_text',
    label: t('collectionManagement.responseContent'),
    search: {
      hidden: true
    }
  },
  {
    field: 'create_time',
    label: t('collectionManagement.time'),
    'min-width': 120,
    search: {
      component: 'DatePicker',
      componentProps: {
        type: 'datetimerange',
        placeholder: t('collectionManagement.time'),
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
    label: t('collectionManagement.remark'),
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
          :model="{
          create_time: create_time
            ? (create_time as unknown as string).split('|')
            : [todayStart, tomorrowStart], order_id
        }"
          :schema="allSchemas.searchSchema"
          @search="setSearchParams"
          @reset="setSearchParams"
        />
      </div>
    </ContentWrap>
    <ContentWrap :style="{ minHeight: '700px' }">
      <!-- <div class="mb-10px">
      <BaseButton type="primary" @click="AddAction">{{ t('exampleDemo.add') }}</BaseButton>
      <BaseButton :loading="delLoading" type="danger" @click="delData(null)">
        {{ t('exampleDemo.del') }}
      </BaseButton>
    </div> -->

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
<style lang="css">
/* //search-section */
</style>
