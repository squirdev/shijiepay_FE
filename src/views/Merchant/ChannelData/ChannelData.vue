<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import Search from '@/components/CustomSearch/src/Search.vue'
import { Dialog } from '@/components/Dialog'
import { useI18n } from '@/hooks/web/useI18n'
import { Table, TableColumn } from '@/components/Table'
import { channelDataApi } from '@/api/merchant'
import { useTable } from '@/hooks/web/useTable'
import { ref, unref, reactive } from 'vue'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { Breadcrumb } from '@/components/Breadcrumb'
import { useEventBus } from '@/hooks/event/useEventBus'
import { formatToDate, todayStart, tomorrowStart } from '@/utils/dateUtil'
import { ElProgress, ElTag } from 'element-plus'

const ids = ref<string[]>([])
const { t } = useI18n()

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const res = await channelDataApi({
      action: 'getChannelData',
      ...unref(searchParams)
    })
    return {
      list: res.data,
      total: res.data.total
    }
  }
})
const { loading, dataList, total, currentPage, pageSize } = tableState
const { getList, getElTableExpose, delList } = tableMethods

const currentDate = formatToDate(new Date())
const searchParams = ref({
  date: `${currentDate}|${currentDate}`
})
const setSearchParams = (params: any) => {
  if (params.date) {
    params.date = params.date.join('|')
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
    field: 'tunnel_name',
    label: '通道名称',
    search: {
      hidden: true
    }
  },
  {
    field: 'code',
    label: '通道编码',
    search: {
      hidden: true
    }
  },

  {
    field: 'order_count',
    label: ' 订单量',
    search: {
      hidden: true
    },
    formatter: (_: any, __: TableColumn, cellValue: number) => {
      return cellValue ? Number(cellValue.toFixed(2)).toLocaleString() : 0
    }
  },
  {
    field: 'pay_success_count',
    label: '支付成功订单量',
    search: {
      hidden: true
    }
  },

  {
    field: 'success_rate',
    label: '成功率',
    search: {
      hidden: true
    },
    table: {
      slots: {
        default: (data: any) => {
          const success_rate = data.row.success_rate
          return (
            <div>
              <ElProgress percentage={success_rate ?? 0} color="#67c23a" />
            </div>
          )
        }
      }
    }
  },
  {
    field: 'date',
    label: '选择日期',
    search: {
      component: 'DatePicker',
      componentProps: {
        type: 'daterange',
        placeholder: '请选择',
        valueFormat: 'YYYY-MM-DD'
      }
    },
    form: {
      hidden: true
    },
    table: {
      hidden: true
    }
  }
])

// @ts-ignore
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
          :model="{ date: [`${currentDate}`, `${currentDate}`] }"
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
  </div>
</template>
