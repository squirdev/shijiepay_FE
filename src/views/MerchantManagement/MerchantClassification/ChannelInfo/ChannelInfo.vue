<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { Table, TableColumn } from '@/components/Table'
import { Search } from '@/components/CustomSearch'
import {
  getChannelInfoApi,
  updateStatusChannelApi,
  editChannelInfoApi
} from '@/api/merchantmanagement'
import { useTable } from '@/hooks/web/useTable'
import { ref, unref, reactive, h } from 'vue'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { useEventBus } from '@/hooks/event/useEventBus'
import { Breadcrumb } from '@/components/Breadcrumb'
import { BaseButton } from '@/components/Button'
import {
  ElButton,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElSwitch,
  ElInputNumber
} from 'element-plus'
import { MerchantClassificationChannelInfoType } from '@/api/merchantmanagement/types'
import { useRoute } from 'vue-router'
import Write from '../components/Write.vue'
import { Dialog } from '@/components/Dialog'
import { Decimal } from 'decimal.js'

interface ConfigFormdata {
  three_party_name: string
  three_party_uuid: string
  weight: number
}

const ids = ref<string[]>([])
const route = useRoute()
const writeRef = ref<ComponentRef<typeof Write>>()
const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const res = await getChannelInfoApi(route.params.muid, {
      action: 'getMerchantClassifyDatas',
      ...unref(searchParams)
    })
    return {
      list: res.data ?? [],
      total: res.data.length
    }
  }
})
const { loading, dataList, total, currentPage, pageSize } = tableState
const { getList, delList, getElTableExpose } = tableMethods

useEventBus({
  name: 'getList',
  callback: (type: string) => {
    if (type === 'add') {
      currentPage.value = 1
    }
    getList()
  }
})

const searchParams = ref({})
const setSearchParams = (params: any) => {
  searchParams.value = params
  getList()
}

const isHidden = ref(true)
const { t } = useI18n()
const currentRow = ref()

const updateStatus = async (uuid: string) => {
  loading.value = true
  const res = await getChannelInfoApi(route.params.muid, {
    action: 'updateChannelStatu',
    tunnel_uuid: uuid
  })

  if (res.success) {
    ElMessage.success(t('common.successOperation'))
  } else {
    // if (res.message && res.message.trim()) ElMessage.error(res.message)
    ElMessage.error(res?.message || t('common.failedOperation'))
  }
  getList()
  loading.value = false
}

const saveLoading = ref(false)

const delLoading = ref(false)

