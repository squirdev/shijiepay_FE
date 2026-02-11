<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/CustomSearch'
import { useI18n } from '@/hooks/web/useI18n'
import { useRouter } from 'vue-router'
import { Table, TableColumn } from '@/components/Table'
import {
  batchDistributiontApi,
  exportBatchDistributiontApi,
  fetchBatchDistributiontApi,
  fetchTunnelTypeApi,
  getBatchDistributiontStatisticsApi
} from '@/api/paymentmanagement'
import { useAppStore } from '@/store/modules/app'
import { useTable } from '@/hooks/web/useTable'
import { ref, unref, reactive, onMounted } from 'vue'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { Breadcrumb } from '@/components/Breadcrumb'
import { useEventBus } from '@/hooks/event/useEventBus'
import { formatToDate, todayStart, tomorrowStart } from '@/utils/dateUtil'
import { Dialog } from '@/components/Dialog'
import {
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElMessage,
  ElMessageBox,
  ElTag,
  ElText,
  ElTooltip,
  ElRow,
  ElCol
} from 'element-plus'
import { BaseButton } from '@/components/Button'
import BatchCreateModal from './components/BatchCreateModal'
import NoteForm from './components/NoteForm'
import OrderInfo from './components/OrderInfo'
import TripartiteForm from './components/TripartiteForm'
import { payStatuOptions, reviewStatusOptions } from '@/utils/options'
import { Histogram } from '@element-plus/icons-vue'
import BatchReviewModal from './components/BatchReviewModal'
import { hasPermi } from '@/components/Permission'

interface Option {
  label: string
  value: string
}

const router = useRouter()
const searchRef = ref()
const statisticsData = ref()
const threePartyOptions = ref<Option[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const ids = ref<string[]>([])
const appStore = useAppStore()

const getThreePartyOptions = async () => {
  try {
    const res = (await batchDistributiontApi({
      action: 'getThreePartyDatas'
    })) as unknown as Record<string, any>

    if (!res?.success) return

    threePartyOptions.value = Object.values(res.data).map((item) => ({
      label: item.name,
      value: item.uuid
    }))
  } catch (error) {
    console.error('Failed to fetch module codes:', error)
  }
}

onMounted(() => {
  getThreePartyOptions()
})

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await fetchBatchDistributiontApi({
      pageIndex: unref(currentPage),
      pageSize: unref(pageSize),
      ...unref(searchParams)
    })

    return {
      list: res.data.list,
      // list: [{name: 1}],
      total: res.data.total
    }
  }
})

const { loading, dataList, total, currentPage, pageSize } = tableState
const { getList, getElTableExpose } = tableMethods

const currentDate = formatToDate(new Date())
const searchParams = ref({
  create_time: `${todayStart}|${tomorrowStart}`
})

const processParams = (newParams) => {
  if (newParams.create_time) {
    newParams.create_time = newParams.create_time.join('|')
  }
  searchParams.value = newParams
}

