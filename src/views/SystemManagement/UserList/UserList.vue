<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/CustomSearch'
import { useI18n } from '@/hooks/web/useI18n'
import { Table, TableColumn } from '@/components/Table'
import {
  getUserListApi,
  addUserApi,
  getRoleListApi,
  updateUserApi,
  delUserApi,
  updateUserStateApi,
  getGoogleQrCodeApi,
  updateGoogleCodeApi
} from '@/api/systemmanagement'
import { useTable } from '@/hooks/web/useTable'
import { ref, unref, reactive, onMounted, h } from 'vue'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { Breadcrumb } from '@/components/Breadcrumb'
import { useEventBus } from '@/hooks/event/useEventBus'
import { BaseButton } from '@/components/Button'
import { Dialog } from '@/components/Dialog'
import Write from './components/Write.vue'
import Detail from './components/Detail.vue'
import { UserType } from '@/api/systemmanagement/types'
import {
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElMessage,
  ElMessageBox,
  ElNotification,
  ElSwitch
} from 'element-plus'
import { useAppStore } from '@/store/modules/app'
import { FormSchema } from '@/components/Form'
import { hasPermi } from '@/components/Permission'

const ids = ref<string[]>([])
const googleQRSrc = ref()
const qrVisible = ref(false)
const writeSchema = ref()

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getUserListApi({
      pageIndex: unref(currentPage),
      pageSize: unref(pageSize),
      ...unref(searchParams)
    })
    return {
      list: res.data.list,
      total: res.data.total
    }
  },
  fetchDelApi: async () => {
    const res = await delUserApi(unref(ids))
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
const RoleOptions = ref<Record<'label' | 'value', string>[]>([])
onMounted(() => {
  console.log('---onmounted---')
  fetchRoleList()
})

const fetchRoleList = async () => {
  try {
    const res = await getRoleListApi({})
    if (!res) {
      throw new Error('Invalid response structure or no data available')
    }
    RoleOptions.value = res.data.list.map((item: any) => ({
      label: item.name,
      value: item.role_code
    }))
  } catch (error) {
    console.error('Failed to fetch module codes:', error)
  }
}
const { t } = useI18n()

const crudSchemas = reactive<CrudSchema[]>([
  {
    field: 'username',
    label: t('systemManagement.name') /* 姓名 */,
    search: {
      component: 'Input',
      componentProps: {
        placeholder: t('systemManagement.name') /* 姓名 */
      }
    },
    form: {
      component: 'Input',
      componentProps: {
        placeholder: t('systemManagement.name') /* 姓名 */
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
    field: 'account',
    label: t('systemManagement.account') /* 账户 */,
    search: {
      component: 'Input',
      componentProps: {
        placeholder: t('systemManagement.account') /* 账户 */
      }
    },
    form: {
      component: 'Input',
      componentProps: {
        placeholder: t('systemManagement.account') /* 账户 */
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
    field: 'password',
    label: t('systemManagement.password') /* 密码 */,
    search: {
      hidden: true
    },
    form: {
      component: 'Input',
      componentProps: {
        type: 'password',
        placeholder: t('systemManagement.password') /* 密码 */
      },
      colProps: {
        span: 24
      }
    },
    detail: {
      hidden: true
    },
    table: {
      hidden: true
    }
  },
  {
    field: 'ConfirmPassword',
    label: t('systemManagement.confirmPassword') /* 确认密码 */,
    search: {
      hidden: true
    },
    form: {
      component: 'Input',
      componentProps: {
        type: 'password',
        placeholder: t('systemManagement.confirmPassword') /* 确认密码 */
      },
      colProps: {
        span: 24
      }
    },
    detail: {
      hidden: true
    },
    table: {
      hidden: true
    }
  },
  {
    field: 'statu',
    label: t('systemManagement.state') /* 状态 */,
    search: {
      component: 'Select',
      componentProps: {
        placeholder: t('systemManagement.state') /* 状态 */,
        options: [
          { label: t('systemManagement.normal') /* 正常 */, value: '1' },
          { label: t('systemManagement.disable') /* 禁用 */, value: '0' }
        ]
      }
    },
    form: {
      hidden: true
    },
    detail: {
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
    field: 'role_code',
    label: t('systemManagement.role') /* 角色 */,
    search: {
      component: 'Select',
      componentProps: {
        placeholder: t('systemManagement.role') /* 角色 */,
        options: RoleOptions
      }
    },
    form: {
      component: 'Select',
      componentProps: {
        placeholder: t('systemManagement.role') /* 角色 */,
        options: RoleOptions
      },
      colProps: {
        span: 24
      }
    },
    formatter: (_: any, __: TableColumn, cellValue: string) => {
      const name = RoleOptions.value?.find(
        (l: { value: string; label: string }) => l.value === cellValue
      )?.label
      return name ?? ''
    },
    detail: {
      hidden: true
    }
  },
  {
    field: 'email',
    label: t('systemManagement.mail') /* 邮箱 */,
    search: {
      component: 'Input',
      componentProps: {
        placeholder: t('systemManagement.mail') /* 邮箱 */
      }
    },
    form: {
      component: 'Input',
      componentProps: {
        placeholder: t('systemManagement.mail') /* 邮箱 */
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
    field: 'last_login_time',
    label: t('systemManagement.lastLoginTime') /* 最近登录时间 */,
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
    'min-width': 160,
    table: {
      slots: {
        default: (data: any) => {
          const row = data.row as UserType
          return (
            <div style="display: flex; flex-wrap: wrap; justify-content: center; align-items: center;">
              {hasPermi('adminUserEdit') && (
                <>
                  <BaseButton type="text" onClick={() => action(row, 'edit')}>
                    {t('exampleDemo.edit') /* 编辑 */}
                  </BaseButton>
                  <el-divider direction="vertical" class="w-[1px] h-[16px] bg-[#dfe6ec]" />
                </>
              )}
              {hasPermi('adminUserDel') && (
                <>
                  <BaseButton type="text" style="margin-left: 0" onClick={() => delData(row)}>
                    {t('exampleDemo.del') /* 删除 */}
                  </BaseButton>
                  <el-divider direction="vertical" class="w-[1px] h-[16px] bg-[#dfe6ec]" />
                </>
              )}
              <ElDropdown
                trigger="click"
                v-slots={{
                  default: () => {
                    return <BaseButton type="text">{t('workplace.more') /* 更多 */}</BaseButton>
                  },
                  dropdown: () => {
                    return (
                      <ElDropdownMenu>
                        {hasPermi('adminUserUpdatePwd') && (
                          <ElDropdownItem key={'x'} onClick={() => changePassword(row)}>
                            修改密码
                          </ElDropdownItem>
                        )}
                        {hasPermi('adminUserClearLoginLimit') && (
                          <ElDropdownItem key={'1'} onClick={() => clearLoginToken(row)}>
                            清除登录限制
                          </ElDropdownItem>
                        )}
                        {hasPermi('adminUserCatGoogleCode') && (
                          <ElDropdownItem key={'2'} onClick={() => getGoogleQrCode(row)}>
                            {t('merchantList.viewGoogleCode') /* 查看Google验证码 */}
                          </ElDropdownItem>
                        )}
                        {hasPermi('adminUserupdateGoogleCode') && (
                          <ElDropdownItem key={'3'} onClick={() => updateGoogleCode(row)}>
                            {t('merchantList.updateGoogleCode') /* 更新Google验证码 */}
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

const dialogVisible = ref(false)
const dialogTitle = ref('')

const currentRow = ref<UserType>()
const actionType = ref('')

const onShowAddAccount = () => {
  fetchRoleList()
  dialogTitle.value = t('systemManagement.addAccount') /* 添加账户 */
  writeSchema.value = allSchemas.formSchema
  currentRow.value = undefined
  dialogVisible.value = true
  actionType.value = 'add'
}

const delLoading = ref(false)

const delData = async (row?: UserType) => {
  const elTableExpose = await getElTableExpose()
  ids.value = row
    ? [row.uuid]
    : elTableExpose?.getSelectionRows().map((v: UserType) => v.uuid) || []
  delLoading.value = true

  await delList(unref(ids).length).finally(() => {
    delLoading.value = false
  })
}
const appStore = useAppStore()

const updateStatus = async (row?: UserType) => {
  if (!hasPermi('adminUserUpdateStatu')) {
    ElMessage.error('暂无权限!')
    return
  }
  ElMessageBox.confirm(
    t('merchantList.confirmOperation') /* 确定操作？ */,
    t('common.delWarning') /* 警告 */,
    {
      confirmButtonText: t('common.delOk') /* 确定 */,
      cancelButtonText: t('common.delCancel') /* 取消 */,
      type: 'warning'
    }
  ).then(async () => {
    appStore.pageLoading = true
    await updateUserStateApi([row?.uuid]).finally(() => {
      appStore.pageLoading = false
    })
    getList()
  })
}

const getGoogleQrCode = async (row?: UserType) => {
  // appStore.pageLoading = true
  const res = await getGoogleQrCodeApi([row?.uuid])
  googleQRSrc.value = res.data.generate_qrcode
  qrVisible.value = true
  appStore.pageLoading = false
}

const updateGoogleCode = async (row?: UserType) => {
  ElMessageBox.confirm(
    t('merchantList.confirmOperation') /* 确定操作？ */,
    t('common.delWarning') /* 警告 */,
    {
      confirmButtonText: t('common.delOk') /* 确定 */,
      cancelButtonText: t('common.delCancel') /* 取消 */,
      type: 'warning'
    }
  ).then(async () => {
    // appStore.pageLoading = true
    await updateGoogleCodeApi([row?.uuid]).finally(() => {
      appStore.pageLoading = false
      ElNotification.success(t('common.successOperation'))
    })
    getList()
  })
}

const action = (row: UserType, type: string) => {
  fetchRoleList()
  dialogTitle.value = type === 'edit' ? t('exampleDemo.edit') : t('exampleDemo.detail')
  /* 编辑 / 详情 */
  writeSchema.value = allSchemas.formSchema
  actionType.value = type
  currentRow.value = { ...row, password: '' }
  dialogVisible.value = true
}

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
  dialogTitle.value = t('common.changePassword')
  writeSchema.value = changePasswordSchemas
  actionType.value = 'changePassword'
  currentRow.value = { ...row, password: '' }
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
      let res

      if (actionType.value === 'add') {
        res = await addUserApi(formData)
      }

      if (actionType.value === 'edit') {
        const newValues = {
          action: 'edit_user_data',
          data_uuid: currentRow.value?.uuid,
          ...formData
        }

        res = await updateUserApi(newValues)
      }

      if (actionType.value === 'changePassword') {
        const { password, confirm_password, google_code } = formData
        const newValues = {
          action: 'updatePwd',
          data_uuid: currentRow.value?.uuid,
          password,
          google_code
        }

        res = await updateUserApi(newValues)
      }

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

const clearLoginToken = async (row) => {
  ElMessageBox.confirm(t('merchantList.confirmOperation'), t('common.delWarning'), {
    confirmButtonText: t('common.delOk'),
    cancelButtonText: t('common.delCancel'),
    type: 'warning'
  }).then(async () => {
    // appStore.pageLoading = true
    const res = await updateUserApi({
      action: 'clearLoginLimit',
      data_uuid: row.uuid
    }).finally(() => {
      // appStore.pageLoading = false
    })
    if (res?.success) {
      ElMessage.success(t('common.successOperation'))
    } else {
      ElMessage.error(res.message)
    }
  })
}
</script>

<template>
  <div>
    <ContentWrap class="search-section">
      <div class="log-search">
        <!-- <p style="min-width: 50px; padding-top: 8px">{{ t('common.search') }} :</p> -->
        <Search
          :schema="allSchemas.searchSchema"
          :show-add-account="hasPermi('adminUserAdd')"
          @add-account="onShowAddAccount"
          @search="setSearchParams"
          @reset="setSearchParams"
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
    <Dialog v-model="qrVisible" :title="t('merchantList.googleQRCode') /* Google验证码 */">
      <div class="flex justify-center items-center">
        <img :src="googleQRSrc" />
      </div>
      <template #footer>
        <BaseButton @click="qrVisible = false"
          >{{ t('dialogDemo.close') }}
          <!-- 关闭 -->
        </BaseButton>
      </template>
    </Dialog>
    <Dialog v-model="dialogVisible" :title="dialogTitle">
      <Write
        ref="writeRef"
        :form-schema="writeSchema"
        :current-row="currentRow"
        :type="actionType"
      />

      <template #footer>
        <BaseButton type="primary" :loading="saveLoading" @click="save">
          {{ t('exampleDemo.save') }}
          <!-- 保存 -->
        </BaseButton>
        <BaseButton @click="dialogVisible = false"
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
