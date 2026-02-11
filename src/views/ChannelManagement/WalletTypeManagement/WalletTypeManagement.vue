<script setup lang="tsx">
import { ref } from 'vue'
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/CustomSearch'
import { useI18n } from '@/hooks/web/useI18n'
import { Dialog } from '@/components/Dialog'
import { Table } from '@/components/Table'
import { Breadcrumb } from '@/components/Breadcrumb'
import { BaseButton } from '@/components/Button'
import { useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { useEnum } from '@/hooks/web/useEnum'
import { useEventBus } from '@/hooks/event/useEventBus'
import { Plus } from '@element-plus/icons-vue'
import Write from './components/Write.vue'
import { hasPermi } from '@/components/Permission'

// Composables
import { useWalletTypeTable } from './composables/useWalletTypeTable'
import { useWalletTypeDialog } from './composables/useWalletTypeDialog'

// Config
import { useTableColumns } from './config/tableColumns'

const { t } = useI18n()
const { countryOptions } = useEnum()

// 搜索参数
const searchParams = ref({})
const setSearchParams = (params: any) => {
  searchParams.value = params
  getList()
}

// 表格逻辑
const { tableRegister, loading, dataList, total, currentPage, pageSize, getList, handleDelete } =
  useWalletTypeTable(searchParams)

// 弹窗逻辑
const { dialogVisible, dialogTitle, currentRow, writeRef, saveLoading, openDialog, handleSave } =
  useWalletTypeDialog(() => {
    currentPage.value = 1
    getList()
  })

// 表格列配置
const { crudSchemas } = useTableColumns({
  countryOptions,
  onEdit: openDialog,
  onDelete: handleDelete
})

const { allSchemas } = useCrudSchemas(crudSchemas)

// 事件总线
useEventBus({
  name: 'getList',
  callback: (type: string) => {
    if (type === 'add') {
      currentPage.value = 1
    }
    getList()
  }
})
</script>

<template>
  <div>
    <ContentWrap class="search-section">
      <Search :schema="allSchemas.searchSchema" @search="setSearchParams" @reset="setSearchParams">
        <template #moreBtn>
          <BaseButton
            v-if="hasPermi('WalletTypesAdd')"
            type="warning"
            :icon="Plus"
            @click="openDialog()"
          >
            {{ t('exampleDemo.add') /* 添加 */ }}
          </BaseButton>
        </template>
      </Search>
    </ContentWrap>

    <ContentWrap>
      <Table
        row-key="uuid"
        v-model:page-size="pageSize"
        v-model:currentPage="currentPage"
        :columns="allSchemas.tableColumns"
        :data="dataList"
        :loading="loading"
        :pagination="{ total }"
        @register="tableRegister"
      >
        <template #empty>
          <div style="text-align: center; padding: 40px; color: #999">
            <img src="@/assets/imgs/no_data.png" style="width: 120px" />
            <p style="line-height: 30px">{{ t('common.noData') /* 暂无数据 */ }}</p>
          </div>
        </template>
      </Table>
    </ContentWrap>

    <Dialog v-model="dialogVisible" :title="dialogTitle">
      <Write ref="writeRef" :form-schema="allSchemas.formSchema" :current-row="currentRow" />
      <template #footer>
        <BaseButton type="primary" :loading="saveLoading" @click="handleSave">
          {{ t('exampleDemo.save') /* 保存 */ }}
        </BaseButton>
        <BaseButton @click="dialogVisible = false">
          {{ t('dialogDemo.close') /* 关闭 */ }}
        </BaseButton>
      </template>
    </Dialog>
  </div>
</template>

<style lang="css" scoped></style>
