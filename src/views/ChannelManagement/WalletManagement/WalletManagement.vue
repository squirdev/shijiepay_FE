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
import { useEventBus } from '@/hooks/event/useEventBus'
import Write from './components/Write.vue'
import FeeRangeForm from './components/FeeRangeForm'

// Composables
import { useWalletOptions } from './composables/useWalletOptions'
import { useWalletTable } from './composables/useWalletTable'
import { useWalletDialog } from './composables/useWalletDialog'
import { useRangeDialog } from './composables/useRangeDialog'

// Config
import { useTableColumns } from './config/tableColumns'
import { hasPermi } from '@/components/Permission'

const { t } = useI18n()

// 搜索参数
const searchParams = ref({})
const setSearchParams = (params: any) => {
  searchParams.value = params
  getList()
}

// 选项数据
const { currentCountry, countryOptions, filteredWalletTypeOptions } = useWalletOptions()

// 表格逻辑
const {
  tableRegister,
  loading,
  dataList,
  total,
  currentPage,
  pageSize,
  ids,
  getList,
  getElTableExpose,
  handleSelectionChange
} = useWalletTable(searchParams)

// 编辑弹窗逻辑
const {
  dialogVisible,
  currentRow,
  writeRef,
  saveLoading,
  batchType,
  openEditDialog,
  openBatchDialog,
  handleSave
} = useWalletDialog({
  ids,
  getElTableExpose,
  onSuccess: () => {
    currentPage.value = 1
    getList()
  }
})

// 区间费用弹窗逻辑
const {
  rangeFormVisible,
  currentRow: rangeCurrentRow,
  rangeFormRef,
  saveLoading: rangeSaveLoading,
  openRangeDialog,
  openBatchRangeDialog,
  handleSaveRange
} = useRangeDialog({
  ids,
  getElTableExpose,
  onSuccess: () => {
    currentPage.value = 1
    getList()
  }
})

// 表格列配置
const { crudSchemas } = useTableColumns({
  countryOptions,
  currentCountry,
  filteredWalletTypeOptions,
  onEdit: openEditDialog,
  onRangeConfig: openRangeDialog
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
      <Search
        :schema="allSchemas.searchSchema"
        :show-batch-rate="hasPermi('walletPlXgfl')"
        @search="setSearchParams"
        @reset="setSearchParams"
        @show-batch-rate="openBatchDialog('rate')"
      >
        <template #moreBtn>
          <BaseButton v-if="hasPermi('walletXgqjfy')" type="warning" @click="openBatchRangeDialog">
            {{ t('paymentBank.batchEditIntervalFee') /* 批量修改单笔区间费用 */ }}
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
        @selection-change="handleSelectionChange"
      >
        <template #empty>
          <div style="text-align: center; padding: 40px; color: #999">
            <img src="@/assets/imgs/no_data.png" style="width: 120px" />
            <p style="line-height: 30px">{{ t('common.noData') /* 暂无数据 */ }}</p>
          </div>
        </template>
      </Table>
    </ContentWrap>

    <Dialog v-model="dialogVisible" :title="t('exampleDemo.edit') /* 编辑 */">
      <Write
        ref="writeRef"
        :form-schema="allSchemas.formSchema"
        :current-row="currentRow"
        :batchType="batchType"
      />
      <template #footer>
        <BaseButton type="primary" :loading="saveLoading" @click="handleSave">
          {{ t('exampleDemo.save') /* 保存 */ }}
        </BaseButton>
        <BaseButton @click="dialogVisible = false">
          {{ t('dialogDemo.close') /* 关闭 */ }}
        </BaseButton>
      </template>
    </Dialog>

    <Dialog
      v-model="rangeFormVisible"
      :title="t('paymentBank.rangeConfig') /* 区间费用配置 */"
      width="720px"
    >
      <FeeRangeForm ref="rangeFormRef" :row="rangeCurrentRow as any" />
      <template #footer>
        <BaseButton type="primary" :loading="rangeSaveLoading" @click="handleSaveRange">
          {{ t('exampleDemo.save') /* 保存 */ }}
        </BaseButton>
        <BaseButton @click="rangeFormVisible = false">
          {{ t('dialogDemo.close') /* 关闭 */ }}
        </BaseButton>
      </template>
    </Dialog>
  </div>
</template>

<style lang="css" scoped></style>