const setSearchParams = (params: any) => {
  const newParams = { ...params }
  processParams(newParams)
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
    field: 'selection',
    width: 50,
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
    label: '订单号',
    'min-width': 140,
    search: {
      hidden: true
    }
  },
  {
    field: 'three_party_uuid',
    label: '三方选择',
    width: 120,
    search: {
      component: 'Select',
      componentProps: {
        options: threePartyOptions
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
          { label: '订单号', value: 'order_id' },
          { label: '卡号', value: 'payee_account' },
          { label: '备注', value: 'note' },
          { label: '操作人', value: 'processor_account' },
          { label: '审核人', value: 'scientist_account' }
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
    field: 'info',
    label: '三方信息',
    'min-width': 160,
    search: {
      hidden: true
    },
    table: {
      'show-overflow-tooltip': false,
      slots: {
        default: (data: any) => {
          const { three_party_name, sf_create_error_msg, tp_create_order_statu } = data.row

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
            </div>
          )
        }
      }
    }
  },
  {
    field: 'pay_info',
    label: '收款信息',
    'min-width': 140,
    search: {
      hidden: true
    },
    table: {
      slots: {
        default: (data: any) => {
          const { payee_bank_code, payee_account, payee_owner } = data.row

          return (
            // @ts-ignore
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
    field: 'pay_statu',
    label: '支付状态',
    'min-width': 80,
    search: {
      component: 'Select',
      componentProps: {
        placeholder: t('collectionManagement.paymentStatus'),
        options: payStatuOptions
      }
    },

    table: {
      'show-overflow-tooltip': false,
      slots: {
        default: (data: any) => {
          const { pay_statu, payout_error_msg } = data.row
          const name = payStatuOptions.find((l) => l.value === pay_statu)?.label
          if (pay_statu === 'ispay') {
            return <ElTag type="success">{name}</ElTag>
          } else if (pay_statu === 'pay_failed') {
            return (
              <ElTooltip placement="top" content={`失败原因: ${payout_error_msg ?? ''}`}>
                <ElTag type="danger" class="cursor-pointer">
                  {name}
                </ElTag>
              </ElTooltip>
            )
          } else if (['pay_timeout', 'pay_reject'].includes(pay_statu)) {
            return <ElTag type="danger">{name}</ElTag>
          } else {
            return <ElTag type="primary">{name}</ElTag>
          }
        }
      }
    }
  },
  {
    field: 'review_status',
    label: '审核状态',
    'min-width': 80,
    search: {
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: reviewStatusOptions
      }
    },
    table: {
      slots: {
        default: (data: any) => {
          const { review_status } = data.row
          const name = reviewStatusOptions.find((l) => l.value === review_status)?.label ?? ''
          if (review_status === 'military_core') {
            return <ElTag type="danger">{name}</ElTag>
          }

          if (['unknown_core', 'autonomous_laboratory'].includes(review_status)) {
            return <ElTag type="success">{name}</ElTag>
          }
        }
      }
    }
  },
  {
    field: 'scientist_account',
    label: '审核人',
    'min-width': 80,
    search: {
      hidden: true
    }
  },
  {
    field: 'order_amount',
    label: '金额',
    'min-width': 80,
    search: {
      hidden: true
    },
    table: {
      formatter: (_: any, __: TableColumn, cellValue: number) => {
        return cellValue ? Number(cellValue.toFixed(2)).toLocaleString() : 0
      }
    }
  },

  {
    field: 'total_payout_amount',
    label: '累计出款金额',
    'min-width': 80,
    search: {
      hidden: true
    },
    table: {
      formatter: (_: any, __: TableColumn, cellValue: number) => {
        return cellValue ? Number(cellValue.toFixed(2)).toLocaleString() : 0
      }
    }
  },

  {
    field: 'create_time',
    label: '时间',
    search: {
      component: 'DatePicker',
      componentProps: {
        type: 'datetimerange',
        placeholder: t('paymentManagement.time') /* 时间 */,
        valueFormat: 'YYYY-MM-DD HH:mm:ss'
      }
    },
    table: {
      slots: {
        default: (data: any) => {
          const { create_time, pay_time } = data.row

          return (
            <div class="flex flex-col items-center gap-[10px]">
              {create_time && (
                <ElTooltip content="创建时间" placement="top">
                  <BaseButton>{create_time}</BaseButton>
                </ElTooltip>
              )}
              {pay_time && (
                <ElTooltip content="成功时间" placement="top">
                  <BaseButton class="!m-0">{pay_time}</BaseButton>
                </ElTooltip>
              )}
            </div>
          )
        }
      }
    }
  },
  {
    field: 'note',
    label: '备注',
    search: {
      hidden: true
    }
  },

  {
    field: 'processor_account',
    label: '操作人',
    search: {
      hidden: true
    }
  },

  {
    field: 'Operate',
    label: t('paymentManagement.operate'),
    // fixed: 'right',
    'min-width': 100,
    search: {
      hidden: true
    },
    table: {
      slots: {
        default: (data: any) => {
          const row = data.row
          return (
            <div style="display: flex; flex-wrap: wrap; justify-content: center; align-items: center;">
              {hasPermi('batchDistributionUpdateNote') && (
                <>
                  <BaseButton type="text" onClick={() => showNodeModal(row)}>
                    {t('paymentManagement.updateRemark')} {/* 更新备注 */}
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
                        {hasPermi('batchDistributionSfxd') && (
                          <ElDropdownItem key={'1'} onClick={() => showTripartiteModal(row)}>
                            {t('paymentManagement.requestThirdPartyOrder')} {/* 请求三方下单 */}
                          </ElDropdownItem>
                        )}
                        <ElDropdownItem key={'4'} onClick={() => gotoThreeRecord(row.order_id)}>
                          三方回调记录
                        </ElDropdownItem>
                        {hasPermi('batchDistributionOrderProcess') && (
                          <ElDropdownItem key={'6'} onClick={() => showDetailModal(row)}>
                            {t('paymentManagement.orderProcess')} {/* 订单流程 */}
                          </ElDropdownItem>
                        )}
                        {hasPermi('batchDistributionJlgl') && (
                          <ElDropdownItem key={'7'} onClick={() => updatePayoutAmount(row)}>
                            出款积累归零
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

const saveLoading = ref(false)
const createVisible = ref(false)
const createFormRef = ref()

const handleSelectionChange = (selection: any[]) => {
  ids.value = selection.map((item) => item.uuid)
}

const showCreateModal = () => {
  getThreePartyOptions()
  createVisible.value = true
}
const reviewVisible = ref(false)
const showReviewModal = () => {
  if (!ids.value.length) {
    ElMessage.error(t('common.selectData')) /* 请选择数据 */
    return
  }
  reviewVisible.value = true
}

const reviewCallback = async () => {
  const tableRef = await getElTableExpose()
  // @ts-ignore
  tableRef?.clearSelection()
  currentPage.value = 1
  getList()
}

const showStatistics = async () => {
  const currentValues = await searchRef.value.getFormData()
  processParams(currentValues)
  appStore.pageLoading = true
  try {
    const res = await getBatchDistributiontStatisticsApi(searchParams.value)
    if (res && res.data) {
      statisticsData.value = res.data
    }
  } catch (error) {
    console.log(error)
  } finally {
    appStore.pageLoading = false
  }

  dialogVisible.value = true
  dialogTitle.value = '统计'
}

const updatePayoutAmount = async (row) => {
  const newValues = {
    action: 'reset_to_zero',
    data_uuid: row.uuid
  }

  await ElMessageBox.confirm('确认当前卡号，出款积累归零？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })

  saveLoading.value = true
  try {
    const res = await batchDistributiontApi(newValues)

    if (res?.success) {
      ElMessage.success(t('common.successOperation'))
    } else {
      ElMessage.error(res.message)
      return
    }

    getList()
  } catch (error) {
    console.log(error)
  } finally {
    saveLoading.value = false
  }
}

const gotoThreeRecord = (orderId: string) => {
  router.push(`/APIlogs/systemAPIlog?order_id=${orderId}`)
}

const noteVisible = ref(false)
const noteFormRef = ref()
const currentRow = ref()

const showNodeModal = (row) => {
  noteVisible.value = true
  currentRow.value = row
}

const updateNote = async () => {
  const noteForm = unref(noteFormRef)
  const formData = await noteForm?.submit()

  if (!formData) return

  const newValues = {
    action: 'updateNote',
    data_uuid: currentRow.value.uuid,
    new_note: '',
    ...formData
  }
  saveLoading.value = true
  try {
    const res = await batchDistributiontApi(newValues)

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

const detailVisible = ref(false)

const showDetailModal = (row) => {
  detailVisible.value = true
  currentRow.value = row
}

const tripartiteVisible = ref(false)
const tripartiteFormRef = ref()

const showTripartiteModal = (row) => {
  tripartiteVisible.value = true
  currentRow.value = row
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
    const res = await batchDistributiontApi(newValues)

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

const handleExport = async () => {
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
        const res = await exportBatchDistributiontApi(searchParams.value)
        ElMessage.success(res?.message || '导出成功')
      } catch (error) {
        console.log(error)
      } finally {
        saveLoading.value = false
      }
    })
    .catch(() => {})
}
</script>

<template>
  <div>
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
              v-if="hasPermi('batchDistributionTotal')"
              :icon="Histogram"
              type="warning"
              @click="showStatistics"
            >
              {{ t('paymentManagement.statistics') }}
            </BaseButton>
            <BaseButton
              v-if="hasPermi('batchDistributionAdd')"
              type="warning"
              @click="showCreateModal"
              >批量添加下发</BaseButton
            >
            <BaseButton
              v-if="hasPermi('batchDistributionReview')"
              type="warning"
              @click="showReviewModal"
              >批量审核</BaseButton
            >
            <BaseButton
              v-if="hasPermi('batchDistributionExportData')"
              type="warning"
              :loading="saveLoading"
              @click="handleExport"
              >导出</BaseButton
            >
          </template>
        </Search>
      </div>
    </ContentWrap>

    <ContentWrap :style="{ minHeight: '700px' }">
      <Table
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
        @selection-change="handleSelectionChange"
      >
        <template #empty>
          <div style="text-align: center; padding: 40px; color: #999">
            <img src="@/assets/imgs/no_data.png" style="width: 120px" />
            <p style="line-height: 30px">{{ t('common.noData') }}</p>
          </div>
        </template>
      </Table>
    </ContentWrap>

    <BatchCreateModal
      v-model:visible="createVisible"
      :three-party-options="threePartyOptions"
      :save-callback="getList"
    />

    <BatchReviewModal v-model:visible="reviewVisible" :ids="ids" :save-callback="reviewCallback" />

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

    <OrderInfo v-model="detailVisible" :detailVisible="detailVisible" :row="currentRow" />
    <Dialog v-model="tripartiteVisible" title="请求三方下单">
      <div class="mr-20px">
        <TripartiteForm
          ref="tripartiteFormRef"
          :row="currentRow"
          :threePartyOptions="threePartyOptions"
        />
      </div>
      <template #footer>
        <BaseButton type="primary" :loading="saveLoading" @click="updateTripartite">
          {{ t('exampleDemo.save') }}
        </BaseButton>
        <BaseButton @click="tripartiteVisible = false">{{ t('dialogDemo.close') }}</BaseButton>
      </template>
    </Dialog>

    <Dialog v-model="dialogVisible" title="统计">
      <ElRow>
        <ElCol :span="13" :tag="'span'" style="text-align: right; padding: 10px">
          总订单金额 :
        </ElCol>
        <ElCol :span="11" :tag="'span'" style="color: black; padding: 10px">
          {{ statisticsData ? statisticsData.order_amount_total : ' ' }}
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="13" :tag="'span'" style="text-align: right; padding: 10px">
          总订单笔数 :
        </ElCol>
        <ElCol :span="11" :tag="'span'" style="color: black; padding: 10px">
          {{ statisticsData ? statisticsData.total_order_count : ' ' }}
        </ElCol>
      </ElRow>

      <ElRow>
        <ElCol :span="13" :tag="'span'" style="text-align: right; padding: 10px">
          支付成功金额
        </ElCol>
        <ElCol :span="11" :tag="'span'" style="color: black; padding: 10px">
          {{ statisticsData ? statisticsData.pay_success_amount : ' ' }}
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="13" :tag="'span'" style="text-align: right; padding: 10px">
          支付成功䇭数
        </ElCol>
        <ElCol :span="11" :tag="'span'" style="color: black; padding: 10px">
          {{ statisticsData ? statisticsData.pay_success_count : ' ' }}
        </ElCol>
      </ElRow>
    </Dialog>
  </div>
</template>
