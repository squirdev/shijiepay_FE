<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/CustomSearch'
import { ElMessage, ElMessageBox, ElRow, ElCol, ElTag, ElTooltip } from 'element-plus'
import { useI18n } from '@/hooks/web/useI18n'
import { Table, TableColumn } from '@/components/Table'
import { getPaymentOrderApi, exportPaymentOrderApi, getTotalPaymentOrderApi } from '@/api/merchant'
import { useTable } from '@/hooks/web/useTable'
import { ref, unref, reactive } from 'vue'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { Breadcrumb } from '@/components/Breadcrumb'
import { useEventBus } from '@/hooks/event/useEventBus'
import { Dialog } from '@/components/Dialog'
import { formatToDate, todayStart, tomorrowStart } from '@/utils/dateUtil'
import { callbackStatuOptions, payStatuOptions } from '@/utils/options'
import { useAppStore } from '@/store/modules/app'
import { BaseButton } from '@/components/Button'
import { hasPermi } from '@/components/Permission'

const ids = ref<string[]>([])
const appStore = useAppStore()

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getPaymentOrderApi({
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
const { getList, getElTableExpose, delList } = tableMethods

const searchRef = ref()
const currentDate = formatToDate(new Date())
const searchParams = ref({
  order_time: `${todayStart}|${tomorrowStart}`
})

const processParams = (params) => {
  if (params.order_time) {
    params.order_time = params.order_time.join('|')
  }
  if (params.pay_time) {
    params.pay_time = params.pay_time.join('|')
  }
  searchParams.value = params
}

const setSearchParams = (params: any) => {
  processParams(params)
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
    label: t('paymentManagement.orderNumber'),
    width: 200,
    search: {
      component: 'Input',
      label: t('paymentManagement.orderNumber'),
      componentProps: {
        placeholder: t('paymentManagement.orderNumber')
      }
    }
  },
  {
    field: 'merchant_name',
    label: t('paymentManagement.merchantName'),
    search: {
      hidden: true
    }
  },
  {
    field: 'merchant_order_id',
    label: t('paymentManagement.merchantOrderNumber') /* 商户订单号 */,
    width: 200,
    search: {
      component: 'Input',
      componentProps: {
        placeholder: t('common.inputText') /* 请输入 */
      }
    }
  },
  {
    field: 'payee_account',
    label: t('formDemo.paymentcardnumber'),
    search: {
      hidden: true
    }
  },
  {
    field: 'payee_owner',
    label: t('security.debitCardName'),
    search: {
      hidden: true
    }
  },
  {
    field: 'payee_bank_code',
    label: t('formDemo.receivingbank') /* 收款银行 */,
    search: {
      hidden: true
    }
  },
  {
    field: 'order_amount',
    label: t('paymentManagement.orderAmount'),
    width: 120,
    search: {
      hidden: true
    },
    formatter: (_: any, __: TableColumn, cellValue: number) => {
      return cellValue ? Number(cellValue.toFixed(2)).toLocaleString() : 0
    }
  },
  {
    field: 'repay_amount',
    label: t('paymentManagement.fees'),
    width: 120,
    search: {
      hidden: true
    },
    formatter: (_: any, __: TableColumn, cellValue: number) => {
      return cellValue ? Number(cellValue.toFixed(2)).toLocaleString() : 0
    }
  },

  {
    field: 'pay_statu',
    label: t('paymentManagement.paymentStatus'),
    width: 140,
    search: {
      component: 'Select',
      componentProps: {
        placeholder: t('paymentManagement.paymentStatus'),
        options: payStatuOptions.filter((l) => ['ispay', 'notpay', 'pay_reject'].includes(l.value))
      }
    },
    formatter: (_: any, __: TableColumn, cellValue: string) => {
      const name = payStatuOptions.find((l) => l.value === cellValue)?.label
      if (cellValue === 'ispay') {
        return <ElTag type="success">{name}</ElTag>
      } else if (['pay_failed', 'pay_timeout', 'pay_reject'].includes(cellValue)) {
        return <ElTag type="danger">{name}</ElTag>
      } else {
        return <ElTag type="primary">{name}</ElTag>
      }
    }
  },

  {
    field: 'callback_statu',
    label: t('paymentManagement.callbackStatus'),
    search: {
      component: 'Select',
      componentProps: {
        placeholder: t('paymentManagement.callbackStatus'),
        options: callbackStatuOptions
      }
    },
    formatter: (_: any, __: TableColumn, cellValue: string) => {
      const name = callbackStatuOptions.find((l) => l.value === cellValue)?.label
      if (cellValue === 'success') {
        return <ElTag type="success">{name}</ElTag>
      } else if (['failed'].includes(cellValue)) {
        return <ElTag type="danger">{name}</ElTag>
      } else {
        return <ElTag type="primary">{name}</ElTag>
      }
    }
  },
  {
    field: 'order_time',
    label: t('paymentManagement.orderTime'),
    search: {
      component: 'DatePicker',
      componentProps: {
        type: 'datetimerange',
        placeholder: t('paymentManagement.orderTime'),
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
        onChange: (val) => {
          if (!val) return
          searchRef.value?.setValues({ pay_time: null })
        }
      }
    },
    form: {
      component: 'DatePicker',
      componentProps: {
        type: 'datetimerange'
        // valueFormat: 'YYYY-MM-DD HH:mm:ss'
      }
    },
    table: {
      hidden: true
    }
  },
  {
    field: 'pay_time',
    label: t('paymentManagement.paymentTime'),
    search: {
      component: 'DatePicker',
      componentProps: {
        type: 'datetimerange',
        placeholder: t('paymentManagement.paymentTime'),
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
        onChange: (val) => {
          if (!val) return
          searchRef.value?.setValues({ order_time: null })
        }
      }
    },
    form: {
      component: 'DatePicker',
      componentProps: {
        type: 'datetimerange'
        // valueFormat: 'YYYY-MM-DD HH:mm:ss'
      }
    },
    table: {
      hidden: true
    }
  },
  {
    field: 'time',
    label: t('paymentManagement.time') /* 时间 */,
    'min-width': 120,
    search: {
      hidden: true
    },
    table: {
      slots: {
        default: (data: any) => {
          const { order_time, pay_time, callback_time } = data.row
          const newOrderTime = order_time?.includes(' ') ? order_time?.split(' ')?.[1] : order_time
          const newPayTime = pay_time?.includes(' ') ? pay_time?.split(' ')?.[1] : pay_time
          const newCallbackTime = callback_time?.includes(' ')
            ? callback_time?.split(' ')?.[1]
            : callback_time
          return (
            <div class="flex flex-col items-center gap-[10px]">
              {newOrderTime && (
                <ElTooltip
                  content={t('paymentManagement.orderTime')}
                  /* 订单时间 */ placement="right"
                >
                  <BaseButton>{newOrderTime}</BaseButton>
                </ElTooltip>
              )}
              {newPayTime && (
                <ElTooltip
                  content={t('paymentManagement.paymentTime')}
                  /* 支付时间 */ placement="right"
                >
                  <BaseButton class="!m-0">{newPayTime}</BaseButton>
                </ElTooltip>
              )}
              {newCallbackTime && (
                <ElTooltip
                  content={t('paymentManagement.callbackTime')}
                  /* 回调时间 */ placement="right"
                >
                  <BaseButton class="!m-0"> {newCallbackTime}</BaseButton>
                </ElTooltip>
              )}
            </div>
          )
        }
      }
    }
  }
])

