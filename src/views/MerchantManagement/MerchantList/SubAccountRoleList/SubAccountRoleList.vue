<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/CustomSearch'
import { useI18n } from '@/hooks/web/useI18n'
import { Table } from '@/components/Table'
import { useTable } from '@/hooks/web/useTable'
import { ref, unref, reactive } from 'vue'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { useEventBus } from '@/hooks/event/useEventBus'
import { BaseButton } from '@/components/Button'
import { Dialog } from '@/components/Dialog'
import Write from './components/Write.vue'
import { useRoute } from 'vue-router'
import { UserRole } from '@/api/systemmanagement/types'
// @ts-ignore
import Permissions from './components/Permissions.tsx'
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/store/modules/app'
import { hasPermi } from '@/components/Permission'
import { getMerchantRoleApi, merchantRoleApi } from '@/api/merchantmanagement'

const ids = ref<string[]>([])
const route = useRoute()

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState

    // @ts-ignore
    const res = await getMerchantRoleApi(route.params.muid, {
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
    const res = await merchantRoleApi(route.params.muid, { action: 'del', data_uuid: ids.value[0] })
    return !!res.success
  }
})
const { loading, dataList, total, currentPage, pageSize } = tableState
const { getList, getElTableExpose, delList } = tableMethods
const permissionVisible = ref(false)
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
    field: 'name',
    label: t('systemManagement.roleName') /* 角色名称 */,
    'min-width': 160,
    search: {
      component: 'Input',
      componentProps: {
        placeholder: t('systemManagement.roleName') /* 角色名称 */
      }
    },
    form: {
      component: 'Input',
      componentProps: {
        placeholder: t('systemManagement.roleName') /* 角色名称 */
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
    field: 'role_code',
    label: t('systemManagement.roleCode') /* 角色代码 */,
    'min-width': 160,
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
    field: 'create_time',
    label: t('systemManagement.creationTime') /* 创建时间 */,
    search: {
      hidden: true
    },
    form: {
      hidden: true
    },
    'min-width': 160,
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
    'min-width': 160,
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
    field: 'Operate',
    label: t('systemManagement.operate') /* 操作 */,
    fixed: 'right',
    'min-width': 160,
    form: {
      hidden: true
    },
    detail: {
      hidden: true
    },
    search: {
      hidden: true
    },
    table: {
      'min-width': 160,
      slots: {
        default: (data: any) => {
          const row = data.row as UserRole
          return (
            <div style="display: flex; flex-wrap: wrap; justify-content: center; align-items: center;">
              {(hasPermi('mchRoleEdit') || true) && (
                <>
                  <BaseButton type="text" onClick={() => action(row, 'edit')}>
                    {t('exampleDemo.edit') /* 编辑 */}
                  </BaseButton>
                  <el-divider direction="vertical" class="w-[1px] h-[16px] bg-[#dfe6ec]" />
                </>
              )}
              {(hasPermi('mchRoleUpdatePermissions') || true) && (
                <>
                  <BaseButton type="text" style="margin-left: 0" onClick={() => permission(row)}>
                    {t('exampleDemo.permissions') /* 权限 */}
                  </BaseButton>
                  <el-divider direction="vertical" class="w-[1px] h-[16px] bg-[#dfe6ec]" />
                </>
              )}

              {(hasPermi('mchRoleDel') || true) && (
                <BaseButton type="text" onClick={() => delData(row)}>
                  {t('exampleDemo.del') /* 删除 */}
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

const currentRow = ref<UserRole>()
const actionType = ref('')

const onShowAddRole = () => {
  dialogTitle.value = t('exampleDemo.add') /* 新增 */
  currentRow.value = undefined
  dialogVisible.value = true
  actionType.value = ''
}

const delLoading = ref(false)

const delData = async (row?: UserRole) => {
  const elTableExpose = await getElTableExpose()
  ids.value = row
    ? [row.uuid]
    : elTableExpose?.getSelectionRows().map((v: UserRole) => v.uuid) || []
  delLoading.value = true

  await delList(unref(ids).length).finally(() => {
    delLoading.value = false
  })
}

const action = (row: UserRole, type: string) => {
  dialogTitle.value = t(type === 'edit' ? 'exampleDemo.edit' : 'exampleDemo.detail')
  actionType.value = type
  currentRow.value = { ...row }
  dialogVisible.value = true
}

const permission = (row: UserRole) => {
  currentRow.value = { ...row, permissions: row.permissions || [] }
  permissionVisible.value = true
}

const writeRef = ref<ComponentRef<typeof Write>>()
const permissionRef = ref<ComponentRef<typeof Permissions>>()
const saveLoading = ref(false)

const addRole = async () => {
  const write = unref(writeRef)
  const formData = await write?.submit()
  if (formData) {
    saveLoading.value = true
    try {
      const newValues = {
        action: 'add_role_data',
        name: formData.name,
        note: formData.note
      }
      const res = await merchantRoleApi(route.params.muid, newValues)
      if (res) {
        currentPage.value = 1
        getList()
        dialogVisible.value = false
      }
    } catch (error) {
      console.log(error)
    } finally {
      saveLoading.value = false
    }
  }
}

const editRole = async () => {
  const write = unref(writeRef)
  const formData = await write?.submit()
  if (formData) {
    saveLoading.value = true
    try {
      const newValues = {
        action: 'edit_role_data',
        name: formData.name,
        note: formData.note,
        data_uuid: currentRow.value.uuid
      }
      const res = await merchantRoleApi(route.params.muid, newValues)
      if (res) {
        currentPage.value = 1
        getList()
        dialogVisible.value = false
      }
    } catch (error) {
      console.log(error)
    } finally {
      saveLoading.value = false
    }
  }
}
const appStore = useAppStore()
const onSubmit = async () => {
  const permission = unref(permissionRef)
  // @ts-ignore
  const selected = await permission?.submit()
  const newValues = {
    action: 'updatePermissions',
    data_uuid: currentRow.value?.uuid,
    perCode: selected
  }

  saveLoading.value = true
  try {
    const res = await merchantRoleApi(route.params.muid, newValues)
    ElMessage.success(t('systemManagement.permissionUdated'))
    getList() // Refresh table
  } catch (e) {
    ElMessage.error(t('common.failedOperation'))
  }
  saveLoading.value = false
  permissionVisible.value = false
}
</script>

<template>
  <div>
    <ContentWrap class="search-section">
      <div class="log-search">
        <!-- <p style="min-width: 50px; padding-top: 8px">{{ t('common.search') }} :</p> -->
        <Search
          :schema="allSchemas.searchSchema"
          :show-add-role="hasPermi('mchRoleAdd') || true"
          @add-role="onShowAddRole"
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

    <Dialog v-model="dialogVisible" :title="dialogTitle">
      <Write ref="writeRef" :form-schema="allSchemas.formSchema" :current-row="currentRow" />

      <template #footer>
        <BaseButton
          v-if="actionType === 'edit'"
          type="primary"
          :loading="saveLoading"
          @click="editRole"
        >
          {{ t('exampleDemo.save') }}
          <!-- 保存 -->
        </BaseButton>
        <BaseButton
          v-if="actionType !== 'edit'"
          type="primary"
          :loading="saveLoading"
          @click="addRole"
        >
          {{ t('exampleDemo.save') }}
          <!-- 保存 -->
        </BaseButton>
        <BaseButton @click="dialogVisible = false">
          {{ t('dialogDemo.close') }}
          <!-- 关闭 -->
        </BaseButton>
      </template>
    </Dialog>
    <Dialog v-model="permissionVisible" :title="t('permission.modification') /* 权限修改 */">
      <Permissions ref="permissionRef" :userPermissions="currentRow?.permissions || []" />
      <template #footer>
        <BaseButton type="primary" :loading="saveLoading" @click="onSubmit">
          {{ t('exampleDemo.save') }}
        </BaseButton>
        <BaseButton @click="permissionVisible = false">
          {{ t('dialogDemo.close') }}
          <!-- 关闭 -->
        </BaseButton>
      </template>
    </Dialog>
  </div>
</template>