const crudSchemas = reactive<CrudSchema[]>([
  {
    field: 'classify_name',
    label: t('merchantClassification.categoryName'),
    form: {
      component: 'Input',
      componentProps: {
        disabled: true
      },
      colProps: {
        span: 24
      }
    },
    search: {
      hidden: true
    },
    detail: {
      span: 24
    }
  },
  {
    field: 'tunnel_name',
    label: t('tableDemo.channelName'),
    form: {
      component: 'Input',
      componentProps: {
        disabled: true
      },
      colProps: {
        span: 24
      }
    },
    detail: {
      span: 24
    }
  },
  {
    field: 'code',
    label: t('tableDemo.channelCode'),
    form: {
      hidden: true
    }
  },
  {
    field: 'statu',
    label: t('tableDemo.channelStatus'),
    form: {
      hidden: true,
      component: 'Input',
      colProps: {
        span: 24
      }
    },
    search: {
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: [
          { label: t('merchantList.active'), value: true },
          { label: t('merchantList.inactive'), value: false }
        ]
      }
    },
    table: {
      slots: {
        default: (data: any) => {
          const status = data.row.statu
          return (
            <ElSwitch
              class="mx-4px"
              modelValue={status}
              onChange={(value: boolean) => updateStatus(data.row.tunnel_uuid)}
            />
          )
        }
      }
    }
  },
  {
    field: 'min_amount',
    label: t('merchantList.minSingleTrans'),
    form: {
      component: 'InputNumber',
      value: 0,
      colProps: {
        span: 24
      }
    },
    search: {
      hidden: true
    },
    formatter: (_: any, __: TableColumn, cellValue: number) => {
      return cellValue ? Number(cellValue.toFixed(2)).toLocaleString() : 0
    }
  },
  {
    field: 'max_amount',
    label: t('merchantList.maxSingleTrans'),
    form: {
      component: 'InputNumber',
      value: 0,
      colProps: {
        span: 24
      }
    },
    search: {
      hidden: true
    },
    formatter: (_: any, __: TableColumn, cellValue: number) => {
      return cellValue ? Number(cellValue.toFixed(2)).toLocaleString() : 0
    }
  },
  {
    field: 'rate',
    label: t('merchantList.interestRate'),
    form: {
      component: 'InputNumber',
      value: 0,
      colProps: {
        span: 24
      }
    },
    search: {
      hidden: true
    },
    formatter: (_: Recordable, __: TableColumn, value: number) => {
      return value ? `${new Decimal(value).mul(100).toFixed(2)}%` : value
    }
  },

  {
    field: 'operate',
    label: t('merchantClassification.operate'),
    fixed: 'right',
    'min-width': 160,
    search: {
      hidden: true
    },
    form: {
      hidden: true
    },
    table: {
      slots: {
        default: (data: any) => {
          const row = data.row as MerchantClassificationChannelInfoType
          return (
            <div style="display: flex; flex-wrap: wrap; justify-content: center; align-items: center;">
              <BaseButton type="text" style="margin-left: 0" onClick={() => action('edit', row)}>
                {t('exampleDemo.edit')}
              </BaseButton>
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
const actionType = ref('')

const editDialogVisible = ref(false)
const editDialogTitle = ref('')
const editActionType = ref('')

const action = (type: string, row?: MerchantClassificationChannelInfoType) => {
  editDialogTitle.value = t(type === 'edit' ? 'exampleDemo.edit' : 'exampleDemo.add')
  editActionType.value = type
  currentRow.value =
    row === undefined
      ? undefined
      : { ...row, rate: new Decimal(row?.rate ?? 0).mul(100).toNumber() }
  editDialogVisible.value = true
  isHidden.value = !!row
}

const editChannelInfo = async () => {
  const write = unref(writeRef)
  const formData = await write?.submit()

  if (formData) {
    saveLoading.value = true
    const { tunnel_uuid, max_amount, min_amount, rate } = formData
    const newValue = {
      action: 'editChannelInfo',
      tunnel_uuid,
      max_amount,
      min_amount,
      rate: new Decimal(rate).dividedBy(100).toNumber()
    }

    try {
      const res = await getChannelInfoApi(route.params.muid, newValue)
      if (res?.success) {
        ElMessage.success(t('common.successOperation'))
      } else {
        ElMessage.error(res.message)
        return
      }

      currentPage.value = 1
      getList()
      editDialogVisible.value = false
    } catch (error) {
      console.log(error)
    } finally {
      saveLoading.value = false
    }
  }
}
</script>

<template>
  <ContentWrap class="search-section">
    <div class="log-search">
      <Search
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

  <Dialog v-model="editDialogVisible" :title="editDialogTitle">
    <Write ref="writeRef" :form-schema="allSchemas.formSchema" :current-row="currentRow" />

    <template #footer>
      <BaseButton
        v-if="editActionType === 'edit'"
        type="primary"
        :loading="saveLoading"
        @click="editChannelInfo"
      >
        {{ t('exampleDemo.save') }}
      </BaseButton>
      <BaseButton v-if="editActionType !== 'edit'" type="primary" :loading="saveLoading">
        {{ t('exampleDemo.save') }}
      </BaseButton>
      <BaseButton @click="editDialogVisible = false">{{ t('dialogDemo.close') }}</BaseButton>
    </template>
  </Dialog>
</template>
