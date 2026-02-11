<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/CustomSearch'
import {
  ElMessageBox,
  ElRow,
  ElCol,
  ElTag,
  ElText,
  ElTooltip,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElMessage,
  ElLoading
} from 'element-plus'
import { useI18n } from '@/hooks/web/useI18n'
import { Table, TableColumn } from '@/components/Table'
import {
  getPayOrderApi,
  getPayConfigStatisticsApi,
  exportPayOrderApi,
  fetchPayoutApi
} from '@/api/paymentmanagement'
import { useTable } from '@/hooks/web/useTable'
import { ref, unref, reactive, onMounted } from 'vue'
import { Histogram, Download } from '@element-plus/icons-vue'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { Breadcrumb } from '@/components/Breadcrumb'
import { useEventBus } from '@/hooks/event/useEventBus'
import { Dialog } from '@/components/Dialog'
import {
  formatToDate,
  formatToDateTime,
  isCurrentTimeAfterByMinutes,
  todayStart,
  tomorrowStart
} from '@/utils/dateUtil'
import { callbackStatuOptions, callbackTypeOptions, payStatuOptions } from '@/utils/options'
import { BaseButton } from '@/components/Button'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/store/modules/app'
import { hasPermi } from '@/components/Permission'
import NoteForm from './components/NoteForm'
import OrderInfo from './components/OrderInfo'
import RejectForm from './components/RejectForm'
import TripartiteForm from './components/TripartiteForm'
import CreateOrderForm from './components/CreateOrderForm'
import DetailDrawer from './components/DetailDrawer.vue'
import { copyToClipboard } from '@/utils'
import { useEnum } from '@/hooks/web/useEnum'
import { useAutoRefresh } from '@/hooks/web/useAutoRefresh'

interface RejectValue {
  action: string
  data_uuid?: string
  data_uuids?: string[]
  reason_msg?: string
  remark_text?: string
}

interface StaData {
  actual_amount_total: string
  callback_amount_total: string
  callback_order_count: number
  nf_callback_amount: string
  nf_callback_count: number
  order_amount_total: string
  pay_repay_amount_total: string
  repay_amount_total: string
  total_order_count: number
  total_pay_count: number
}

