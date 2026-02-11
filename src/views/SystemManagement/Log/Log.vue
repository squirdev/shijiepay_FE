<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/Search'
import { useI18n } from '@/hooks/web/useI18n'
import { Table, TableColumn } from '@/components/Table'
import { getOperationLogApi } from '@/api/systemmanagement'
import { useTable } from '@/hooks/web/useTable'
import { ref, unref, reactive } from 'vue'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { Breadcrumb } from '@/components/Breadcrumb'
import { useEventBus } from '@/hooks/event/useEventBus'
import { formatToDate, todayStart, tomorrowStart } from '@/utils/dateUtil'

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getOperationLogApi({
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
    field: 'operator_name',
    label: t('tableDemo.operator') /* 操作人 */,
    search: {
      component: 'Input',
      label: t('tableDemo.operator') /* 操作人 */,
      componentProps: {
        placeholder: t('tableDemo.operator') /* 操作人 */
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
    field: 'create_time',
    label: t('tableDemo.date') /* 日期 */,
    search: {
      component: 'DatePicker',
      componentProps: {
        type: 'datetimerange',
        placeholder: t('tableDemo.date') /* 日期 */,
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
    field: 'state_code',
    label: t('tableDemo.statusCode') /* 状态码 */,
    search: {
      hidden: true
    }
  },
  {
    field: 'ip',
    label: t('tableDemo.requestIP') /* 请求IP */,
    search: {
      component: 'Input',
      componentProps: {
        placeholder: t('common.ipInput') /* IP */
      }
    }
  },
  {
    field: 'method',
    label: t('tableDemo.requestMethod') /* 请求方法 */,
    search: {
      hidden: true
    },
    form: {
      component: 'InputNumber',
      value: 0
    }
  },
  {
    field: 'url_path',
    label: t('tableDemo.requestPath') /* 请求路径 */,
    'min-width': 160,
    search: {
      component: 'Input',
      componentProps: {
        placeholder: t('common.requestPathInput') /* 请求路径 */
      }
    },
    table: {
      show: false
    },
    form: {
      component: 'Editor',
      colProps: {
        span: 24
      }
    },
    detail: {
      span: 24,
      slots: {
        default: (data: any) => {
          return <div innerHTML={data.content}></div>
        }
      }
    }
  },
  {
    field: 'note',
    label: t('tableDemo.illustrate') /* 说明 */,
    search: {
      component: 'Input',
      componentProps: {
        placeholder: t('common.illustrateInput') /* 说明 */
      }
    },
    table: {
      show: false
    },
    form: {
      component: 'Editor',
      colProps: {
        span: 24
      }
    },
    detail: {
      span: 24,
      slots: {
        default: (data: any) => {
          return <div innerHTML={data.content}></div>
        }
      }
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
