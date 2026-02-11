<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { Table, TableColumn } from '@/components/Table'
import { Search } from '@/components/CustomSearch'
import { getSubMerchantList, fetchSubMerchant, getConstRoleList } from '@/api/merchant'
import { useTable } from '@/hooks/web/useTable'
import { ref, unref, reactive, h, computed, onMounted } from 'vue'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { useEventBus } from '@/hooks/event/useEventBus'
import { BaseButton } from '@/components/Button'
import {
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElMessage,
  ElMessageBox,
  ElSwitch
} from 'element-plus'
import { useRoute } from 'vue-router'
import Write from './components/Write.vue'
import { Dialog } from '@/components/Dialog'
import { Plus } from '@element-plus/icons-vue'
import { FormSchema } from '@/components/Form'
import { hasPermi } from '@/components/Permission'

const ids = ref<string[]>([])
const writeRef = ref<ComponentRef<typeof Write>>()
const actionType = ref('')
const writeSchema = ref()

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    // @ts-ignore
    const res = await getSubMerchantList({
      ...unref(searchParams)
    })
    return {
      list: res?.data?.list ?? [],
      total: res?.data?.total ?? 0
    }
  },
  fetchDelApi: async () => {
    // @ts-ignore
    const res = await fetchSubMerchant({
      action: 'deleteAccount',
      data_uuid: ids.value[0]
    })
    return !!res.success
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

const saveLoading = ref(false)
const delLoading = ref(false)
const roleOptions = ref<Record<'label' | 'value', string>[]>([])

onMounted(() => {
  fetchRoleList()
})

const fetchRoleList = async () => {
  try {
    const res = await getConstRoleList({action: 'getRoles'})
    if (!res?.success) {
      throw new Error('Invalid response structure or no data available')
    }
    roleOptions.value = res.data.map((item: any) => ({
      label: item.name,
      value: item.role_code
    }))
  } catch (error) {
    console.error('Failed to fetch module codes:', error)
  }
}

const updateStatus = async (uuid: string) => {
  if (!hasPermi('mchSubUpdateStatu')) {
    ElMessage.error('暂无权限！')
    return
  }
  loading.value = true
  // @ts-ignore
  const res = await fetchSubMerchant({
    action: 'updateStatu',
    data_uuid: uuid
  })

  if (res.success) {
    ElMessage.success(t('common.successOperation'))
  } else {
    // if (res.message && res.message.trim()) ElMessage.error(res.message)
    ElMessage.error(res?.message || t('common.failedOperation'))
    return
  }
  getList()
  loading.value = false
}

const delData = async (row) => {
  const elTableExpose = await getElTableExpose()
  ids.value = row ? [row.uuid] : elTableExpose?.getSelectionRows().map((v) => v.uuid) || []
  delLoading.value = true

  await delList(unref(ids).length).finally(() => {
    delLoading.value = false
  })
}

const updatePassword = async () => {
  const write = unref(writeRef)
  const formData = await write?.submit()

  if (!formData) return
  const newValues = {
    action: 'updatePwd',
    data_uuid: currentRow.value.uuid,
    password: formData.password,
    google_key: formData.google_code
  }

  try {
    saveLoading.value = true
    const res = await fetchSubMerchant(newValues)

    if (res?.success) {
      editDialogVisible.value = false
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

const isEditMode = computed(() => actionType.value === 'edit')

const crudSchemas = reactive<CrudSchema[]>([
  {
    field: 'account_name',
    label: '账户名称',
    form: {
      component: 'Input',
      componentProps: {},
      colProps: {
        span: 24
      }
    },
    search: {
      component: 'Input'
    },
    detail: {
      span: 24
    }
  },
  {
    field: 'account',
    label: '登录账户',
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
    field: 'password',
    label: '登录密码',
    form: {
      component: 'InputPassword',
      colProps: { span: 24 },
      componentProps: {
        placeholder: t('AddMerchantForm.confirmPassword'),
        showPassword: true
      },
      hidden: isEditMode.value
    },
    detail: {
      span: 24
    },
    search: {
      hidden: true
    },
    table: {
      hidden: true
    }
  },

  {
    field: 'confirm_password',
    label: t('AddMerchantForm.confirmPassword'),
    search: {
      hidden: true
    },
    form: {
      component: 'InputPassword',
      colProps: { span: 24 },
      componentProps: {
        placeholder: t('AddMerchantForm.confirmPassword'),
        showPassword: true
      },
      hidden: isEditMode.value
    },
    table: {
      hidden: true
    }
  },
  {
    field: 'role_code',
    label: t('systemManagement.role') /* 角色 */,
    search: {
      component: 'Select',
      componentProps: {
        placeholder: t('systemManagement.role') /* 角色 */,
        options: roleOptions
      }
    },
    form: {
      component: 'Select',
      componentProps: {
        placeholder: t('systemManagement.role') /* 角色 */,
        options: roleOptions
      },
      colProps: {
        span: 24
      }
    },
    formatter: (_: any, __: TableColumn, cellValue: string) => {
      const name = roleOptions.value?.find(
        (l: { value: string; label: string }) => l.value === cellValue
      )?.label
      return name ?? ''
    },
    detail: {
      hidden: true
    }
  },
  {
    field: 'statu',
    label: '状态',
    form: {
      hidden: true
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
              onChange={(value: boolean) => updateStatus(data.row.uuid)}
            />
          )
        }
      }
    }
  },
  {
    field: 'create_time',
    label: '添加时间',
    form: {
      hidden: true
    },
    search: {
      hidden: true
    }
  },
  {
    field: 'note',
    label: t('merchantList.remark'),
    search: {
      component: 'Input',
      componentProps: {
        placeholder: t('merchantList.remark')
      }
    },
    form: {
      component: 'Input',
      colProps: {
        span: 24
      }
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
          const row = data.row
          return (
            <div style="display: flex; flex-wrap: wrap; justify-content: center; align-items: center;">
              {hasPermi('mchSubEdit') && (
                <>
                  <BaseButton
                    type="text"
                    style="margin-left: 0"
                    onClick={() => action('edit', row)}
                  >
                    {t('exampleDemo.edit')}
                  </BaseButton>
                  <el-divider direction="vertical" class="w-[1px] h-[16px] bg-[#dfe6ec]" />
                </>
              )}
              {hasPermi('mchSubUpdatePasswd') && (
                <>
                  <BaseButton
                    type="text"
                    style="margin-left: 0"
                    onClick={() => changePassword(row)}
                  >
                    修改密码
                  </BaseButton>
                  <el-divider direction="vertical" class="w-[1px] h-[16px] bg-[#dfe6ec]" />
                </>
              )}
              {hasPermi('mchSubDel') && (
                <BaseButton type="text" onClick={() => delData(row)}>
                  {t('exampleDemo.del') /* 删除 */}
                </BaseButton>
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
                        {hasPermi('CatMchSubGoogleCode') && (
                          <ElDropdownItem
                            key={'viewGoogleCode'}
                            onClick={() => getGoogleQrCode(row)}
                          >
                            {t('merchantList.viewGoogleCode')}
                          </ElDropdownItem>
                        )}
                        {hasPermi('UpdateMchSubGoogleCode') && (
                          <ElDropdownItem
                            key={'updateGoogleCode'}
                            onClick={() => updateGoogleCode(row)}
                          >
                            {t('merchantList.updateGoogleCode')}
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

const changePasswordSchemas = reactive<FormSchema[]>([
  {
    field: 'password',
    label: t('AddMerchantForm.password'),
    component: 'InputPassword',
    componentProps: {
      placeholder: t('AddMerchantForm.password'),
      showPassword: true
    },
    colProps: {
      span: 24
    }
  },
  {
    field: 'confirm_password',
    label: t('AddMerchantForm.confirmPassword'),
    component: 'InputPassword',
    componentProps: {
      placeholder: t('AddMerchantForm.confirmPassword'),
      showPassword: true
    },
    colProps: {
      span: 24
    }
  },
  {
    field: 'google_code',
    label: t('AddMerchantForm.googleCode'),
    component: 'Input',
    componentProps: {
      placeholder: t('AddMerchantForm.googleCode')
    },
    colProps: {
      span: 24
    }
  }
])

const changePassword = (row) => {
  editDialogTitle.value = t('common.changePassword')
  writeSchema.value = changePasswordSchemas
  actionType.value = 'changePassword'
  currentRow.value = { ...row, password: '' }
  editDialogVisible.value = true
}

// @ts-ignore
const { allSchemas } = useCrudSchemas(crudSchemas)

const editDialogVisible = ref(false)
const editDialogTitle = ref('')
const editActionType = ref('')

const action = (type: string, row = undefined) => {
  fetchRoleList()
  writeSchema.value = allSchemas.formSchema
  actionType.value = type
  editDialogTitle.value = t(type === 'edit' ? 'exampleDemo.edit' : 'exampleDemo.add')
  editActionType.value = type
  currentRow.value = row
  isHidden.value = !!row

  editDialogVisible.value = true
}

const googleQRSrc = ref()
const qrVisible = ref(false)

const getGoogleQrCode = async (row) => {
  const res = await fetchSubMerchant({ action: 'getGoogleQrcode', data_uuid: row.uuid })
  googleQRSrc.value = res.data.generate_qrcode
  qrVisible.value = true
}

const updateGoogleCode = async (row) => {
  ElMessageBox.confirm(t('merchantList.confirmOperation'), t('common.delWarning'), {
    confirmButtonText: t('common.delOk'),
    cancelButtonText: t('common.delCancel'),
    type: 'warning'
  }).then(async () => {
    const res = await fetchSubMerchant({ action: 'updateGooglePwd', data_uuid: row.uuid }).finally(
      () => {}
    )
    if (res?.success) {
      ElMessage.success(t('common.successOperation'))
    } else {
      ElMessage.error(res.message)
      return
    }
    getList()
  })
}

const saveAccount = async () => {
  const write = unref(writeRef)
  const formData = await write?.submit()

  if (formData) {
    saveLoading.value = true

    const newValue = {
      action: 'addAccount',

      ...formData,
      data_uuid: undefined,
      confirm_password: undefined
    }

    if (!!currentRow.value) {
      newValue.action = 'editAccount'
      newValue.data_uuid = currentRow.value.uuid
    }

    try {
      // @ts-ignore
      const res = await fetchSubMerchant(newValue)
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
      <Search :schema="allSchemas.searchSchema" @search="setSearchParams" @reset="setSearchParams">
        <template #moreBtn>
          <BaseButton
            type="warning"
            v-if="hasPermi('mchSubAdd')"
            :icon="Plus"
            @click="action('add')"
          >
            添加
          </BaseButton>
        </template>
      </Search>
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

  <Dialog v-model="editDialogVisible" :title="editDialogTitle">
    <Write
      ref="writeRef"
      :form-schema="writeSchema"
      :current-row="currentRow"
      :isEdit="isEditMode"
    />

    <template #footer>
      <BaseButton
        type="primary"
        v-if="actionType !== 'changePassword'"
        :loading="saveLoading"
        @click="saveAccount"
      >
        {{ t('exampleDemo.save') }}
      </BaseButton>

      <BaseButton
        type="primary"
        v-if="actionType === 'changePassword'"
        :loading="saveLoading"
        @click="updatePassword"
      >
        {{ t('exampleDemo.save') }}
      </BaseButton>

      <BaseButton @click="editDialogVisible = false">{{ t('dialogDemo.close') }}</BaseButton>
    </template>
  </Dialog>

  <Dialog v-model="qrVisible" :title="t('merchantList.googleQRCode')">
    <div class="flex justify-center items-center">
      <img :src="googleQRSrc" />
    </div>
    <template #footer>
      <BaseButton @click="qrVisible = false">{{ t('dialogDemo.close') }}</BaseButton>
    </template>
  </Dialog>
</template>
