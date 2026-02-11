<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/CustomSearch'
import { useI18n } from '@/hooks/web/useI18n'
import { Table } from '@/components/Table'
import { getMerchantLogApi } from '@/api/merchantmanagement/index'
import { useTable } from '@/hooks/web/useTable'
import { ref, unref, reactive } from 'vue'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { formatToDate, todayStart, tomorrowStart } from '@/utils/dateUtil'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

defineOptions({
  name: 'MerchantLog'
})

const { t } = useI18n()

const searchParams = ref({
  create_time: `${todayStart}|${tomorrowStart}`
})

// 检查时间范围是否超过10天
const checkDateRange = (startDate: string, endDate: string): boolean => {
  return dayjs(endDate).diff(dayjs(startDate), 'day') <= 10
}

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getMerchantLogApi({
      pageIndex: unref(currentPage),
      pageSize: unref(pageSize),
      ...unref(searchParams)
    })
    return {
      list: res.data?.list || [],
      total: res.data?.total || 0
    }
  }
})

const { loading, dataList, total, currentPage, pageSize } = tableState
const { getList } = tableMethods

const processParams = (params: any) => {
  if (params.create_time) {
    const [startDate, endDate] = params.create_time
    if (!checkDateRange(startDate, endDate)) {
      ElMessage.error('最高不能超过10天')
      return false
    }
    params.create_time = params.create_time.join('|')
  }
  searchParams.value = params
  return true
}

const setSearchParams = (params: any) => {
  if (processParams(params)) {
    getList()
  }
}

const crudSchemas = reactive<CrudSchema[]>([
  {
    field: 'merchant_account',
    label: '商户账户',
    search: {
      component: 'Input',
      componentProps: {
        placeholder: '请输入商户账户'
      }
    }
  },
  {
    field: 'merchant_id',
    label: '商户ID',
    search: {
      component: 'Input',
      componentProps: {
        placeholder: '请输入商户ID'
      }
    }
  },
  {
    field: 'cz_account',
    label: '操作账户',
    search: {
      component: 'Input',
      componentProps: {
        placeholder: '请输入操作账户'
      }
    }
  },
  {
    field: 'ip',
    label: '操作IP',
    search: {
      component: 'Input',
      componentProps: {
        placeholder: '请输入操作IP'
      }
    }
  },
  {
    field: 'note',
    label: '操作内容',
    'min-width': 200,
    search: {
      component: 'Input',
      componentProps: {
        placeholder: '请输入内容'
      }
    },
    table: {
      showOverflowTooltip: false
    }
  },
  {
    field: 'create_time',
    label: '时间',
    search: {
      component: 'DatePicker',
      componentProps: {
        type: 'datetimerange',
        placeholder: '请选择时间',
        valueFormat: 'YYYY-MM-DD HH:mm:ss'
      }
    }
  }
])

const { allSchemas } = useCrudSchemas(crudSchemas)
</script>

<template>
  <div>
    <ContentWrap class="search-section">
      <div class="log-search">
        <Search
          :schema="allSchemas.searchSchema"
          :model="{ create_time: [todayStart, tomorrowStart] }"
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
