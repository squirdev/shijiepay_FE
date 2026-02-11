<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Dialog } from '@/components/Dialog'
import { useI18n } from '@/hooks/web/useI18n'
import { Search } from '@/components/CustomSearch'
import { useRouter } from 'vue-router'
import { Table, TableColumn } from '@/components/Table'
import {
  getMerchantClassificationApi,
  addMerchantClassificationApi,
  editMerchantClassificationApi,
  deleteMerchantClassificationApi
} from '@/api/merchantmanagement'
import { useTable } from '@/hooks/web/useTable'
import { ref, unref, reactive } from 'vue'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { useEventBus } from '@/hooks/event/useEventBus'
import { BaseButton } from '@/components/Button'
import { ElMessage, ElDropdownMenu, ElDropdown, ElDropdownItem, ElSwitch } from 'element-plus'
import { MerchantClassificationType } from '@/api/merchantmanagement/types'
import Write from './components/Write.vue'
import { useEnum } from '@/hooks/web/useEnum'
import CopyMerchantCategoryForm from './components/CopyMerchantCategoryForm'
import { useCopyMerchantCategoryDialog } from './composables/useCopyMerchantCategoryDialog'
import ChannelConfig from './components/ChannelConfig'
import { hasPermi } from '@/components/Permission'
import { Decimal } from 'decimal.js'

interface Option {
  label: string
  value: string
  country?: string
}

const ids = ref<string[]>([])
const router = useRouter()
const dialogVisible = ref(false)
const dialogTitle = ref('')
const actionType = ref('')
const isEdit = ref(false)
const { countryOptions } = useEnum()
const currentCountry = ref('')
const searchCountry = ref('')
const tunnelDatas = ref<Option[]>([])

const mchOptions = ref<Option[]>([])
const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getMerchantClassificationApi({
      pageIndex: unref(currentPage),
      pageSize: unref(pageSize),
      ...unref(searchParams)
    })
    mchOptions.value = res.data?.mc_datas?.map((item) => ({ label: item.name, value: item.uuid }))

    tunnelDatas.value = res.data?.tunnel_rate_datas?.map((item) => ({
      label: item.name,
      value: item.tunnel_rate_uuid,
      country: item.country
    }))
    return {
      list: res.data.list,
      total: res.data.total
    }
  },
  fetchDelApi: async () => {
    const res = await deleteMerchantClassificationApi(unref(ids))
    return !!res.success
  }
})

const { loading, dataList, total, currentPage, pageSize } = tableState
const { getList, delList, getElTableExpose } = tableMethods

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

const isHidden = ref(true)
const { t } = useI18n()
const currentRow = ref()
const channelVisible = ref(false)
const action = (type: string, row?: MerchantClassificationType) => {
  isEdit.value = type === 'edit'

  dialogTitle.value = t(type === 'edit' ? 'exampleDemo.edit' : 'exampleDemo.add')
  actionType.value = type
  currentRow.value = row
  dialogVisible.value = true
  isHidden.value = !!row
}

const writeRef = ref<ComponentRef<typeof Write>>()

const saveLoading = ref(false)

const addMerchantClassification = async () => {
  const write = unref(writeRef)
  const formData = await write?.submit()
  if (formData) {
    saveLoading.value = true
    try {
      const res = await addMerchantClassificationApi(formData)
      if (res?.success) {
        ElMessage.success(t('common.successOperation'))
      } else {
        ElMessage.error(res.message)
        return
      }

      currentPage.value = 1
      getList()
      dialogVisible.value = false
    } catch (error) {
      console.log(error)
    } finally {
      saveLoading.value = false
    }
  }
}

const delLoading = ref(false)

const delData = async (row?: MerchantClassificationType) => {
  const elTableExpose = await getElTableExpose()
  ids.value = row
    ? [row.uuid]
    : elTableExpose?.getSelectionRows().map((v: MerchantClassificationType) => v.uuid) || []
  delLoading.value = true

  await delList(unref(ids).length).finally(() => {
    delLoading.value = false
  })
}

const editMerchantClassification = async () => {
  const write = unref(writeRef)
  const formData = await write?.submit()
  if (formData) {
    saveLoading.value = true
    const { uuid, classify_name, note } = formData

    try {
      const res = await editMerchantClassificationApi({ uuid, classify_name, note })
      if (res?.success) {
        ElMessage.success(t('common.successOperation'))
      } else {
        ElMessage.error(res.message)
        return
      }
      currentPage.value = 1
      getList()
      dialogVisible.value = false
    } catch (error) {
      console.log(error)
    } finally {
      saveLoading.value = false
    }
  }
}

const {
  copyMerchantVisible,
  copyMerchantFormRef,
  currentRow: copyCurrentRow,
  saveLoading: copyLoading,
  opencopyMerchantDialog,
  savecopyMerchant
} = useCopyMerchantCategoryDialog({
  onSuccess: () => {
    currentPage.value = 1
    getList()
  }
})

const openChannelModal = (row) => {
  channelVisible.value = true
  currentRow.value = row
}

const channelSaveCallback = () => {
  channelVisible.value = false
  currentPage.value = 1
  getList()
}

