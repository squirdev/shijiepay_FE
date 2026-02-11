<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/CustomSearch'
import { useI18n } from '@/hooks/web/useI18n'
import { Table } from '@/components/Table'
import { getMgrBrowserApi, mgrBrowserApi } from '@/api/systemmanagement'
import { useTable } from '@/hooks/web/useTable'
import { ref, unref, reactive, onMounted, h } from 'vue'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { useEventBus } from '@/hooks/event/useEventBus'
import { BaseButton } from '@/components/Button'
import { Dialog } from '@/components/Dialog'
import Write from './components/Write.vue'
import { ElMessage, ElTag } from 'element-plus'
import { hasPermi } from '@/components/Permission'
import { browserReviewStatusOptions } from '@/utils/options'

const ids = ref<string[]>([])
const writeSchema = ref()
const currentRow = ref()

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getMgrBrowserApi({
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

const { t } = useI18n()
const crudSchemas = reactive<CrudSchema[]>([
  {
    field: 'account',
    label: '登录账户',
    search: {
      component: 'Input',
      componentProps: {
        placeholder: '登录账户'
      }
    },
    form: {
      hidden: true
    },
    detail: {
      span: 24
    }
  },
  {
    field: 'browser_fingerprint',
    label: '浏览器指纹',
    search: {
      hidden: true
    },
    form: {
      hidden: true
    }
  },
  {
    field: 'browser_info',
    label: '浏览器信息',
    search: {
      hidden: true
    },
    form: {
      hidden: true
    },
    table: {
      slots: {
        default: (data: any) => {
          return JSON.stringify(data.row.browser_info)
        }
      }
    }
  },
  {
    field: 'verification_code',
    label: '验证码',
    search: {
      hidden: true
    },
    form: { hidden: true }
  },
  {
    field: 'review_statu',
    label: '审核状态',
    search: {
      hidden: true
    },
    form: {
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        // disabled: ['reject', 'unknown_core'].includes(currentRow.value?.review_statu),
        options: browserReviewStatusOptions
      },
      colProps: {
        span: 24
      }
    },
    detail: {
      hidden: true
    },
    table: {
      slots: {
        default: (data: any) => {
          const { review_statu } = data.row
          const name = browserReviewStatusOptions.find((l) => l.value === review_statu)?.label ?? ''
          if (review_statu === 'reject') {
            return <ElTag type="danger">{name}</ElTag>
          }

          if (review_statu === 'military_core') {
            return <ElTag>{name}</ElTag>
          }

          if (['unknown_core'].includes(review_statu)) {
            return <ElTag type="success">{name}</ElTag>
          }
        }
      }
    }
  },
  {
    field: 'verification_code',
    label: '验证码',
    search: {
      hidden: true
    },
    form: {
      component: 'Input',
      componentProps: {
        placeholder: '验证码'
      },
      colProps: {
        span: 24
      }
    },
    table: { hidden: true }
  },
  {
    field: 'create_time',
    label: t('systemManagement.creationTime') /* 创建时间 */,
    search: {
      hidden: true
    },
    form: {
      hidden: true
    },
    detail: {
      hidden: true
    }
  },

  {
    field: 'note',
    label: t('systemManagement.remark') /* 备注 */,
    search: {
      component: 'Input',
      componentProps: {
        placeholder: t('systemManagement.remark') /* 备注 */
      }
    },
    form: {
      component: 'Input',
      componentProps: {
        placeholder: t('systemManagement.remark') /* 备注 */
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
    field: 'operate',
    label: t('systemManagement.operate') /* 操作 */,
    fixed: 'right',
    form: {
      hidden: true
    },
    detail: {
      hidden: true
    },
    search: {
      hidden: true
    },
    'min-width': 80,
    table: {
      slots: {
        default: (data: any) => {
          const row = data.row
          return (
            <div style="display: flex; flex-wrap: wrap; justify-content: center; align-items: center;">
              {hasPermi('mgrBrowserListEdit') && (
                <BaseButton type="text" onClick={() => action(row, 'edit')}>
                  {t('exampleDemo.edit') /* 编辑 */}
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

const dialogVisible = ref(false)
const dialogTitle = ref('')

const actionType = ref('')
const action = (row, type) => {
  dialogTitle.value = type === 'edit' ? t('exampleDemo.edit') : t('exampleDemo.detail')

  writeSchema.value = allSchemas.formSchema
  actionType.value = type
  currentRow.value = row
  dialogVisible.value = true
}

const writeRef = ref<ComponentRef<typeof Write>>()

const saveLoading = ref(false)

const save = async () => {
  const write = unref(writeRef)
  const formData = await write?.submit()
  if (formData) {
    saveLoading.value = true

    try {
      const newValues = {
        action: 'update_data',
        data_uuid: currentRow.value?.uuid,
        review_statu: formData.review_statu,
        verification_code: formData.verification_code
      }

      const res = await mgrBrowserApi(newValues)

      if (res?.success) {
        ElMessage.success(t('common.successOperation'))
      } else {
        ElMessage.error(res.message)
        return
      }

      getList()
      dialogVisible.value = false
    } catch (error) {
      console.log(error)
    } finally {
      saveLoading.value = false
    }
  }
}

const cannel = () => {
  currentRow.value = undefined
  dialogVisible.value = false
}
</script>

<template>
  <div>
    <ContentWrap class="search-section">
      <div class="log-search">
        <!-- <p style="min-width: 50px; padding-top: 8px">{{ t('common.search') }} :</p> -->
        <Search
          :schema="allSchemas.searchSchema"
          @search="setSearchParams"
          @reset="setSearchParams"
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
      <Write ref="writeRef" :form-schema="writeSchema" :current-row="currentRow" />

      <template #footer>
        <BaseButton type="primary" :loading="saveLoading" @click="save">
          {{ t('exampleDemo.save') }}
          <!-- 保存 -->
        </BaseButton>
        <BaseButton @click="cannel"
          >{{ t('dialogDemo.close') }}
          <!-- 关闭 -->
        </BaseButton>
      </template>
    </Dialog>
  </div>
</template>
<style lang="css">
/* //search-section */
</style>