// @ts-ignore
const { allSchemas } = useCrudSchemas(crudSchemas)

const dialogVisible = ref(false)
const dialogTitle = ref('')

const saveLoading = ref(false)

const showExportOrderData = async () => {
  const currentValues = await searchRef.value.getFormData()
  processParams(currentValues)
  ElMessageBox.confirm(t('paymentManagement.confirmExportData'), t('paymentManagement.warning'), {
    confirmButtonText: t('paymentManagement.ok'),
    cancelButtonText: t('paymentManagement.cancel'),
    type: 'warning',
    center: true
  })
    .then(async () => {
      try {
        saveLoading.value = true
        const res = await exportPaymentOrderApi(searchParams.value)
        
        ElMessage.success(res?.message)

        // 这里可以调用修改密码的接口
      } catch (error) {
        console.log(error)
      } finally {
        saveLoading.value = false
      }
    })
    .catch(() => {})
}

const totalData = ref({
  order_amount_tota: 0,
  actual_amount_tota: 0,
  repay_amount_tota: 0
})
const showOrderStatistics = async () => {
  const currentValues = await searchRef.value.getFormData()
  processParams(currentValues)
  appStore.pageLoading = true
  try {
    const res = await getTotalPaymentOrderApi(searchParams.value)
    totalData.value = res.data
    dialogVisible.value = true
    dialogTitle.value = t('paymentManagement.statistics')
  } catch (error) {
    console.log(error)
  } finally {
    appStore.pageLoading = false
  }
}
</script>

<template>
  <div>
    <ContentWrap class="search-section">
      <div class="log-search">
        <!-- <p style="min-width: 50px; padding-top: 8px">{{ t('common.search') }} :</p> -->
        <Search
          ref="searchRef"
          :model="{
            order_time: [todayStart, tomorrowStart]
          }"
          :schema="allSchemas.searchSchema"
          :show-export-order-data="hasPermi('payoutExport')"
          :show-order-statistics="hasPermi('payoutTotal')"
          @export-order-data="showExportOrderData"
          @order-statistics="showOrderStatistics"
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

    <Dialog
      v-model="dialogVisible"
      :title="t('statisticsData.title')"
      :style="{ maxWidth: '500px' }"
    >
      <ElRow>
        <ElCol :span="13" :tag="'span'" style="text-align: right; padding: 10px">
          总订单金额:
        </ElCol>
        <ElCol :span="11" :tag="'span'" style="color: black; padding: 10px">
          {{ totalData?.order_amount_tota }}
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="13" :tag="'span'" style="text-align: right; padding: 10px">
          总支付金额:
        </ElCol>
        <ElCol :span="11" :tag="'span'" style="color: black; padding: 10px">
          {{ totalData?.actual_amount_tota }}
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="13" :tag="'span'" style="text-align: right; padding: 10px">
          总支付手续费:
        </ElCol>
        <ElCol :span="11" :tag="'span'" style="color: black; padding: 10px">
          {{ totalData?.repay_amount_tota }}
        </ElCol>
      </ElRow>
    </Dialog>
  </div>
</template>
<style lang="css">
/* //search-section */
</style>
