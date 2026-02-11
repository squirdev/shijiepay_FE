<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/CustomSearch'
import { useI18n } from '@/hooks/web/useI18n'
import { ref, unref, reactive, computed } from 'vue'
import { Dialog } from '@/components/Dialog'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { Table, TableColumn } from '@/components/Table'
import { Breadcrumb } from '@/components/Breadcrumb'
import Write from './components/Write.vue'
import {
  getTripartListApi,
  getTripartAPIList,
  createTripartAPI,
  deleteTripartAPI,
  updateTripartAPIStatus
} from '@/api/channelmanagement'
import { PaymentChannelType } from '@/api/channelmanagement/types'
import { useTable } from '@/hooks/web/useTable'
import { useEventBus } from '@/hooks/event/useEventBus'
import { useEnum } from '@/hooks/web/useEnum'
import { BaseButton } from '@/components/Button'
import { onMounted } from 'vue'
import { ElSwitch, ElMessage, ElMessageBox } from 'element-plus'
import { useAppStore } from '@/store/modules/app'
import { useRouter } from 'vue-router'

interface Options {
  label: string
  value: string
}

const typeList = [
  {
    label: '代收',
    value: 'payment'
  },
  {
    label: '代付',
    value: 'payout'
  },
  {
    label: '代收查单',
    value: 'payment_check_order'
  },
  {
    label: '代付查单',
    value: 'payout_check_order'
  },
  {
    label: '余额查询',
    value: 'get_balance'
  }
]

const ids = ref<string[]>([])
const { countryOptions } = useEnum()
const tripartListOptions = ref<Options[]>([])
const writeRef = ref<ComponentRef<typeof Write>>()
const isEdit = ref(false)
const isSelect = ref(false)
const router = useRouter()

onMounted(() => {
  fetchTripartList()
})

const fetchTripartList = async () => {
  try {
    const res = await getTripartListApi({})

    if (!res.success) return

    const list = res.data.list.map((item) => ({
      label: item.name,
      value: item.uuid
    }))

    tripartListOptions.value = list
  } catch (error) {
    console.error('Failed to fetch module codes:', error)
  }
}

const { t } = useI18n()

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getTripartAPIList({
      pageIndex: unref(currentPage),
      pageSize: unref(pageSize),
      ...unref(searchParams)
    })
    return {
      list: res.data.list.map((item) => ({
        ...item,
        payout_rate: (item.payout_rate * 100).toFixed(2)
      })),
      total: res.data.total
    }
  },
  fetchDelApi: async () => {
    const res = await deleteTripartAPI(unref(ids))
    return !!res.success
  }
})

const { loading, dataList, total, currentPage, pageSize } = tableState
const { getList, getElTableExpose, delList } = tableMethods

