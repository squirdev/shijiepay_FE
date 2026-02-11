<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/CustomSearch'
import { Dialog } from '@/components/Dialog'
import { useI18n } from '@/hooks/web/useI18n'
import { useRouter } from 'vue-router'
import { Table, TableColumn } from '@/components/Table'
import {
  getOrderListApi,
  getTotalOrderApi,
  exportOrderListApi,
  collectionOrderApi,
  getThreePartyDatasApi
} from '@/api/collectionmanagement'
import { useTable } from '@/hooks/web/useTable'
import { ref, unref, reactive, onMounted } from 'vue'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { Breadcrumb } from '@/components/Breadcrumb'
import {
  ElMessage,
  ElMessageBox,
  ElRow,
  ElCol,
  ElNotification,
  ElTag,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElTooltip,
  ElText
} from 'element-plus'
import { useEventBus } from '@/hooks/event/useEventBus'
import { useAppStore } from '@/store/modules/app'
import { formatToDate, todayStart, tomorrowStart } from '@/utils/dateUtil'
import { callbackTypeOptions, callbackStatuOptions, payStatuOptions } from '@/utils/options'
import { BaseButton } from '@/components/Button'
import OrderInfo from './components/OrderInfo'
import NoteForm from './components/NoteForm'
import { copyToClipboard } from '@/utils'
import { getCountryListApi } from '@/api/merchantmanagement'
import { useEnum } from '@/hooks/web/useEnum'
import { hasPermi } from '@/components/Permission'

interface CountryItem {
  code: string
  currencyCode: string
  currencyName: string
  flag: string
  name: string
}

const ids = ref<string[]>([])
const searchRef = ref()
const { t } = useI18n()
const router = useRouter()

const { threePartyOptions, countryOptions } = useEnum()

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getOrderListApi({
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
  order_time: `${todayStart}|${tomorrowStart}`
})

