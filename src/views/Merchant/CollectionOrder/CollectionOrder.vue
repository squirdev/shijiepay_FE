<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import Search from '@/components/CustomSearch/src/Search.vue'
import { Dialog } from '@/components/Dialog'
import { useI18n } from '@/hooks/web/useI18n'
import { Table, TableColumn } from '@/components/Table'
import {
  getCollectionOrderApi,
  exportCollectionOrderApi,
  getTotalCollectionOrderApi
} from '@/api/merchant'
import { useTable } from '@/hooks/web/useTable'
import { ref, unref, reactive, onMounted } from 'vue'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { Breadcrumb } from '@/components/Breadcrumb'
import { ElMessage, ElMessageBox, ElRow, ElCol, ElTag, ElTooltip } from 'element-plus'
import { callbackStatuOptions, callbackTypeOptions, payStatuOptions } from '@/utils/options'
import { formatToDate, todayStart, tomorrowStart } from '@/utils/dateUtil'
import { useAppStore } from '@/store/modules/app'
import { BaseButton } from '@/components/Button'
import { hasPermi } from '@/components/Permission'

const ids = ref<string[]>([])

const { t } = useI18n()
const appStore = useAppStore()

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getCollectionOrderApi({
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

const totalData = reactive({
  order_amount_total: 0,
  actual_amount_total: 0,
  actual_amount_count: 0,
  repay_amount_total: 0,
  callback_amount_total: 0,
  callback_amount_count: 0,
  hd_repay_amount_total: 0,
  lose_amount_total: 0,
  lose_amount_count: 0
})

const { loading, dataList, total, currentPage, pageSize } = tableState
const { getList } = tableMethods

const searchRef = ref()
const currentDate = formatToDate(new Date())
const searchParams = ref({
  order_time: `${todayStart}|${tomorrowStart}`
})

const processParams = (params) => {
  if (params.order_time) {
    params.order_time = params.order_time.join('|')
  }
  if (params.callback_time) {
    params.callback_time = params.callback_time.join('|')
  }
  searchParams.value = params
}

const setSearchParams = (params: any) => {
  processParams(params)
  getList()
}

const saveLoading = ref(false)

const showExport = async () => {
  const currentValues = await searchRef.value.getFormData()
  processParams(currentValues)
  ElMessageBox.confirm(t('paymentManagement.confirmExportData'), t('common.delWarning'), {
    confirmButtonText: t('common.delOk'),
    cancelButtonText: t('common.delCancel'),
    type: 'warning',
    boxType: 'confirm'
  })
    .then(async () => {
      try {
        saveLoading.value = true
        const res = await exportCollectionOrderApi(searchParams.value)

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

const crudSchemas = reactive<CrudSchema[]>([
  {
    field: 'order_id',
    label: t('collectionManagement.orderNumber'),
    width: 240,
    search: {
      component: 'Input',
      label: t('collectionManagement.orderNumber'),
      componentProps: {
        placeholder: t('collectionManagement.orderNumber')
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
    width: 200,
    search: {
      hidden: true
    }
  },
  {
    field: 'merchant_order_id',
    label: t('collectionManagement.merchantOrderID'),
    width: 240,
    search: {
      component: 'Input',
      label: t('collectionManagement.merchantOrderID'),
      componentProps: {
        placeholder: t('collectionManagement.merchantOrderID')
      }
    }
  },
  {
    field: 'tunnel_name',
    label: t('merchantList.channelType'),
    search: {
      hidden: true
    }
  },
  {
    field: 'order_amount',
    label: t('collectionManagement.orderAmount'),
    search: {
      hidden: true
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
    field: 'pay_statu',
    label: t('collectionManagement.paymentStatus'),
    width: 140,
    search: {
      component: 'Select',
      componentProps: {
        placeholder: t('collectionManagement.paymentStatus'),
        options: payStatuOptions.filter((l) => ['ispay', 'notpay'].includes(l.value))
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
    label: t('collectionManagement.callbackStatus'),
    search: {
      component: 'Select',
      componentProps: {
        placeholder: t('collectionManagement.callbackStatus'),
        options: callbackStatuOptions
      }
    },
    table: { hidden: true }
  },
  {
    field: 'order_time',
    label: t('collectionManagement.orderTime'),
    search: {
      component: 'DatePicker',
      componentProps: {
        type: 'datetimerange',
        startPlaceholder: t('collectionManagement.orderStartTime'),
        endPlaceholder: t('collectionManagement.orderEndTime'),
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
        onChange: (val) => {
          if (!val) return
          searchRef.value?.setValues({ callback_time: null })
        }
      }
    },
    form: {
      component: 'DatePicker',
      componentProps: {
        type: 'datetimerange'
      }
    },
    table: {
      hidden: true
    }
  },
  {
    field: 'order_time',
    label: '时间',
    search: {
      hidden: true
    },
    table: {
      slots: {
        default: (data: any) => {
          const { order_time, callback_time } = data.row
          const newOrderTime = order_time?.includes(' ') ? order_time?.split(' ')?.[1] : order_time

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
                  <BaseButton class="!m-0">{newOrderTime}</BaseButton>
                </ElTooltip>
              )}

              {newCallbackTime && (
                <ElTooltip content="回调时间" placement="right">
                  <BaseButton class="!m-0">{newCallbackTime}</BaseButton>
                </ElTooltip>
              )}
            </div>
          )
        }
      }
    }
  },
  {
    field: 'callback_time',
    search: {
      label: '回调时间',
      component: 'DatePicker',
      componentProps: {
        type: 'datetimerange',
        startPlaceholder: t('collectionManagement.callbackStartTime'),
        endPlaceholder: t('collectionManagement.callbackEndTime'),
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
        onChange: (val) => {
          if (!val) return
          searchRef.value?.setValues({ order_time: null })
        }
      }
    },
    table: {
      label: '回调信息',
      slots: {
        default: (data: any) => {
          const { callback_type, callback_time, callback_statu } = data.row

          const typeName =
            callbackTypeOptions?.filter((l) => !!l.value).find((l) => l.value === callback_type)
              ?.label ?? ''
          let statuName

          if (callback_statu === 'success') {
            statuName = <ElTag type="success">成功</ElTag>
          } else if (callback_statu === 'failed') {
            statuName = <ElTag type="danger">失败</ElTag>
          } else if (callback_statu === 'not_calledback') {
            statuName = <ElTag type="primary">未回调</ElTag>
          }

          return (
            <div class="flex flex-col gap-[10px]">
              {statuName && (
                <div>
                  {' '}
                  <ElTooltip content="回调状态" placement="top">
                    {statuName}
                  </ElTooltip>
                </div>
              )}
              {typeName && (
                <div>
                  <ElTooltip content="回调类型" placement="top">
                    <ElTag type="primary">{typeName}</ElTag>
                  </ElTooltip>
                </div>
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
const totalDialogVisible = ref(false)

const getTotal = async () => {
  const currentValues = await searchRef.value.getFormData()
  processParams(currentValues)
  appStore.pageLoading = true
  try {
    const res = await getTotalCollectionOrderApi(searchParams.value)
    Object.assign(totalData, res.data)
    totalDialogVisible.value = true
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
          :show-total="hasPermi('paymentTotal')"
          :show-export-data="hasPermi('paymentExport')"
          @search="setSearchParams"
          @reset="setSearchParams"
          @export-data="showExport"
          @total="getTotal"
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
      v-model="totalDialogVisible"
      :title="t('totalData.total')"
      :style="{ maxWidth: '500px' }"
    >
      <ElRow>
        <ElCol :span="13" :tag="'span'" style="text-align: right; padding: 10px">
          {{ t('totalData.orderAmount') + ' :' }}
        </ElCol>
        <ElCol :span="11" :tag="'span'" style="color: black; padding: 10px">
          {{ totalData.order_amount_total }}
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="13" :tag="'span'" style="text-align: right; padding: 10px">
          订单手续费金额:
        </ElCol>
        <ElCol :span="11" :tag="'span'" style="color: black; padding: 10px">
          {{ totalData.repay_amount_total }}
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="13" :tag="'span'" style="text-align: right; padding: 10px">
          {{ t('totalData.callbackAmount') + ' :' }}
        </ElCol>
        <ElCol :span="11" :tag="'span'" style="color: black; padding: 10px">
          {{ totalData.callback_amount_total }}
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="13" :tag="'span'" style="text-align: right; padding: 10px">
          回调手续费
        </ElCol>
        <ElCol :span="11" :tag="'span'" style="color: black; padding: 10px">
          {{ totalData.hd_repay_amount_total }}
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="13" :tag="'span'" style="text-align: right; padding: 10px">
          {{ t('totalData.callbackNumber') + ' :' }}
        </ElCol>
        <ElCol :span="11" :tag="'span'" style="color: black; padding: 10px">
          {{ totalData.callback_amount_count }}
        </ElCol>
      </ElRow>
    </Dialog>
  </div>
</template>