const searchParams = ref({})
const setSearchParams = (params: any) => {
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

const goToInfo = (row) => {
  router.push(`/channelmanagement/TripartiteAPIList/Info/${row.uuid}/${row.api_type}`)
}

const actionType = ref('')

const crudSchemas = reactive<CrudSchema[]>([
  {
    field: 'name',
    label: t('channelManagement.tripartName'),
    width: '200px',
    search: {
      hidden: false
    },
    form: {
      component: 'Input',
      colProps: {
        span: 24
      }
    }
  },
  {
    field: 'three_party_uuid',
    label: '三方名称',

    search: {
      component: 'Select',
      label: '三方名称',
      componentProps: {
        options: tripartListOptions,
        placeholder: t('common.selectText')
      }
    },
    form: {
      component: 'Select',
      label: '三方名称',
      componentProps: {
        options: tripartListOptions,
        placeholder: t('common.selectText')
      },
      colProps: {
        span: 24
      }
    },
    formatter: (_: any, __: TableColumn, cellValue: string) => {
      const name = tripartListOptions.value.find((l) => l.value === cellValue)?.label
      return name ?? ''
    }
  },
  {
    field: 'country',
    label: t('AddMerchantForm.country'),
    width: 120,
    search: {
      component: 'Select',
      label: t('AddMerchantForm.country'),
      componentProps: {
        placeholder: t('common.selectText'),
        options: countryOptions
      }
    },
    form: {
      hidden: true
    },
    formatter: (_: any, __: TableColumn, cellValue: string) => {
      const name = countryOptions.value?.find((l) => l.value === cellValue)?.label
      return name ?? ''
    }
  },
  {
    field: 'api_type',
    label: t('common.apiType'),
    search: {
      component: 'Select',
      label: t('common.apiType'),
      componentProps: {
        placeholder: t('common.selectText'),
        options: typeList
      }
    },
    form: {
      component: 'Select',
      label: t('common.apiType'),
      componentProps: {
        placeholder: t('common.selectText'),
        options: typeList,
        disabled: isEdit
      },
      colProps: {
        span: 24
      }
    },
    formatter: (_: any, __: TableColumn, cellValue: string) => {
      const name = typeList.find((l) => l.value === cellValue)?.label
      return name ?? ''
    }
  },
  {
    field: 'statu',
    label: t('tableDemo.state'),
    width: '100px',
    search: {
      component: 'Select',
      componentProps: {
        placeholder: t('common.selectText'),
        options: [
          {
            label: t('searchDemo.open'),
            value: true
          },
          {
            label: t('searchDemo.disable'),
            value: false
          }
        ],
        class: 'select-state'
      }
    },
    form: {
      hidden: true
    },
    table: {
      slots: {
        default: (data: any) => {
          const status = data.row.statu
          return (
            <ElSwitch
              class="mx-4px"
              modelValue={status}
              onChange={(value: boolean) => updateStatus(data.row)}
            />
          )
        }
      }
    }
  },
  {
    field: 'create_time',
    label: t('tableDemo.creationTime'),
    width: '200px',
    search: {
      hidden: true
    },
    form: {
      hidden: true
    }
    // formatter: (_: any, __: TableColumn, cellValue: string | Date) => {
    //   const date = new Date(cellValue)
    //   if (isNaN(date.getTime())) return cellValue
    //   const year = date.getFullYear()
    //   const month = ('0' + (date.getMonth() + 1)).slice(-2)
    //   const day = ('0' + date.getDate()).slice(-2)
    //   const hours = ('0' + date.getHours()).slice(-2)
    //   const minutes = ('0' + date.getMinutes()).slice(-2)
    //   const seconds = ('0' + date.getSeconds()).slice(-2)
    //   return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    // }
  },
  {
    field: 'note',
    label: t('tableDemo.remark'),
    search: {
      component: 'Input'
    },
    form: {
      colProps: {
        span: 24
      }
    }
  },
  {
    field: 'operate',
    label: t('tableDemo.operate'),
    fixed: 'right',
    search: {
      hidden: true
    },
    form: {
      hidden: true
    },
    'min-width': 160,
    table: {
      slots: {
        default: (data: any) => {
          const row = data.row as PaymentChannelType
          return (
            <div style="display: flex; flex-wrap: wrap; justify-content: center; align-items: center;">
              <BaseButton type="text" onClick={() => action(row, 'edit')}>
                {t('exampleDemo.edit')}
              </BaseButton>
              <el-divider direction="vertical" class="w-[1px] h-[16px] bg-[#dfe6ec]" />
              <BaseButton type="text" onClick={() => goToInfo(row)}>
                参数配置
              </BaseButton>
              <el-divider direction="vertical" class="w-[1px] h-[16px] bg-[#dfe6ec]" />
              <BaseButton type="text" onClick={() => delData(row)}>
                {t('merchantList.delete')}
              </BaseButton>
            </div>
          )
        }
      }
    }
  }
])

const allSchemas = useCrudSchemas(crudSchemas).allSchemas
const appStore = useAppStore()
const dialogVisible = ref(false)
const dialogTitle = ref('')
const currentRow = ref()

const showDialog = () => {
  dialogTitle.value = t('exampleDemo.add')

  currentRow.value = undefined
  dialogVisible.value = true
  actionType.value = ''
  isEdit.value = false
  isSelect.value = false
}

const delLoading = ref(false)

const delData = async (row?: PaymentChannelType) => {
  const elTableExpose = await getElTableExpose()
  ids.value = row
    ? [row.uuid]
    : elTableExpose?.getSelectionRows().map((v: PaymentChannelType) => v.uuid) || []
  delLoading.value = true

  await delList(unref(ids).length).finally(() => {
    delLoading.value = false
  })
}

const action = (row: any, type: string) => {
  dialogTitle.value = t(type === 'edit' ? 'exampleDemo.edit' : 'exampleDemo.add')

  actionType.value = type
  currentRow.value = { ...row }
  isEdit.value = type === 'edit'
  isSelect.value = row.statu
  dialogVisible.value = true
}

const saveLoading = ref(false)

const createAndEdit = async (isCreate: boolean) => {
  const write = unref(writeRef)
  const formData = await write?.submit()

  if (!formData) return
  const { name, three_party_uuid, api_type, note } = formData
  const newValue = {
    name,
    three_party_uuid,
    api_type,
    note,
    action: isCreate ? 'add_api' : 'edit_api',
    data_uuid: undefined
  }

  if (!isCreate) {
    newValue.data_uuid = currentRow.value?.uuid
  }

  try {
    saveLoading.value = true
    const res = await createTripartAPI(newValue)

    if (res?.success) {
      ElMessage.success(t('common.successOperation'))
    } else {
      ElMessage.error(res.message)
      return
    }
    dialogVisible.value = false
    currentPage.value = 1
    getList()
  } catch (error) {
    console.log(error)
  } finally {
    saveLoading.value = false
  }
}

const updateStatus = async (row?: PaymentChannelType) => {
  try {
    const result = await ElMessageBox.confirm(
      t('merchantList.confirmOperation'),
      t('common.delWarning'),
      {
        confirmButtonText: t('common.delOk'),
        cancelButtonText: t('common.delCancel'),
        type: 'warning'
      }
    )

    if (!result) return
    const data = {
      data_uuid: row?.uuid ?? '',
      action: 'updateStatu'
    }

    const res = await updateTripartAPIStatus(data).finally(() => (appStore.pageLoading = false))
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
</script>

<template>
  <ContentWrap class="search-section">
    <Search
      :schema="allSchemas.searchSchema"
      show-add
      @add="showDialog"
      @search="setSearchParams"
      @reset="setSearchParams"
    />
  </ContentWrap>
  <ContentWrap >
    <Table
      v-model:page-size="pageSize"
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
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <Write ref="writeRef" :form-schema="allSchemas.formSchema" :current-row="currentRow" />
    <template #footer>
      <BaseButton
        v-if="actionType === 'edit'"
        type="primary"
        :loading="saveLoading"
        @click="createAndEdit(false)"
      >
        {{ t('exampleDemo.save') }}
      </BaseButton>
      <BaseButton
        v-if="actionType !== 'edit'"
        type="primary"
        :loading="saveLoading"
        @click="createAndEdit(true)"
      >
        {{ t('exampleDemo.save') }}
      </BaseButton>
      <BaseButton @click="dialogVisible = false">{{ t('dialogDemo.close') }}</BaseButton>
    </template>
  </Dialog>
</template>
<style lang="css" scoped>
.collection-channel {
  min-width: auto !important;
}
.el-form-item:has(.collection-channel) {
  margin-right: 0.5rem !important;
}

/* /* //search-section */
</style>