const processParams = (params) => {
  if (params.order_time) {
    params.order_time = params.order_time.join('|')
  }
  if (params.callback_time) {
    params.callback_time = params.callback_time.join('|')
  }
  const { searchKey, searchValue, ...otherParams } = params
  if (searchKey) {
    otherParams[searchKey] = searchValue ?? ''
  }

  searchParams.value = otherParams
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

const totalData = reactive({
  order_amount_total: 0,
  actual_amount_total: 0,
  actual_amount_count: 0,
  repay_amount_total: 0,
  callback_amount_total: 0,
  callback_amount_count: 0,
  lose_amount_total: 0,
  lose_amount_count: 0
})
const getTotal = async () => {
  const currentValues = await searchRef.value.getFormData()
  processParams(currentValues)
  appStore.pageLoading = true
  try {
    const res = await getTotalOrderApi(searchParams.value)
    Object.assign(totalData, res.data)
    totalDialogVisible.value = true
  } catch (error) {
    console.log(error)
  } finally {
    appStore.pageLoading = false
  }
}
const appStore = useAppStore()
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
        appStore.pageLoading = true

        const res = await exportOrderListApi(searchParams.value)
        if (res?.success) {
          ElMessage.success(res.message)
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
    .catch(() => {})
}

const crudSchemas = reactive<CrudSchema[]>([
  {
    field: 'country',
    label: t('AddMerchantForm.country'),
    search: {
      component: 'Select',
      label: t('AddMerchantForm.country'),
      componentProps: {
        placeholder: t('AddMerchantForm.selectCountry'),
        options: countryOptions
      }
    },
    table: { hidden: true }
  },
  {
    field: 'three_party_uuid',
    label: '三方',
    search: {
      label: '三方',
      component: 'Select',
      componentProps: {
        placeholder: '选择三方',
        options: threePartyOptions
      }
    },
    table: { hidden: true }
  },

  {
    field: 'order_id',
    label: '单号',
    'min-width': 210,
    search: {
      hidden: true
    },
    table: {
      'show-overflow-tooltip': false,
      slots: {
        default: (data: any) => {
          const { order_id, merchant_order_id, channel_order_id } = data.row

          return (
            <div class="flex flex-col items-center gap-[10px]">
              {/* 系统单号 */}
              {order_id && (
                <ElTooltip placement="right" content={t('paymentManagement.orderNumber')}>
                  <BaseButton
                    class="!m-0 !px-2"
                    onClick={() => copyToClipboard(order_id, t('paymentManagement.orderNumber'))}
                  >
                    {order_id}
                  </BaseButton>
                </ElTooltip>
              )}
              {/* 商户单号 */}
              {merchant_order_id && (
                <ElTooltip placement="right" content={t('paymentManagement.merchantOrderNumber')}>
                  <BaseButton
                    class="!m-0 !px-2"
                    onClick={() =>
                      copyToClipboard(merchant_order_id, t('paymentManagement.merchantOrderNumber'))
                    }
                  >
                    {merchant_order_id}
                  </BaseButton>
                </ElTooltip>
              )}
              {/* 三方单号 */}
              {channel_order_id && (
                <ElTooltip placement="right" content="三方单号">
                  <BaseButton
                    class="!m-0 !px-2"
                    onClick={() => copyToClipboard(channel_order_id, '三方单号')}
                  >
                    {channel_order_id}
                  </BaseButton>
                </ElTooltip>
              )}
            </div>
          )
        }
      }
    }
  },
  {
    field: 'merchant_account',
    label: '商户信息',
    search: {
      hidden: true
    },
    'min-width': 180,
    table: {
      slots: {
        default: (data: any) => {
          const { merchant_id, merchant_account } = data.row

          return (
            <div class="flex flex-col gap-[10px]">
              {merchant_account && (
                <div class="flex">
                  <span class="w-1/2 text-right mr-[6px]">商户名称:</span>
                  {merchant_account}
                </div>
              )}
              {merchant_id && (
                <div class="flex">
                  <span class="w-1/2 text-right mr-[6px]">商户ID:</span>
                  {merchant_id}
                </div>
              )}
            </div>
          )
        }
      }
    }
  },
  {
    field: 'three',
    label: '三方信息',
    search: {
      hidden: true
    },
    'min-width': 140,
    table: {
      slots: {
        default: (data: any) => {
          const { channel_order_id, sf_name, payment_channel_name, country } = data.row

          return (
            <div class="flex flex-col gap-[10px]">
              {sf_name && (
                <div class="flex">
                  <span class="w-1/2 text-right mr-[6px]">名称:</span> {sf_name}
                </div>
              )}

              {payment_channel_name && (
                <div class="flex ">
                  <span class="w-1/2 text-right mr-[6px]">代收通道:</span> {payment_channel_name}
                </div>
              )}
              {country && (
                <div class="flex">
                  <span class="w-1/2 text-right mr-[6px]">国家:</span>
                  {country}
                </div>
              )}
            </div>
          )
        }
      }
    }
  },
  {
    field: 'tunnel_name',
    label: t('collectionManagement.paymentMode'),
    search: {
      component: 'Input'
    }
  },
  {
    field: 'order_amount',
    label: '金额信息',
    'min-width': 160,
    search: {
      hidden: true
    },
    table: {
      slots: {
        default: (data: any) => {
          const { order_amount, repay_amount, actual_amount } = data.row

          return (
            <div class="flex flex-col gap-[6px]">
              <div class="flex">
                <span class="w-1/2 text-right mr-[6px]">
                  {t('paymentManagement.orderAmount') /* 订单金额 */}:
                </span>
                {order_amount ? Number(order_amount.toFixed(2)).toLocaleString() : 0}
              </div>

              <div class="flex">
                <span class="w-1/2 text-right mr-[6px]">
                  {t('paymentManagement.fees') /* 手续费 */}:
                </span>

                {repay_amount ? Number(repay_amount.toFixed(2)).toLocaleString() : 0}
              </div>
              <div class="flex">
                <span class="w-1/2 text-right mr-[6px]">
                  {t('collectionManagement.paymentAmount') /* 支付金额 */}:
                </span>
                {actual_amount ? Number(actual_amount.toFixed(2)).toLocaleString() : 0}
              </div>
            </div>
          )
        }
      }
    }
  },

  {
    field: 'pay_statu',
    label: t('collectionManagement.paymentStatus'),
    'min-width': 120,
    search: {
      component: 'Select',
      componentProps: {
        placeholder: t('collectionManagement.paymentStatus'),
        options: payStatuOptions.filter((l) => l.value !== 'pay_timeout')
      }
    },
    table: {
      'show-overflow-tooltip': false,
      slots: {
        default: (data: any) => {
          const { pay_statu, sf_create_error_msg } = data.row

          const name = payStatuOptions.find((l) => l.value === pay_statu)?.label
          if (pay_statu === 'ispay') {
            return <ElTag type="success">{name}</ElTag>
          } else if (['pay_failed', 'pay_timeout', 'pay_reject'].includes(pay_statu)) {
            return (
              <ElTooltip content={sf_create_error_msg ?? ''}>
                <ElTag type="danger">{name}</ElTag>
              </ElTooltip>
            )
          } else {
            return <ElTag type="primary">{name}</ElTag>
          }
        }
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
    field: 'callback_type',
    label: t('collectionManagement.callbackType'),
    search: {
      component: 'Select',
      componentProps: {
        placeholder: t('collectionManagement.callbackType'),
        options: callbackTypeOptions
      }
    },
    table: { hidden: true }
  },
  {
    field: 'searchKey',
    search: {
      component: 'Select',
      label: t('collectionManagement.selectSearchType'),
      componentProps: {
        placeholder: t('collectionManagement.selectSearchType'),
        options: [
          // { label: '支付模式', value: 'tunnel_name' },
          { label: t('collectionManagement.merchantID'), value: 'merchant_id' },
          { label: t('collectionManagement.merchantName'), value: 'merchant_name' },
          { label: t('collectionManagement.orderNumber'), value: 'order_id' },
          { label: t('paymentManagement.merchantOrderID'), value: 'merchant_order_id' },
          { label: '三方订单号', value: 'channel_order_id' },
          { label: t('collectionManagement.remark'), value: 'note' }
        ]
      }
    },
    table: { hidden: true }
  },
  {
    field: 'searchValue',
    search: {
      component: 'Input',
      label: t('collectionManagement.searchContent'),
      componentProps: {
        placeholder: t('collectionManagement.searchContent')
      }
    },
    table: { hidden: true }
  },
  {
    field: 'order_time',
    label: t('collectionManagement.orderTime'),
    'min-width': 120,
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
        // valueFormat: 'YYYY-MM-DD HH:mm:ss'
      }
    },
    table: {
      label: '时间',
      slots: {
        default: (data: any) => {
          const { order_time, callback_time, pay_statu, channel_callback_time } = data.row

          return (
            <div class="flex flex-col items-center gap-[10px]">
              {order_time && (
                <ElTooltip
                  content={t('paymentManagement.orderTime')}
                  /* 订单时间 */ placement="right"
                >
                  <BaseButton class="!m-0">{order_time?.split(' ')?.[1] ?? ''}</BaseButton>
                </ElTooltip>
              )}

              {pay_statu === 'ispay' && channel_callback_time && (
                <ElTooltip content="支付时间" placement="right">
                  <BaseButton class="!m-0">{channel_callback_time?.split(' ')?.[1] ?? ''}</BaseButton>
                </ElTooltip>
              )}

              {callback_time && (
                <ElTooltip content="回调时间" placement="right">
                  <BaseButton class="!m-0">{callback_time?.split(' ')?.[1] ?? ''}</BaseButton>
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
    label: '回调时间',
    'min-width': 120,
    search: {
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
      label: '回调状态',
      slots: {
        default: (data: any) => {
          const { callback_type, callback_time, callback_statu } = data.row

          const typeName =
            callbackTypeOptions.filter((l) => !!l.value).find((l) => l.value === callback_type)
              ?.label ?? ''
          let statuName = callbackStatuOptions.find((l) => l.value === callback_statu)?.label

          if (callback_statu === 'success') {
            // @ts-ignore
            statuName = <ElTag type="success">{statuName}</ElTag>
          } else if (callback_statu === 'failed') {
            // @ts-ignore
            statuName = <ElTag type="danger">{statuName}</ElTag>
          } else if (callback_statu === 'progress') {
            // @ts-ignore
            statuName = <ElTag type="primary">{statuName}</ElTag>
          } else {
            statuName = ''
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
  },
  {
    field: 'Operate',
    label: t('collectionManagement.operate'),
    // fixed: 'right',
    search: {
      hidden: true
    },
    'min-width': 160,
    table: {
      slots: {
        default: (data: any) => {
          const row = data.row
          return (
            <div class="flex flex-wrap justify-center items-center">
              {hasPermi('paymentQzrk') && (
                <>
                  <BaseButton type="text" onClick={() => showNodeModal(row, 'forceIsPay')}>
                    强制入款
                  </BaseButton>
                  <el-divider direction="vertical" class="w-[1px] h-[16px] bg-[#dfe6ec]" />
                </>
              )}

              {hasPermi('paymentOrderProcess') && (
                <>
                  <BaseButton type="text" onClick={() => showDetailModal(row)}>
                    详细
                  </BaseButton>
                  <el-divider direction="vertical" class="w-[1px] h-[16px] bg-[#dfe6ec]" />
                </>
              )}

              <ElDropdown
                trigger="click"
                v-slots={{
                  default: () => {
                    return <BaseButton type="text">{t('workplace.more')}</BaseButton>
                  },
                  dropdown: () => {
                    return (
                      <ElDropdownMenu>
                        {hasPermi('paymentQueryOrder') && (
                          <ElDropdownItem
                            key={'1'}
                            onClick={() => payOperate(row.uuid, 'queryOrder')}
                          >
                            查询订单
                          </ElDropdownItem>
                        )}
                        {hasPermi('paymentZzrk') && (
                          <ElDropdownItem
                            key={'3'}
                            onClick={() => payOperate(row.uuid, 'order_isPay')}
                          >
                            设置入款
                          </ElDropdownItem>
                        )}
                        {hasPermi('paymentOrderCallback') && (
                          <ElDropdownItem
                            key={'4'}
                            onClick={() => payOperate(row.uuid, 'callbackOrder')}
                          >
                            订单回调
                          </ElDropdownItem>
                        )}
                        {hasPermi('paymentUpdateNote') && (
                          <ElDropdownItem
                            key={'5'}
                            onClick={() => showNodeModal(row, 'updateNote')}
                          >
                            更新备注
                          </ElDropdownItem>
                        )}
                        {hasPermi('paymentCallbackLog') && (
                          <ElDropdownItem key={'6'} onClick={() => gotoRecord(row.order_id)}>
                            回调记录
                          </ElDropdownItem>
                        )}
                      </ElDropdownMenu>
                    )
                  }
                }}
              ></ElDropdown>
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

const currentRow = ref()
const saveLoading = ref(false)

const payOperate = async (uuid: string, action: string) => {
  try {
    const newValues = {
      action,
      data_uuid: uuid
    }

    const res = await collectionOrderApi(newValues)

    if (res?.success) {
      const msg = action === 'queryOrder' ? res.message : t('common.successOperation')
      ElMessage.success(msg)
    } else {
      ElMessage.error(res.message)
      return
    }

    getList()
  } catch (error) {
    console.log(error)
  }
}

const detailVisible = ref(false)
const noteVisible = ref(false)
const noteAction = ref<'updateNote' | 'forceIsPay'>('updateNote')
const noteFormRef = ref()

const showDetailModal = (row) => {
  detailVisible.value = true
  currentRow.value = row
}

const showNodeModal = (row, action: 'updateNote' | 'forceIsPay') => {
  noteAction.value = action
  noteVisible.value = true
  currentRow.value = row
}

const updateNote = async () => {
  const noteForm = unref(noteFormRef)
  const formData = await noteForm?.submit()

  if (!formData) return

  const newValues = {
    action: noteAction.value,
    data_uuid: currentRow.value.uuid,
    note: '',
    ...formData
  }
  saveLoading.value = true
  try {
    const res = await collectionOrderApi(newValues)

    if (res?.success) {
      ElMessage.success(t('common.successOperation'))
    } else {
      ElMessage.error(res.message)
      return
    }
    noteVisible.value = false
    getList()
  } catch (error) {
    console.log(error)
  } finally {
    saveLoading.value = false
  }
}

const gotoRecord = (orderId: string) => {
  router.push(
    `/ordermanagement/callbacklog?order_id=${orderId}&create_time=${searchParams.value.order_time ?? ''}`
  )
}
</script>

<template>
  <div>
    <ContentWrap class="search-section">
      <div class="log-search">
        <!-- <p style="min-width: 50px; padding-top: 8px">{{ t('common.search') }} :</p> -->
        <Search
          ref="searchRef"
          :schema="allSchemas.searchSchema"
          :model="{
            order_time: [todayStart, tomorrowStart]
          }"
          :show-total="hasPermi('paymentTotal')"
          show-not-processing
          :show-export-order-data="hasPermi('paymentExportData')"
          @search="setSearchParams"
          @reset="setSearchParams"
          @export-order-data="showExport"
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
          {{ t('totalData.actualAmountPaid') + ' :' }}
        </ElCol>
        <ElCol :span="11" :tag="'span'" style="color: black; padding: 10px">
          {{ totalData.actual_amount_total }}
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="13" :tag="'span'" style="text-align: right; padding: 10px">
          {{ t('totalData.actualNumberOfPayments') + ' :' }}
        </ElCol>
        <ElCol :span="11" :tag="'span'" style="color: black; padding: 10px">
          {{ totalData.actual_amount_count }}
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="13" :tag="'span'" style="text-align: right; padding: 10px">
          {{ t('totalData.acutalHandlingFeePaid') + ' :' }}
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
          {{ t('totalData.callbackNumber') + ' :' }}
        </ElCol>
        <ElCol :span="11" :tag="'span'" style="color: black; padding: 10px">
          {{ totalData.callback_amount_count }}
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="13" :tag="'span'" style="text-align: right; padding: 10px">
          {{ t('totalData.amountOfDroppedOrders') + ' :' }}
        </ElCol>
        <ElCol :span="11" :tag="'span'" style="color: black; padding: 10px">
          {{ totalData.lose_amount_total }}
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="13" :tag="'span'" style="text-align: right; padding: 10px">
          {{ t('totalData.numberOfDroppedOrders') + ' :' }}
        </ElCol>
        <ElCol :span="11" :tag="'span'" style="color: black; padding: 10px">
          {{ totalData.lose_amount_count }}
        </ElCol>
      </ElRow>
    </Dialog>

    <OrderInfo v-model="detailVisible" :detailVisible="detailVisible" :row="currentRow" />

    <Dialog v-model="noteVisible" title="更新备注">
      <div class="mr-20px">
        <NoteForm ref="noteFormRef" :row="currentRow" />
      </div>
      <template #footer>
        <BaseButton type="primary" :loading="saveLoading" @click="updateNote"> 提交 </BaseButton>
        <BaseButton @click="noteVisible = false">{{ t('dialogDemo.close') }}</BaseButton>
      </template>
    </Dialog>
  </div>
</template>
