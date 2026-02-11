<script setup lang="tsx">
import { onMounted, ref } from 'vue'
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/CustomSearch'
import { useI18n } from '@/hooks/web/useI18n'
import { Dialog } from '@/components/Dialog'
import { useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { Table } from '@/components/Table'
import { useEventBus } from '@/hooks/event/useEventBus'
import { BaseButton } from '@/components/Button'
import Write from './components/Write.vue'
import BankConfig from './components/BankConfig'
import CollectionConfig from './components/CollectionConfig'
import CollectionTest from './components/CollectionTest'
import NegotiationTest from './components/NegotiationTest'
import SecretForm from './components/SecretForm'
import DockingInfo from './components/DockingInfo'
import CopyConfigForm from './components/CopyConfigForm'
import RejectionInfoModal from './components/RejectionInfoModal'
import EditSettingsDialog from './components/PayoutOrderSettingsDialog.vue'
// Composables
import { useTripartOptions } from './composables/useTripartOptions'
import { useTripartTable } from './composables/useTripartTable'
import { useTripartDialog } from './composables/useTripartDialog'
import { useConfigDialogs } from './composables/useConfigDialogs'
import { useSecretDialog } from './composables/useSecretDialog'
import { useDockingDialog } from './composables/useDockingDialog'
import { useCopyConfigDialog } from './composables/useCopyConfigDialog'
import { useTableColumns } from './config/tableColumns'
import { useRejectionInfoModal } from './composables/useRejectionInfoModal'
import { hasPermi } from '@/components/Permission'
import { ElMessage, ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus'
import { createTripartApi } from '@/api/channelmanagement'
import { Refresh, Plus } from '@element-plus/icons-vue'

const { t } = useI18n()

// 搜索参数
const searchParams = ref({})
const setSearchParams = (params: any) => {
  searchParams.value = params
  getList()
}

// 选项数据
const { countryOptions, payModuleOptions, tunnelOptions, currentCountry, filteredModuleOptions } =
  useTripartOptions()

// 表格逻辑
const {
  tableRegister,
  ids,
  loading,
  dataList,
  total,
  currentPage,
  pageSize,
  getList,
  handleDelete,
  handleUpdateBalance,
  handleStatusChange,
  payoutStatusChange,
  handleBatchBalance,
  handleSelectionChange,
  clearSelection
} = useTripartTable(searchParams)

const isBatch = ref(false)

const handleBatchUpdateRejectionInfo = () => {
  if (ids.value.length === 0) {
    ElMessage.error(t('common.selectData')) /* 请选择数据 */
    return
  }
  isBatch.value = true
  openRejectionInfoModal(ids.value)
}

const handleSingleUpdateRejectionInfo = (row: any) => {
  isBatch.value = false
  openRejectionInfoModal(row)
}

// 基础编辑弹窗
const { dialogVisible, dialogTitle, currentRow, writeRef, saveLoading, openDialog, handleSave } =
  useTripartDialog({
    currentCountry,
    tunnelOptions,
    onSuccess: () => {
      currentPage.value = 1
      getList()
    }
  })

// 配置弹窗（代收配置、银行配置、测试）
const {
  configVisible,
  configCurrentRow,
  openCollectionConfig,
  handleCollectionSave,
  bankVisible,
  bankCurrentRow,
  openBankConfig,
  handleBankSave,
  testVisible,
  testCurrentRow,
  openTestDialog,
  handleTestSave,
  testDfVisible,
  testDfCurrentRow,
  openTestDfDialog,
  handleTestDfSave
} = useConfigDialogs(getList)

// 编辑设置弹窗
const editSettingsVisible = ref(false)
const editSettingsCurrentRow = ref()
const settingsSaveLoading = ref(false)

const openEditSettingsDialog = (row) => {
  editSettingsCurrentRow.value = row
  editSettingsVisible.value = true
}
const handleEditSettingsSave = async (formData) => {
  const {
    max_consecutive_failures,
    min_limit_balance_amount,
    max_limit_balance_amount,
    payout_amount_min,
    payout_amount_max,
    payout_ck_amount_min,
    payout_ck_amount_max,
    payout_daily_limit_count,
    payment_amount_min,
    payment_amount_max,
    sf_not_callback_close
  } = formData

  // 验证余额提醒金额
  if (
    !(Number(min_limit_balance_amount) === 0 && Number(max_limit_balance_amount) === 0) &&
    Number(min_limit_balance_amount) >= Number(max_limit_balance_amount)
  ) {
    ElMessage.error(
      t('tripartiteList.balanceAmountError')
    ) /* 余额最低提醒金额不能大于等于余额最高提醒金额! */
    return
  }

  if (
    !(Number(payout_amount_min) === 0 && Number(payout_amount_max) === 0) &&
    Number(payout_amount_min) >= Number(payout_amount_max)
  ) {
    ElMessage.error('代付最小接单金额不能大于等于代付最大接单金额')
    return
  }

  if (
    !(Number(payout_ck_amount_min) === 0 && Number(payout_ck_amount_max) === 0) &&
    Number(payout_ck_amount_min) >= Number(payout_ck_amount_max)
  ) {
    ElMessage.error('代付最小出款金额不能大于等于代付最大出款金额')
    return
  }

  if (
    !(Number(payment_amount_min) === 0 && Number(payment_amount_max) === 0) &&
    Number(payment_amount_min) >= Number(payment_amount_max)
  ) {
    ElMessage.error('代收接单金额最小值不能大于等于代收接单金额最大值')
    return
  }

  const params = {
    max_consecutive_failures,
    min_limit_balance_amount,
    max_limit_balance_amount,
    payout_amount_min,
    payout_amount_max,
    payout_ck_amount_min,
    payout_ck_amount_max,
    payment_amount_min,
    payment_amount_max,
    payout_daily_limit_count,
    sf_not_callback_close,
    action: 'threePartyDfjdpz',
    data_uuid: editSettingsCurrentRow.value?.uuid
  }

  settingsSaveLoading.value = true
  try {
    const res = await createTripartApi(params)

    if (res?.success) {
      ElMessage.success(t('common.successOperation')) /* 操作成功 */
      editSettingsVisible.value = false
      // currentPage.value = 1
      getList()
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    console.error('Failed to save:', error)
  } finally {
    settingsSaveLoading.value = false
  }
}

// 密钥弹窗
const {
  secretVisible,
  secretFormRef,
  openSecretDialog,
  handleGetSecret,
  saveLoading: secretLoading
} = useSecretDialog(getList)

// 对接信息弹窗
const {
  infoVisible,
  infoFormRef,
  currentRow: infoCurrentRow,
  openDockingDialog,
  handleSaveDocking,
  saveLoading: dockingLoading
} = useDockingDialog(() => {
  currentPage.value = 1
  getList()
})

// 复制配置弹框
const {
  copyConfigVisible,
  copyConfigFormRef,
  currentRow: copyCurrentRow,
  saveLoading: copyLoading,
  openCopyConfigDialog,
  saveCopyConfig
} = useCopyConfigDialog({
  onSuccess: () => {
    currentPage.value = 1
    getList()
  }
})

// 复制配置弹框
const {
  rejectionInfoModalVisible,
  currentRows: rejectionInfoCurrentRow,
  openRejectionInfoModal,
  handleSave: rejectInfoSave
} = useRejectionInfoModal(() => {
  clearSelection()
  currentPage.value = 1
  getList()
})

// 表格列配置
const { crudSchemas } = useTableColumns({
  countryOptions,
  payModuleOptions,
  filteredModuleOptions,
  currentCountry,
  handleStatusChange,
  payoutStatusChange,
  openDialog,
  handleUpdateBalance,
  handleDelete,
  showConfigModal: openCollectionConfig,
  showBankModal: openBankConfig,
  showSecretModal: openSecretDialog,
  showInfoModal: openDockingDialog,
  showCollectionTestModal: openTestDialog,
  showNegotiationTestModal: openTestDfDialog,
  showCopyConfigModal: openCopyConfigDialog,
  showRejectInfoModal: handleSingleUpdateRejectionInfo,
  showEditSettingsModal: openEditSettingsDialog
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
            type="warning"
            v-if="hasPermi('threePartyAdd')"
            :icon="Plus"
            @click="openDialog('add')"
            >新增
          </BaseButton>

          <BaseButton type="warning" @click="handleBatchBalance">批量刷新余额 </BaseButton>
          <BaseButton
            type="warning"
            v-if="hasPermi('threePartyPzBhxx')"
            @click="handleBatchUpdateRejectionInfo"
          >
            批量修改驳回信息</BaseButton
          >
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

    <Dialog v-model="dialogVisible" :title="dialogTitle">
      <div class="mr-20px">
        <Write ref="writeRef" :form-schema="allSchemas.formSchema" :current-row="currentRow" />
      </div>
      <template #footer>
        <BaseButton type="primary" :loading="saveLoading" @click="handleSave">
          {{ t('exampleDemo.save') /* 保存 */ }}
        </BaseButton>
        <BaseButton @click="dialogVisible = false">
          {{ t('dialogDemo.close') /* 关闭 */ }}
        </BaseButton>
      </template>
    </Dialog>

    <BankConfig
      v-model="bankVisible"
      :visible="bankVisible"
      :row="bankCurrentRow"
      :saveCallback="handleBankSave"
    />

    <CollectionConfig
      v-model="configVisible"
      :visible="configVisible"
      :row="configCurrentRow"
      :saveCallback="handleCollectionSave"
    />

    <CollectionTest
      v-model="testVisible"
      :visible="testVisible"
      :row="testCurrentRow"
      :saveCallback="handleTestSave"
    />
    <NegotiationTest
      v-model="testDfVisible"
      :visible="testDfVisible"
      :row="testDfCurrentRow"
      :saveCallback="handleTestDfSave"
    />

    <EditSettingsDialog
      v-model="editSettingsVisible"
      :row="editSettingsCurrentRow"
      :saveLoading="settingsSaveLoading"
      @submit="handleEditSettingsSave"
    />

    <Dialog
      v-model="secretVisible"
      :title="t('tripartiteList.viewSecret') /* 查看密钥 */"
      :max-height="200"
    >
      <div class="mr-20px">
        <SecretForm ref="secretFormRef" />
      </div>
      <template #footer>
        <BaseButton type="primary" :loading="secretLoading" @click="handleGetSecret">
          {{ t('common.ok') /* 提交 */ }}
        </BaseButton>
        <BaseButton @click="secretVisible = false">
          {{ t('dialogDemo.close') /* 关闭 */ }}
        </BaseButton>
      </template>
    </Dialog>

    <Dialog
      v-model="infoVisible"
      :title="t('tripartiteList.viewDockingInfo') /* 查看对接信息 */"
      :max-height="400"
    >
      <div class="mr-20px">
        <DockingInfo ref="infoFormRef" :docking_info="infoCurrentRow?.docking_info" />
      </div>
      <template #footer>
        <BaseButton type="primary" :loading="dockingLoading" @click="handleSaveDocking">
          {{ t('common.ok') /* 提交 */ }}
        </BaseButton>
        <BaseButton @click="infoVisible = false">
          {{ t('dialogDemo.close') /* 关闭 */ }}
        </BaseButton>
      </template>
    </Dialog>
    <!-- TODO -->
    <Dialog v-model="copyConfigVisible" title="复制配置并新建">
      <div class="mr-20px">
        <CopyConfigForm ref="copyConfigFormRef" :row="copyCurrentRow" />
      </div>
      <template #footer>
        <BaseButton type="primary" :loading="copyLoading" @click="saveCopyConfig">
          {{ t('exampleDemo.save') }}
        </BaseButton>
        <BaseButton @click="copyConfigVisible = false">{{ t('dialogDemo.close') }}</BaseButton>
      </template>
    </Dialog>

    <RejectionInfoModal
      v-model="rejectionInfoModalVisible"
      :visible="rejectionInfoModalVisible"
      :selectedIds="ids"
      :row="rejectionInfoCurrentRow"
      :is-batch="isBatch"
      :saveCallback="rejectInfoSave"
    />
  </div>
</template>

<style lang="css" scoped>
.collection-channel {
  min-width: auto !important;
}

.el-form-item:has(.collection-channel) {
  margin-right: 0.5rem !important;
}
</style>
