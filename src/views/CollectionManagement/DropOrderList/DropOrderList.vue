<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/CustomSearch'
import { Dialog } from '@/components/Dialog'
import { useI18n } from '@/hooks/web/useI18n'
import { Table, TableColumn } from '@/components/Table'
import { getDropOrderListApi, dropOrderListApi } from '@/api/collectionmanagement'
import { useTable } from '@/hooks/web/useTable'
import { useAppStore } from '@/store/modules/app'
import { ref, unref, reactive } from 'vue'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { Breadcrumb } from '@/components/Breadcrumb'
import { formatToDate, todayStart, tomorrowStart } from '@/utils/dateUtil'
import { BaseButton } from '@/components/Button'
import {
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElLoading,
  ElMessage,
  ElMessageBox,
  ElTag,
  ElTooltip
} from 'element-plus'
import NoteForm from './components/NoteForm'
import { hasPermi } from '@/components/Permission'
import { copyToClipboard } from '@/utils'

const ids = ref<string[]>([])
const searchRef = ref()
const appStore = useAppStore()

const dealwithStatuOptions = [
  {
    label: '已处理',
    value: true
  },
  {
    label: '未处理',
    value: false
  }
]

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getDropOrderListApi({
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
const setSearchParams = (params: any) => {
  if (params.order_time) {
    params.order_time = params.order_time.join('|')
  }
  if (params.lose_dealwith_time) {
    params.lose_dealwith_time = params.lose_dealwith_time.join('|')
  }
  searchParams.value = params
  getList()
}

const { t } = useI18n()

const payOperate = async (uuid: string, action: string) => {
  try {
    const newValues = {
      action,
      data_uuid: uuid
    }
    const res = await dropOrderListApi(newValues)

    if (res?.success) {
      ElMessage.success(t('common.successOperation'))
    } else {
      ElMessage.error(res.message)
      return
    }

    getList()
  } catch (error) {
    console.log(error)
  }
}

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
          { label: t('merchantList.merchantID'), value: 'merchant_id' },
          { label: t('collectionManagement.merchantOrderNumber'), value: 'merchant_name' },
          { label: t('collectionManagement.orderAmount'), value: 'order_amount' }
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
    label: '单号信息',
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
    'min-width': 210,
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
    'min-width': 180,
    table: {
      slots: {
        default: (data: any) => {
          const { sf_name, payment_channel_name, country } = data.row

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
    field: 'order_amount',
    label: t('collectionManagement.orderAmount'),
    width: 160,
    search: {
      hidden: true
    },
    formatter: (_: any, __: TableColumn, cellValue: number) => {
      return cellValue ? Number(cellValue.toFixed(2)).toLocaleString() : 0
    }
  },
  {
    field: 'actual_amount',
    label: t('collectionManagement.paymentAmount'),
    width: 160,
    search: {
      hidden: true
    },
    formatter: (_: any, __: TableColumn, cellValue: number) => {
      return cellValue ? Number(cellValue.toFixed(2)).toLocaleString() : 0
    }
  },
  {
    field: 'tunnel_name',
    label: t('collectionManagement.source'),
    search: {
      hidden: true
    }
  },
  {
    field: 'lose_reason',
    label: t('collectionManagement.reason'),
    search: {
      component: 'Input',
      componentProps: {
        placeholder: t('collectionManagement.reason')
      }
    },
    table: {
      'show-overflow-tooltip': false
    }
  },
  {
    field: 'lose_dealwith_statu',
    label: t('collectionManagement.processingStatus'),
    search: {
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: dealwithStatuOptions
      }
    },
    table: {
      slots: {
        default: (data: any) => {
          const { lose_dealwith_statu } = data.row

          if (lose_dealwith_statu) {
            return <ElTag type="success">已处理</ElTag>
          } else {
            return <ElTag type="danger">未处理</ElTag>
          }
        }
      }
    }
  },
  {
    field: 'lose_note',
    label: t('collectionManagement.remark'),
    search: {
      hidden: true
    }
  },
  {
    field: 'order_time',
    label: t('collectionManagement.orderTime'),
    table: {
      slots: {
        default: ({ row }) => {
          const time = row.order_time
          if (!time) return '-'
          const showTime = time.split(' ')[1] // 显示 HH:mm:ss

          return (
            <ElTooltip effect="dark" placement="right" content={time}>
              <span class="cursor-pointer">{showTime}</span>
            </ElTooltip>
          )
        }
      }
    },
    formatter: (_row, _column, cellValue) => {
      if (!cellValue) return '-'
      const showTime = cellValue.split(' ')[1]
      return `${showTime}`
    },
    search: {
      component: 'DatePicker',
      componentProps: {
        type: 'datetimerange',
        startPlaceholder: t('collectionManagement.orderStartTime'),
        endPlaceholder: t('collectionManagement.orderEndTime'),
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
        onChange: (val) => {
          if (!val) return
          searchRef.value?.setValues({ lose_dealwith_time: null })
        }
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
    field: 'lose_dealwith_time',
    label: '处理时间',
    table: {
      slots: {
        default: ({ row }) => {
          const time = row.lose_dealwith_time
          if (!time) return '-'
          const showTime = time.split(' ')[1] // 显示 HH:mm:ss

          return (
            <ElTooltip effect="dark" placement="right" content={time}>
              <span class="cursor-pointer">{showTime}</span>
            </ElTooltip>
          )
        }
      }
    },
    formatter: (_row, _column, cellValue) => {
      if (!cellValue) return '-'
      const showTime = cellValue.split(' ')[1] // 取 HH:mm:ss
      return `${showTime}` // 显示 原始时间在右侧
    },
    search: {
      component: 'DatePicker',
      componentProps: {
        type: 'datetimerange',
        startPlaceholder: t('collectionManagement.processingStartTime'),
        endPlaceholder: t('collectionManagement.processingEndTime'),
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
        onChange: (val) => {
          if (!val) return
          searchRef.value?.setValues({ order_time: null })
        }
      }
    }
  },
  {
    field: 'Operate',
    label: t('collectionManagement.operate'),
    fixed: 'right',
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
              <BaseButton type="text" onClick={() => payOperate(row.uuid, 'callbackOrder')}>
                点击回调
              </BaseButton>
              <el-divider direction="vertical" class="w-[1px] h-[16px] bg-[#dfe6ec]" />
              {hasPermi('loseOrderUpdateNote') && (
                <BaseButton type="text" onClick={() => showNodeModal(row)}>
                  更新备注
                </BaseButton>
              )}
              <el-divider direction="vertical" class="w-[1px] h-[16px] bg-[#dfe6ec]" />
              {hasPermi('loseOrderClzt') && (
                <BaseButton type="text" key={'2'} onClick={() => updateStatus(row)}>
                  更新状态
                </BaseButton>
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

const currentRow = ref()
const saveLoading = ref(false)
const detailVisible = ref(false)
const noteVisible = ref(false)
const noteFormRef = ref()

const showDetailModal = (row) => {
  detailVisible.value = true
  currentRow.value = row
}

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
    lose_note: '',
    ...formData
  }
  saveLoading.value = true
  try {
    const res = await dropOrderListApi(newValues)

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

const handleSelectionChange = (selection: any[]) => {
  ids.value = selection.map((item) => item.uuid)
}

const isBatch = ref(false)

const batchCallback = async () => {
  if (!ids.value.length) {
    ElMessage.error('请选择订单')
    return
  }

  await ElMessageBox.confirm(t('merchantList.confirmOperation'), t('common.delWarning'), {
    confirmButtonText: t('common.delOk'),
    cancelButtonText: t('common.delCancel'),
    type: 'warning'
  })

  const newValues = {
    action: 'batchCallbackOrder',
    select_uuids: ids.value
  }

  // 1. 开启 Loading，提示用户正在获取
  const loadingInstance = ElLoading.service({
    lock: true,
    text: '正在批量回调...', // 自定义提示文案
    background: 'rgba(0, 0, 0, 0.7)' // 遮罩颜色
  })
  try {
    const res = await dropOrderListApi(newValues)
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
    loadingInstance.close()
  }
}

const updateStatus = async (row) => {
  ElMessageBox.confirm(t('merchantList.confirmOperation'), t('common.delWarning'), {
    confirmButtonText: t('common.delOk'),
    cancelButtonText: t('common.delCancel'),
    type: 'warning'
  }).then(async () => {
    const newValues = {
      action: 'update_dealwith_statu',
      data_uuid: row.uuid
    }

    const res = await dropOrderListApi(newValues).finally(() => {
      appStore.pageLoading = false
    })
    if (res?.success) {
      ElMessage.success(t('common.successOperation'))
    } else {
      ElMessage.error(res.message)
      return
    }
    getList()
  })
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
          @search="setSearchParams"
          @reset="setSearchParams"
        >
          <!--  -->
          <template #moreBtn>
            <BaseButton
              v-if="hasPermi('loseOrderCallbackOrder')"
              type="warning"
              @click="batchCallback"
            >
              批量回调
            </BaseButton>
          </template>
        </Search>
      </div>
    </ContentWrap>
    <ContentWrap>
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
<style lang="css">
/* //search-section */
</style>
