<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/CustomSearch'
import { useI18n } from '@/hooks/web/useI18n'
import { Table, TableColumn } from '@/components/Table'
import { exportMerchantFundflowApi, getMerchantFundflowApi } from '@/api/merchantmanagement'
import { useTable } from '@/hooks/web/useTable'
import { ref, unref, reactive } from 'vue'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { useRoute } from 'vue-router'
import { fundflowTypeOptions } from '@/utils/options'
import { formatToDate, todayStart, tomorrowStart } from '@/utils/dateUtil'
import { Download } from '@element-plus/icons-vue'
import { useAppStore } from '@/store/modules/app'
import { ElMessage, ElMessageBox } from 'element-plus'
import { hasPermi } from '@/components/Permission'

const appStore = useAppStore()
const route = useRoute()
const searchRef = ref()
const walletTypeOptions = ref<Record<'label' | 'value', string>[]>()

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getMerchantFundflowApi(route.params.muid, {
      pageIndex: unref(currentPage),
      pageSize: unref(pageSize),
      ...unref(searchParams)
    })

    walletTypeOptions.value =
      res.data?.wt_datas?.map((item: Record<string, string>) => ({
        label: item.name,
        value: item.uuid
      })) ?? []

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

const processParams = (params) => {
  if (params.create_time) {
    params.create_time = params.create_time.join('|')
  }
  searchParams.value = params
}
const setSearchParams = (params: any) => {
  processParams(params)
  getList()
}

const { t } = useI18n()

const crudSchemas = reactive<CrudSchema[]>([
  {
    field: 'merchant_id',
    label: t('merchantList.merchantID'),
    search: {
      hidden: true
    },
    detail: {
      span: 24
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
    field: 'selectSearchType',
    label: '选择搜索类型',
    width: 240,
    search: {
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: [
          { label: '系统单号', value: 'order_id' },
          { label: '商户单号', value: 'merchant_order_id' },
          { label: '三方单号', value: 'channel_order_id' },
          { label: t('merchantList.amount'), value: 'amount' },
          { label: t('merchantList.remark'), value: 'note' }
        ]
      }
    },
    form: {
      hidden: true
    },
    detail: {
      span: 24
    },
    table: {
      hidden: true
    }
  },
  {
    field: 'SearchContent',
    label: '搜索内容',
    width: 240,
    search: {
      component: 'Input',
      componentProps: {
        placeholder: '请输入'
      }
    },
    form: {
      hidden: true
    },
    detail: {
      span: 24
    },
    table: {
      hidden: true
    }
  },
  {
    field: 'order_id',
    label: t('merchantList.orderNumber'),
    search: {
      hidden: true
      // component: 'Input',
      // componentProps: {
      //   placeholder: t('merchantList.orderNumber')
      // }
    }
  },
  {
    field: 'merchant_order_id',
    label: t('merchantList.merchantOrderNumber'),
    search: {
      hidden: true
    }
  },
  {
    field: 'bill_type',
    label: t('merchantList.billType'),
    search: {
      component: 'Select',
      componentProps: {
        placeholder: t('merchantList.billType'),
        options: fundflowTypeOptions
      }
    },
    formatter: (_: any, __: TableColumn, cellValue: string) => {
      const name = fundflowTypeOptions.find((l) => l.value === cellValue)?.label
      return name ?? ''
    }
  },
  {
    field: 'wallet_type_uuid',
    label: '交易钱包类型',
    search: {
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: walletTypeOptions
      }
    },
    formatter: (_: any, __: TableColumn, cellValue: string) => {
      const name = walletTypeOptions.value?.find((l) => l.value === cellValue)?.label
      return name ?? ''
    }
  },
  {
    field: 'amount',
    label: t('merchantList.amount'),
    search: {
      hidden: true
      // component: 'Input',
      // componentProps: {
      //   placeholder: t('merchantList.amount')
      // }
    },
    formatter: (_: any, __: TableColumn, cellValue: number) => {
      return cellValue ? Number(cellValue.toFixed(2)).toLocaleString() : 0
    }
  },
  {
    field: 'repay_amount',
    label: t('merchantList.handlingFee'),
    search: {
      hidden: true
    },
    formatter: (_: any, __: TableColumn, cellValue: number) => {
      return cellValue ? Number(cellValue.toFixed(2)).toLocaleString() : 0
    }
  },
  {
    field: 'balance_amount',
    label: '当前余额',
    form: {
      hidden: true
    },
    search: { hidden: true },
    formatter: (_: any, __: TableColumn, cellValue: number) => {
      return cellValue ? Number(cellValue.toFixed(2)).toLocaleString() : 0
    }
  },
  {
    field: 'note',
    label: t('merchantList.remark'),
    search: {
      hidden: true
      // component: 'Input',
      // componentProps: {
      //   placeholder: t('merchantList.remark')
      // }
    },
    table: {
      show: false
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
    field: 'create_time',
    label: '交易时间',
    search: {
      component: 'DatePicker',
      componentProps: {
        type: 'datetimerange',
        placeholder: t('paymentManagement.time'),
        valueFormat: 'YYYY-MM-DD HH:mm:ss'
      }
    }
  }
])

// @ts-ignore
const { allSchemas } = useCrudSchemas(crudSchemas)

const handleExport = async () => {
  const currentValues = await searchRef.value.getFormData()
  processParams(currentValues)

  ElMessageBox.confirm(t('paymentManagement.confirmExportData'), t('common.delWarning'), {
    confirmButtonText: t('common.delOk'),
    cancelButtonText: t('common.delCancel'),
    type: 'warning',
    boxType: 'confirm'
  }).then(async () => {
    try {
      appStore.pageLoading = true

      const res = await exportMerchantFundflowApi(route.params.muid, searchParams.value)
      if (res?.success) {
        ElMessage.success('导出成功')
      } else {
        ElMessage.error(res.message)
        return
      }
    } catch (error) {
      console.log(error)
    } finally {
      appStore.pageLoading = false
    }
  })
}
</script>

<template>
  <ContentWrap class="search-section">
    <div class="log-search">
      <Search
        ref="searchRef"
        :model="{
          create_time: [todayStart, tomorrowStart]
        }"
        :schema="allSchemas.searchSchema"
        @search="setSearchParams"
        @reset="setSearchParams"
      >
        <template #moreBtn>
          <BaseButton
            :icon="Download"
            v-if="hasPermi('merchantCashflowExport')"
            type="warning"
            @click="handleExport"
          >
            {{ t('common.exportData') }}
          </BaseButton>
        </template>
      </Search>
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
