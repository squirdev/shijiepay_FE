<script setup lang="tsx">
import { ref } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { ContentWrap } from '@/components/ContentWrap'
import { Breadcrumb } from '@/components/Breadcrumb'
import { Search } from '@/components/CustomSearch'
import { Dialog } from '@/components/Dialog'
import { ChannelInfotip } from '@/components/ChannelInfotip'
import { Table } from '@/components/Table'
import { BaseButton } from '@/components/Button'
import { useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { useEnum } from '@/hooks/web/useEnum'
import { useEventBus } from '@/hooks/event/useEventBus'
import Write from './components/Write.vue'

// Composables
import { useTunnelTable } from './composables/useTunnelTable'
import { useTunnelDialog } from './composables/useTunnelDialog'

// Config
import { useTableColumns } from './config/tableColumns'
import { hasPermi } from '@/components/Permission'

const { t } = useI18n()
const { countryOptions } = useEnum()

// 搜索参数
const searchParams = ref({})

const setSearchParams = (params: any) => {
  searchParams.value = params
  getList()
}

// 表格逻辑
const {
  tableRegister,
  loading,
  dataList,
  total,
  currentPage,
  pageSize,
  tunnelDatas,
  getList,
  handleDelete,
  handleStatusChange
} = useTunnelTable(searchParams)

// 弹窗逻辑
const { dialogVisible, dialogTitle, currentRow, writeRef, saveLoading, openDialog, handleSave } =
  useTunnelDialog(() => {
    currentPage.value = 1
    getList()
  })

// 表格列配置
const { crudSchemas } = useTableColumns({
  countryOptions,
  tunnelDatas,
  currentRow,
  onEdit: (row) => openDialog('edit', row),
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
    <ChannelInfotip :show-index="false" :title="`${t('channelInfotip.recommendedUse')}`" />

    <ContentWrap class="search-section">
      <Search
        :schema="allSchemas.searchSchema"
        :show-add="hasPermi('tunnelRateAdd')"
        @add="openDialog('add')"
        @search="setSearchParams"
        @reset="setSearchParams"
      />
    </ContentWrap>

    <ContentWrap>
      <Table
        v-model:pageSize="pageSize"
        v-model:currentPage="currentPage"
        :loading="loading"
        :columns="allSchemas.tableColumns"
        :data="dataList"
        style="font-size: small"
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

<style>
.lg-middle {
  width: 100%;
}
@media (min-width: 992px) {
  .lg-middle {
    min-width: 60%;
    max-width: 65%;
  }
}
</style>