const router = useRouter()
const appStore = useAppStore()

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getPayOrderApi({
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
const { getList, getElTableExpose } = tableMethods

const ids = ref<string[]>([])
const searchRef = ref()

const searchParams = ref({
  order_time: `${todayStart}|${tomorrowStart}`
})

const { threePartyOptions } = useEnum()

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

const { count, isActive, activeInterval, setRefreshInterval, manualRefresh } = useAutoRefresh(() =>
  getList(false)
)

onMounted(() => {
  setRefreshInterval(30)
})

// 处理下拉菜单指令
const handleCommand = (command: number) => {
  setRefreshInterval(command)
  if (command === 0) {
    ElMessage.info('已关闭自动刷新')
  } else {
    ElMessage.success(`已开启 ${command}秒 自动刷新`)
  }
}

const handleManualClick = () => {
  manualRefresh()
  ElMessage.success('刷新成功')
}

const { t } = useI18n()

const crudSchemas = reactive<CrudSchema[]>([
  {
    field: 'selection',
    'min-width': 50,
    search: {
      hidden: true
    },
    form: {
      hidden: true
    },
    table: {
      type: 'selection'
    }
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
          const { order_id, merchant_order_id, channel_order_id, is_test_order } = data.row
          return (
            <div class="flex flex-col items-center gap-[10px]">
              {is_test_order && <ElTag type="danger">商户测试</ElTag>}

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
    field: 'merchant_name',
    label: '商户信息',
    search: {
      hidden: true
    },
    'min-width': 160,
    table: {
      slots: {
        default: (data: any) => {
          const { merchant_name, country } = data.row

          return (
            <div class="flex flex-col gap-[6px]">
              <div class="flex">
                <span class="w-1/2 text-right mr-[6px]">
                  {t('paymentManagement.merchantName') /* 商户名称 */}:
                </span>
                {merchant_name}
              </div>

              <div class="flex">
                <span class="w-1/2 text-right mr-[6px]">{t('common.country') /* 国家 */}:</span>
                {country}
              </div>
            </div>
          )
        }
      }
    }
  },
  {
    field: 'PaymentInformation',
    label: t('paymentManagement.paymentInformation'),
    search: {
      hidden: true
    },
    'min-width': 210,
    table: {
      slots: {
        default: (data: any) => {
          const { payee_bank_code, payee_account, payee_owner } = data.row

          return (
            <div class="flex flex-col gap-[6px]">
              {/* 银行 */}
              {payee_bank_code && (
                <div class="flex">
                  <span class="w-1/2 text-right mr-[6px]">{t('merchantList.bankName')}:</span>
                  {payee_bank_code}
                </div>
              )}
              {/* 卡号 */}
              {payee_account && (
                <div class="flex">
                  <span class="w-1/2 text-right mr-[6px]">
                    {t('paymentManagement.cardNumber')}:
                  </span>
                  {payee_account}
                </div>
              )}

              {/* 收款人 */}
              {payee_owner && (
                <div class="flex">
                  <span class="w-1/2 text-right mr-[6px]">
                    {t('paymentManagement.receiveOwner')}:
                  </span>
                  {payee_owner}
                </div>
              )}
            </div>
          )
        }
      }
    }
  },

  {
    field: 'three_order_id',
    label: '三方信息',
    'min-width': 180,
    search: {
      hidden: true
    },
    table: {
      'show-overflow-tooltip': false,
      slots: {
        default: (data: any) => {
          const {
            three_party_name,
            sf_create_error_msg,
            tp_create_order_statu,
            is_test_order,
            channel_callback_statu
          } = data.row
          if (is_test_order) {
            return '-'
          }

          return (
            <div class="flex flex-col items-center gap-[10px]">
              {/* 三方 */}
              {three_party_name && (
                <div class="flex w-full">
                  <span class="w-1/2 text-right mr-[6px]">
                    {t('paymentManagement.thirdParty')}:
                  </span>
                  {three_party_name}
                </div>
              )}

              {tp_create_order_statu === 'create_success' && (
                <div class="flex w-full">
                  <span class="w-1/2 text-right mr-[6px]">下单状态:</span>

                  <ElText type="success">下单成功</ElText>
                </div>
              )}

              {tp_create_order_statu === 'create_fail' && (
                <div class="flex w-full">
                  <span class="w-1/2 text-right mr-[6px]">下单状态:</span>
                  <ElText type="danger">下单失败</ElText>
                </div>
              )}

              {tp_create_order_statu === 'create_fail' && (
                <div class="flex w-full">
                  <span class="w-1/2 text-right mr-[6px]">失败原因:</span>
                  <ElText class="w-1/2 max-w-1/2 text-left" type="danger">
                    {sf_create_error_msg ?? ''}
                  </ElText>
                </div>
              )}
              {tp_create_order_statu === 'create_progress' && (
                <div class="flex w-full">
                  <span class="w-1/2 text-right mr-[6px]">下单状态:</span>
                  <ElText type="primary">下单中</ElText>
                </div>
              )}

              {tp_create_order_statu === 'not_create' && (
                <div class="flex w-full">
                  <span class="w-1/2 text-right mr-[6px]">下单状态:</span>
                  <ElText>未下单</ElText>
                </div>
              )}

              <div class="flex w-full">
                <span class="w-1/2 text-right mr-[6px]">三方回调:</span>
                {channel_callback_statu ? (
                  <ElText type="success">已收到</ElText>
                ) : (
                  <ElText type="primary">未收到</ElText>
                )}
              </div>
            </div>
          )
        }
      }
    }
  },
  {
    field: 'order_amount',
    label: '金额',
    'min-width': 140,
    search: {
      hidden: true
    },
    table: {
      slots: {
        default: (data: any) => {
          const { order_amount, repay_amount } = data.row

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
            </div>
          )
        }
      }
    }
  },

  {
    field: 'pay_statu',
    label: t('paymentManagement.paymentStatus'),
    'min-width': 120,
    search: {
      component: 'Select',
      componentProps: {
        placeholder: t('paymentManagement.paymentStatus'),
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
    label: t('paymentManagement.callbackStatus'),
    search: {
      component: 'Select',
      componentProps: {
        placeholder: t('paymentManagement.callbackStatus'),
        options: callbackStatuOptions
      }
    },
    table: { hidden: true }
  },
  {
    field: 'tp_create_order_statu',
    label: '下单状态',
    search: {
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: [
          { label: '未下单', value: 'not_create' },
          { label: '下单中', value: 'create_progress' },
          { label: '下单成功', value: 'create_success' },
          { label: '下单失败', value: 'create_fail' }
        ]
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
    field: 'channel_callback_statu',
    label: '三方回调',
    search: {
      label: '三方回调',
      component: 'Select',
      componentProps: {
        placeholder: '选择三方回调',
        options: [
          { label: '已收到', value: true },
          { label: '未收到', value: false }
        ]
      }
    },
    table: { hidden: true }
  },
  {
    field: 'callback_type',
    'min-width': 120,
    label: t('paymentManagement.callbackStatus') /* 回调状态 */,
    search: {
      hidden: true
    },
    table: {
      slots: {
        default: (data: any) => {
          const { callback_statu, callback_type, order_time2 } = data.row

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

          if (
            (callback_statu === 'not_calledback' || !callback_statu) &&
            order_time2 &&
            isCurrentTimeAfterByMinutes(order_time2, 30)
          ) {
            // @ts-ignore
            statuName = <ElTag type="danger">超时未回调</ElTag>
          }

          const typeName =
            callbackTypeOptions.filter((l) => !!l.value).find((l) => l.value === callback_type)
              ?.label ?? ''
          return (
            <div class="flex flex-col gap-[10px]">
              {statuName && (
                <div>
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
    field: 'SortBy',
    label: t('paymentManagement.sortBy'),
    search: {
      component: 'Select',
      componentProps: {
        placeholder: t('paymentManagement.sortBy'),
        options: [
          { label: t('paymentManagement.order_time_0'), value: 'order_time_0' },
          { label: t('paymentManagement.order_time_1'), value: 'order_time_1' }
        ]
      }
    },
    table: {
      hidden: true
    }
  },
  {
    field: 'selectSearchType',
    label: t('paymentManagement.selectSearchType'),
    search: {
      component: 'Select',
      componentProps: {
        placeholder: t('paymentManagement.selectSearchType'),
        options: [
          { label: t('paymentManagement.merchantID'), value: 'merchant_id' },
          { label: t('paymentManagement.merchantName'), value: 'merchant_name' },
          // { label: t('paymentManagement.bankcardAccount'), value: 'bankcard_account' },
          { label: t('paymentManagement.orderID'), value: 'order_id' },
          { label: t('paymentManagement.merchantOrderID'), value: 'merchant_order_id' },
          { label: '三方订单号', value: 'channel_order_id' },
          { label: '三方名称', value: 'three_party_name' },
          { label: t('paymentManagement.orderAmount'), value: 'order_amount' },
          { label: t('paymentManagement.actualAmount'), value: 'actual_amount' },
          { label: t('paymentManagement.receiveAccount'), value: 'receive_account' },
          { label: t('paymentManagement.receiveOwner'), value: 'receive_owner' },
          { label: '银行名称', value: 'bank_name' }
        ]
      }
    },
    table: {
      hidden: true
    }
  },
  {
    field: 'SearchContent',
    label: t('paymentManagement.searchContent'),
    search: {
      component: 'Input',
      componentProps: {
        placeholder: t('paymentManagement.searchContent')
      }
    },
    table: {
      hidden: true
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
    table: { hidden: true }
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
    table: { hidden: true }
  },
  {
    field: 'callback_time',
    label: t('paymentManagement.callbackTime'),
    search: {
      hidden: true
    },
    form: {
      component: 'DatePicker',
      componentProps: {
        type: 'datetimerange'
        // valueFormat: 'YYYY-MM-DD HH:mm:ss'
      }
    },
    table: { hidden: true }
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

          return (
            <div class="flex flex-col items-center gap-[10px]">
              {order_time && (
                <ElTooltip
                  content={t('paymentManagement.orderTime')}
                  /* 订单时间 */ placement="right"
                >
                  <BaseButton>{order_time}</BaseButton>
                </ElTooltip>
              )}
              {pay_time && (
                <ElTooltip
                  content={t('paymentManagement.paymentTime')}
                  /* 支付时间 */ placement="right"
                >
                  <BaseButton class="!m-0">{pay_time}</BaseButton>
                </ElTooltip>
              )}
              {callback_time && (
                <ElTooltip
                  content={t('paymentManagement.callbackTime')}
                  /* 回调时间 */ placement="right"
                >
                  <BaseButton class="!m-0"> {callback_time}</BaseButton>
                </ElTooltip>
              )}
            </div>
          )
        }
      }
    }
  },
  {
    field: 'Operate',
    label: t('paymentManagement.operate'),
    // fixed: 'right',
    'min-width': 180,
    search: {
      hidden: true
    },
    table: {
      slots: {
        default: (data: any) => {
          const row = data.row
          return (
            <div style="display: flex; flex-wrap: wrap; justify-content: center; align-items: center;">
              {/* TODO */}
              {hasPermi('payoutOrderPassing') && (
                <BaseButton type="text" onClick={() => showNodeModal(row, 'payOrder')}>
                  {/* 通过 */}
                  {t('common.pass')}
                </BaseButton>
              )}
              {hasPermi('payoutOrderPassing') && (
                <el-divider direction="vertical" class="w-[1px] h-[16px] bg-[#dfe6ec]" />
              )}

              {hasPermi('payoutReject') && (
                <BaseButton type="text" onClick={() => showRejectModal(row)}>
                  {/* 驳回订单 */}
                  {t('paymentManagement.rejectOrder')}
                </BaseButton>
              )}
              {hasPermi('payoutReject') && (
                <el-divider direction="vertical" class="w-[1px] h-[16px] bg-[#dfe6ec]" />
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
                        {hasPermi('payoutSfcreateOrder') && (
                          <ElDropdownItem key={'1'} onClick={() => showTripartiteModal(row)}>
                            {t('paymentManagement.requestThirdPartyOrder')} {/* 请求三方下单 */}
                          </ElDropdownItem>
                        )}
                        {hasPermi('payoutSfCallbackLog') && (
                          <ElDropdownItem key={'4'} onClick={() => gotoThreeRecord(row.order_id)}>
                            三方回调记录
                          </ElDropdownItem>
                        )}
                        {hasPermi('payoutQueryOrder') && (
                          <ElDropdownItem
                            key={'3'}
                            onClick={() => payoutOperate(row.uuid, 'orderSfQuery')}
                          >
                            {t('paymentManagement.orderQuery')} {/* 订单查询 */}
                          </ElDropdownItem>
                        )}
                        {hasPermi('payoutOrderCallback') && (
                          <ElDropdownItem
                            key={'2'}
                            onClick={() => payoutOperate(row.uuid, 'callbackOrder')}
                          >
                            {t('paymentManagement.callbackOrder')} {/* 回调订单 */}
                          </ElDropdownItem>
                        )}
                        {hasPermi('payoutCatCallbackLog') && (
                          <ElDropdownItem key={'5'} onClick={() => gotoRecord(row.order_id)}>
                            {t('collectionManagement.callbackRecord')} {/* 回调记录 */}
                          </ElDropdownItem>
                        )}
                        {hasPermi('payoutOrderProcess') && (
                          <ElDropdownItem key={'6'} onClick={() => showDetailModal(row)}>
                            {t('paymentManagement.orderProcess')} {/* 订单流程 */}
                          </ElDropdownItem>
                        )}
                        {hasPermi('payoutUpdateNote') && (
                          <ElDropdownItem
                            key={'7'}
                            onClick={() => showNodeModal(row, 'updateNote')}
                          >
                            {t('paymentManagement.updateRemark')} {/* 更新备注 */}
                          </ElDropdownItem>
                        )}
                        {hasPermi('payoutGfkjt') && (
                          <ElDropdownItem key={'8'} onClick={() => showPayPicModal(row)}>
                            获取三方支付图
                          </ElDropdownItem>
                        )}

                        <ElDropdownItem key={'9'} onClick={() => openDetailDrawer(row)}>
                          详细信息
                        </ElDropdownItem>
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

const dialogVisible = ref(false)
const dialogTitle = ref('')

const showExportOrderData = async () => {
  try {
    const currentValues = await searchRef.value.getFormData()
    processParams(currentValues)
    await ElMessageBox.confirm(
      t('paymentManagement.confirmExportData'),
      t('paymentManagement.warning'),
      {
        confirmButtonText: t('paymentManagement.ok'),
        cancelButtonText: t('paymentManagement.cancel'),
        type: 'warning'
      }
    )
    // If the user confirms, proceed to export
    const res = await exportPayOrderApi(searchParams.value)
    if (res?.success) {
      ElMessage.success(res.message)
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    // Handles user cancelation or other errors
    console.log('Action canceled or an error occurred:', error)
  }
}

const batchReject = async () => {
  if (!ids.value.length) {
    ElMessage.error('请选择单号')
    return
  }

  rejectVisible.value = true
  currentRow.value = undefined
}

const statisticsData = ref<StaData>()

const showOrderStatistics = async () => {
  const currentValues = await searchRef.value.getFormData()
  processParams(currentValues)
  appStore.pageLoading = true
  try {
    const res = await getPayConfigStatisticsApi(searchParams.value)
    if (res && res.data) {
      statisticsData.value = res.data
    }
  } catch (error) {
    console.log(error)
  } finally {
    appStore.pageLoading = false
  }

  dialogVisible.value = true
  dialogTitle.value = t('paymentManagement.statistics')
}

const currentRow = ref()
const saveLoading = ref(false)
const detailVisible = ref(false)

const createOrderVisible = ref(false)
const createOrderFormRef = ref()

const showDetailModal = (row) => {
  detailVisible.value = true
  currentRow.value = row
}

const noteVisible = ref(false)
const noteAction = ref<'updateNote' | 'payOrder'>('updateNote')
const noteFormRef = ref()

const showNodeModal = (row, action: 'updateNote' | 'payOrder') => {
  noteAction.value = action
  noteVisible.value = true
  currentRow.value = row
}

const rejectVisible = ref(false)
const rejectFormRef = ref()

const showRejectModal = (row) => {
  rejectVisible.value = true
  currentRow.value = row
}

const tripartiteVisible = ref(false)
const tripartiteFormRef = ref()

const showTripartiteModal = (row) => {
  tripartiteVisible.value = true
  currentRow.value = row
}

const showBatchOrderModal = (row) => {
  createOrderVisible.value = true
  currentRow.value = row
}

const detailDrawerVisible = ref(false) // 控制抽屉显示

// 打开详情抽屉的方法
const openDetailDrawer = (row: any) => {
  currentRow.value = row
  detailDrawerVisible.value = true
}

const showPayPicModal = async (row) => {
  // 1. 开启 Loading，提示用户正在获取
  const loadingInstance = ElLoading.service({
    lock: true,
    text: '正在获取支付凭证...', // 自定义提示文案
    background: 'rgba(0, 0, 0, 0.7)' // 遮罩颜色
  })

  const res = await fetchPayoutApi({ action: 'payout_certificate', data_uuid: row.uuid })
  if (!res.success) {
    loadingInstance.close() // 失败需手动关闭 loading
    ElMessage.error(res.message)
    return
  }

  let imgUrl = res.data?.payImg ?? ''
  if (res.data.type === 'html' && res.data?.payImg) {
    const [one, ...other] = imgUrl.split(';')
    imgUrl = ['data:text/html', ...other].join(';')
    loadingInstance.close()
    ElMessageBox.alert(
      <iframe
        style={{ width: '480px', height: '480px', border: 'none', overflow: 'hidden' }}
        src={imgUrl}
      ></iframe>,
      '获取三方支付图',
      {
        confirmButtonText: t('dialogDemo.close'),
        dangerouslyUseHTMLString: true,
        customStyle: {
          '--el-messagebox-width': '500px', // 适当加宽弹窗
          width: '500px!important'
        }
      }
    )

    return
  }

  if (!imgUrl) {
    loadingInstance.close()
    ElMessage.warning('未获取到图片地址')
    return
  }

  const imgObj = new Image()
  imgObj.src = imgUrl

  // 图片加载成功的回调
  imgObj.onload = () => {
    loadingInstance.close() // 图片好了，关闭 Loading

    // 4. 显示弹窗 (使用 ElImage 组件体验更好，支持预览大图)
    // 注意：这里需要引入 ElImage，或者如果你没有自动引入，可以使用普通的 img 标签
    ElMessageBox.alert(
      <div class="flex justify-center items-center">
        {/* 使用 max-h-[400px] 防止图片过高撑爆屏幕 */}
        <img src={imgUrl} style="max-width: 100%; max-height: 480px; object-fit: contain;" />
      </div>,
      '获取三方支付图',
      {
        confirmButtonText: t('dialogDemo.close'),
        dangerouslyUseHTMLString: true,
        customStyle: {
          '--el-messagebox-width': '480px', // 适当加宽弹窗
          width: '480px!important'
        }
      }
    )
  }

  // 图片加载失败的回调
  imgObj.onerror = () => {
    loadingInstance.close()
    ElMessage.error('图片资源加载失败')
  }
}

const batchSubSfPay = async () => {
  if (ids.value.length === 0) {
    ElMessage.error(t('common.selectData')) /* 请选择数据 */
    return
  }

  try {
    const newValues = {
      action: 'batchSubSfPayOrder',
      select_uuids: ids.value
    }
    const res = await fetchPayoutApi(newValues)
    const tableRef = await getElTableExpose()

    if (res?.success) {
      const msg = t('common.successOperation')
      // @ts-ignore
      tableRef?.clearSelection()
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

const payoutOperate = async (uuid: string, action: string) => {
  try {
    const newValues = {
      action,
      data_uuid: uuid
    }
    const res = await fetchPayoutApi(newValues)

    if (res?.success) {
      const msg = action === 'orderSfQuery' ? res.message : t('common.successOperation')
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
    const res = await fetchPayoutApi(newValues)

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

const updateReject = async () => {
  const rejectForm = unref(rejectFormRef)
  const formData = await rejectForm?.submit()

  if (!formData) return

  const { reason_msg } = formData
  let newValues: RejectValue = {
    action: ''
  }

  if (currentRow.value) {
    newValues = {
      action: 'is_reject_pay',
      data_uuid: currentRow.value.uuid,
      reason_msg
    }
  }

  if (!currentRow.value && ids.value?.length > 0) {
    newValues = {
      action: 'batch_reject_order',
      data_uuids: ids.value,
      remark_text: reason_msg
    }
  }

  saveLoading.value = true
  try {
    const res = await fetchPayoutApi(newValues)

    if (res?.success) {
      ElMessage.success(t('common.successOperation'))
    } else {
      ElMessage.error(res.message)
      return
    }
    if (newValues.action === 'batch_reject_order') {
      const tableRef = await getElTableExpose()
      // @ts-ignore
      tableRef?.clearSelection()
    }
    rejectVisible.value = false
    getList()
  } catch (error) {
    console.log(error)
  } finally {
    saveLoading.value = false
  }
}

const updateTripartite = async () => {
  const tripartiteForm = unref(tripartiteFormRef)
  const formData = await tripartiteForm?.submit()

  if (!formData) return
  try {
    const newValues = {
      ...formData,
      action: 'subSfPayOrder',
      data_uuid: currentRow.value.uuid
    }
    saveLoading.value = true
    const res = await fetchPayoutApi(newValues)

    if (res?.success) {
      const msg = t('common.successOperation')
      ElMessage.success(msg)
    } else {
      ElMessage.error(res.message)
      return
    }
    tripartiteVisible.value = false
    getList()
  } catch (error) {
    console.log(error)
  } finally {
    saveLoading.value = false
  }
}

const saveBatchOrder = async () => {
  const createOrderForm = unref(createOrderFormRef)
  const formData = await createOrderForm?.submit()

  if (!formData) return
  try {
    const newValues = {
      ...formData,
      action: 'batchCreateOrder'
    }

    appStore.pageLoading = true
    const res = await fetchPayoutApi(newValues)

    if (res?.success) {
      const msg = t('common.successOperation')
      ElMessage.success(msg)
    } else {
      ElMessage.error(res.message)
      return
    }
    createOrderVisible.value = false
    getList()
  } catch (error) {
    console.log(error)
  } finally {
    appStore.pageLoading = false
  }
}

const gotoRecord = (orderId: string) => {
  router.push(
    `/ordermanagement/callbackrecord?order_id=${orderId}&create_time=${searchParams.value.order_time ?? ''}`
  )
}

const gotoThreeRecord = (orderId: string) => {
  router.push(`/APIlogs/systemAPIlog?order_id=${orderId}`)
}

const selectionChange = (ret) => {
  ids.value = ret.map((l) => l.uuid)
}
</script>

<template>
  <div>
    <ContentWrap class="search-section">
      <div class="log-search" :style="{ fontSize: '12px!important' }">
        <!-- <p style="min-width: 50px; padding-top: 8px">{{ t('common.search') }} :</p> -->
        <Search
          ref="searchRef"
          :model="{
            order_time: [todayStart, tomorrowStart]
          }"
          :schema="allSchemas.searchSchema"
          @search="setSearchParams"
          @reset="setSearchParams"
        >
          <template #moreBtn>
            <div class="mx-10px">
              <ElDropdown
                trigger="click"
                type="warning"
                @click="handleManualClick"
                @command="handleCommand"
              >
                <BaseButton type="warning" :icon="Refresh"
                  >刷新 {{ isActive ? `(${count})` : '' }}
                </BaseButton>

                <!-- 下拉菜单 -->
                <template #dropdown>
                  <ElDropdownMenu>
                    <!-- 动态生成样式，高亮当前选中的选项 -->
                    <ElDropdownItem :command="0" :class="{ 'active-item': activeInterval === 0 }">
                      暂不处理
                    </ElDropdownItem>
                    <ElDropdownItem
                      v-for="time in [10, 20, 30, 60]"
                      :key="time"
                      :command="time"
                      :class="{ 'active-item': activeInterval === time }"
                    >
                      {{ time }}秒自动刷新
                    </ElDropdownItem>
                  </ElDropdownMenu>
                </template>
              </ElDropdown>
            </div>
            <BaseButton
              v-if="hasPermi('payoutExportData')"
              :icon="Download"
              type="warning"
              @click="showExportOrderData"
            >
              {{ t('paymentManagement.exportOrderData') }}
            </BaseButton>
            <BaseButton
              v-if="hasPermi('payoutTotal')"
              :icon="Histogram"
              type="warning"
              @click="showOrderStatistics"
            >
              {{ t('paymentManagement.statistics') }}
            </BaseButton>
            <BaseButton v-if="hasPermi('payoutReject')" type="warning" @click="batchReject"
              >批量驳回</BaseButton
            >

            <!-- "批量创建订单权限" -->
            <BaseButton
              v-if="hasPermi('payoutCreateOrder')"
              type="warning"
              @click="showBatchOrderModal"
              >批量创建订单</BaseButton
            >
            <BaseButton v-if="hasPermi('payoutPlzfsf')" type="warning" @click="batchSubSfPay">批量转发其他三方</BaseButton>
          </template>
        </Search>
      </div>
    </ContentWrap>
    <ContentWrap :style="{ minHeight: '700px' }">
      <Table
        class="text-12px"
        row-key="uuid"
        v-model:pageSize="pageSize"
        v-model:currentPage="currentPage"
        :columns="allSchemas.tableColumns"
        :data="dataList"
        :loading="loading"
        :pagination="{
          total: total
        }"
        @register="tableRegister"
        @selection-change="selectionChange"
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
          {{ t('statisticsData.orderAmount') + ' :' }}
        </ElCol>
        <ElCol :span="11" :tag="'span'" style="color: black; padding: 10px">
          {{ statisticsData ? statisticsData.order_amount_total : ' ' }}
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="13" :tag="'span'" style="text-align: right; padding: 10px">
          {{ t('statisticsData.orderHandlingFee') + ' :' }}
        </ElCol>
        <ElCol :span="11" :tag="'span'" style="color: black; padding: 10px">
          {{ statisticsData ? statisticsData.repay_amount_total : ' ' }}
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="13" :tag="'span'" style="text-align: right; padding: 10px">
          {{ t('statisticsData.numberOfOrder') + ' :' }}
        </ElCol>
        <ElCol :span="11" :tag="'span'" style="color: black; padding: 10px">
          {{ statisticsData ? statisticsData.total_order_count : ' ' }}
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="13" :tag="'span'" style="text-align: right; padding: 10px">
          {{ t('statisticsData.paymentAmount') + ' :' }}
        </ElCol>
        <ElCol :span="11" :tag="'span'" style="color: black; padding: 10px">
          {{ statisticsData ? statisticsData.actual_amount_total : ' ' }}
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="13" :tag="'span'" style="text-align: right; padding: 10px">
          {{ t('statisticsData.paymentFee') + ' :' }}
        </ElCol>
        <ElCol :span="11" :tag="'span'" style="color: black; padding: 10px">
          {{ statisticsData ? statisticsData.pay_repay_amount_total : ' ' }}
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="13" :tag="'span'" style="text-align: right; padding: 10px">
          {{ t('statisticsData.payments') + ' :' }}
        </ElCol>
        <ElCol :span="11" :tag="'span'" style="color: black; padding: 10px">
          {{ statisticsData ? statisticsData.total_pay_count : ' ' }}
        </ElCol>
      </ElRow>

      <ElRow>
        <ElCol :span="13" :tag="'span'" style="text-align: right; padding: 10px">
          {{ t('statisticsData.callbacks') + ' :' }}
        </ElCol>
        <ElCol :span="11" :tag="'span'" style="color: black; padding: 10px">
          {{ statisticsData ? statisticsData.callback_order_count : ' ' }}
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="13" :tag="'span'" style="text-align: right; padding: 10px">
          {{ t('statisticsData.callbackAmount') + ' :' }}
        </ElCol>
        <ElCol :span="11" :tag="'span'" style="color: black; padding: 10px">
          {{ statisticsData ? statisticsData.callback_amount_total : ' ' }}
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="13" :tag="'span'" style="text-align: right; padding: 10px">
          {{ t('statisticsData.numberFailedCallback') + ' :' }}
        </ElCol>
        <ElCol :span="11" :tag="'span'" style="color: black; padding: 10px">
          {{ statisticsData ? statisticsData.nf_callback_count : ' ' }}
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="13" :tag="'span'" style="text-align: right; padding: 10px">
          {{ t('statisticsData.failureAmount') + ' :' }}
        </ElCol>
        <ElCol :span="11" :tag="'span'" style="color: black; padding: 10px">
          {{ statisticsData ? statisticsData.nf_callback_amount : ' ' }}
        </ElCol>
      </ElRow>
    </Dialog>

    <OrderInfo v-model="detailVisible" :detailVisible="detailVisible" :row="currentRow" />

    <Dialog v-model="noteVisible" :title="t('paymentManagement.updateRemark')">
      <div class="mr-20px">
        <NoteForm ref="noteFormRef" :row="currentRow" />
      </div>
      <template #footer>
        <BaseButton type="primary" :loading="saveLoading" @click="updateNote">
          {{ t('exampleDemo.save') }}
        </BaseButton>
        <BaseButton @click="noteVisible = false">{{ t('dialogDemo.close') }}</BaseButton>
      </template>
    </Dialog>

    <Dialog v-model="rejectVisible" :title="t('paymentManagement.rejectOrderCallback')">
      <div class="mr-20px">
        <RejectForm ref="rejectFormRef" :row="currentRow" />
      </div>
      <template #footer>
        <BaseButton type="primary" :loading="saveLoading" @click="updateReject">
          {{ t('exampleDemo.save') }}
        </BaseButton>
        <BaseButton @click="rejectVisible = false">{{ t('dialogDemo.close') }}</BaseButton>
      </template>
    </Dialog>

    <Dialog v-model="tripartiteVisible" title="请求三方下单" width="500px">
      <div class="mr-20px min-h-[200px]">
        <TripartiteForm ref="tripartiteFormRef" :row="currentRow" />
      </div>
      <template #footer>
        <BaseButton type="primary" :loading="saveLoading" @click="updateTripartite">
          {{ t('exampleDemo.save') }}
        </BaseButton>
        <BaseButton @click="tripartiteVisible = false">{{ t('dialogDemo.close') }}</BaseButton>
      </template>
    </Dialog>

    <Dialog v-model="createOrderVisible" title="批量创建订单">
      <div class="mr-20px">
        <CreateOrderForm ref="createOrderFormRef" :row="currentRow" />
      </div>
      <template #footer>
        <BaseButton type="primary" :loading="saveLoading" @click="saveBatchOrder">
          {{ t('exampleDemo.save') }}
        </BaseButton>
        <BaseButton @click="createOrderVisible = false">{{ t('dialogDemo.close') }}</BaseButton>
      </template>
    </Dialog>

    <DetailDrawer v-model="detailDrawerVisible" :current-row="currentRow" />
  </div>
</template>
<style lang="less" scoped>
/* //search-section */

//
</style>