const crudSchemas = reactive<CrudSchema[]>([
  {
    field: 'classify_name',
    label: t('merchantClassification.categoryName'),
    search: {
      component: 'Input',
      label: '分类名称',
      componentProps: {
        placeholder: '请输入分类名称'
      }
    },
    'min-width': 160,
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
    field: 'country',
    label: t('AddMerchantForm.country'),
    search: {
      component: 'Select',
      label: t('AddMerchantForm.country'),
      componentProps: {
        placeholder: t('AddMerchantForm.selectCountry'),
        options: countryOptions,
        onChange: (value) => {
          searchCountry.value = value
        }
      }
    },
    form: {
      component: 'Select',
      colProps: {
        span: 24
      },
      componentProps: {
        placeholder: t('AddMerchantForm.selectCountry'),
        options: countryOptions,
        disabled: isEdit,
        onChange: (value) => {
          currentCountry.value = value
        }
      }
    },
    formatter: (_: any, __: TableColumn, cellValue: string) => {
      const name = countryOptions.value.find((l) => l.value === cellValue)?.label
      return name ?? ''
    },
    detail: {
      span: 24
    }
  },

  {
    field: 'tunnel_rate_uuid',
    label: '通道信息',
    'min-width': 240,
    search: {
      hidden: true
    },
    form: {
      hidden: true
    },
    table: {
      slots: {
        default: (data: any) => {
          const row = data.row

          return row?.mt_datas?.map((item: any, index: number) => (
            <div key={item.code} class="flex gap-[6px] justify-center">
              <span class="min-w-[120px] text-right">【{item.tunnel_name}】</span>
              <span>{`接单区间：${item.min_amount}~${item.max_amount}`},</span>
              <span>{`费率：${new Decimal(item.rate || 0).mul(100).toNumber()}%`}</span>
            </div>
          ))
        }
      }
    }
  },
  {
    field: 'create_time',
    label: t('merchantClassification.addTime'),
    search: {
      hidden: true
    },
    'min-width': 160,
    form: {
      hidden: true
    }
  },
  {
    field: 'note',
    label: t('merchantClassification.remark'),
    'min-width': 160,
    form: {
      component: 'Input',
      colProps: {
        span: 24
      }
    },
    search: {
      component: 'Input',
      componentProps: {
        placeholder: t('merchantClassification.remark')
      }
    }
  },
  {
    field: 'operate',
    label: t('merchantClassification.operate'),
    search: {
      hidden: true
    },
    'min-width': 160,
    form: {
      hidden: true
    },
    table: {
      slots: {
        default: (data: any) => {
          const row = data.row as MerchantClassificationType
          return (
            <div style="display: flex; flex-wrap: wrap; justify-content: center; align-items: center;">
              {hasPermi('merchantClassifyEdit') && (
                <>
                  <BaseButton type="text" onClick={() => action('edit', row)}>
                    {t('exampleDemo.edit')}
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
                        {hasPermi('merchantClassifyDel') && (
                          <ElDropdownItem key={'x'} onClick={() => delData(row)}>
                            删除分类
                          </ElDropdownItem>
                        )}

                        <ElDropdownItem key={'copy'} onClick={() => opencopyMerchantDialog(row)}>
                          复制并新建分类
                        </ElDropdownItem>
                        {hasPermi('merchantClassifyTdInfo') && (
                          <ElDropdownItem key={'channel'} onClick={() => openChannelModal(row)}>
                            编辑通道配置
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
</script>

<template>
  <ContentWrap class="search-section">
    <div class="log-search">
      <!-- <p style="min-width: 50px; padding-top: 8px">{{ t('common.search') }} :</p> -->
      <Search
        :schema="allSchemas.searchSchema"
        :show-add-merchant-category="hasPermi('merchantClassifyAdd')"
        @search="setSearchParams"
        @reset="setSearchParams"
        @add-merchant-category="action('add', undefined)"
      />
    </div>
  </ContentWrap>
  <ContentWrap>
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

  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <Write ref="writeRef" :form-schema="allSchemas.formSchema" :current-row="currentRow" />

    <template #footer>
      <BaseButton
        v-if="actionType === 'edit'"
        type="primary"
        :loading="saveLoading"
        @click="editMerchantClassification"
      >
        {{ t('exampleDemo.save') }}
      </BaseButton>
      <BaseButton
        v-if="actionType !== 'edit'"
        type="primary"
        :loading="saveLoading"
        @click="addMerchantClassification"
      >
        {{ t('exampleDemo.save') }}
      </BaseButton>
      <BaseButton @click="dialogVisible = false">{{ t('dialogDemo.close') }}</BaseButton>
    </template>
  </Dialog>

  <Dialog v-model="copyMerchantVisible" title="复制并新建分类">
    <div class="mr-20px">
      <CopyMerchantCategoryForm ref="copyMerchantFormRef" :row="copyCurrentRow" />
    </div>
    <template #footer>
      <BaseButton type="primary" :loading="copyLoading" @click="savecopyMerchant">
        {{ t('exampleDemo.save') }}
      </BaseButton>
      <BaseButton @click="copyMerchantVisible = false">{{ t('dialogDemo.close') }}</BaseButton>
    </template>
  </Dialog>
  <ChannelConfig
    v-model="channelVisible"
    :visible="channelVisible"
    :row="currentRow"
    :saveCallback="channelSaveCallback"
  />
</template>
