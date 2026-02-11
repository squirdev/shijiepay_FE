<script setup lang="ts">
import { useIcon } from '@/hooks/web/useIcon'
import { propTypes } from '@/utils/propTypes'
import { useI18n } from '@/hooks/web/useI18n'
import { Search, Refresh, Plus, Histogram, Download, ShoppingCart } from '@element-plus/icons-vue'

const emit = defineEmits([
  'search',
  'reset',
  'expand',
  'add-account',
  'add-role',
  'add-channel',
  'add-merchant-category',
  'add-merchant',
  'export-order-data',
  'order-statistics',
  'add-bankcard',
  'apply-settlement',
  'total',
  'export-data',
  'add',
  'show-batch-open',
  'show-batch-close',
  'show-batch-rate',
  'show-batch-fee'
])

const { t } = useI18n()

defineProps({
  showSearch: propTypes.bool.def(true),
  showReset: propTypes.bool.def(true),
  showAdd: propTypes.bool.def(false),
  showTotal: propTypes.bool.def(false),
  showExpand: propTypes.bool.def(false),
  showAddAccount: propTypes.bool.def(false),
  showAddRole: propTypes.bool.def(false),
  showAddChannel: propTypes.bool.def(false),
  showAddMerchant: propTypes.bool.def(false),
  showAddMerchantCategory: propTypes.bool.def(false),
  showExportOrderData: propTypes.bool.def(false),
  showExportData: propTypes.bool.def(false),
  showOrderStatistics: propTypes.bool.def(false),
  showAddBankcard: propTypes.bool.def(false),
  showApplySettlement: propTypes.bool.def(false),
  visible: propTypes.bool.def(true),
  searchLoading: propTypes.bool.def(false),
  resetLoading: propTypes.bool.def(false),
  showBatchOpen: propTypes.bool.def(false),
  showBatchClose: propTypes.bool.def(false),
  showBatchRate: propTypes.bool.def(false),
  showBatchFee: propTypes.bool.def(false)
})

const onSearch = () => {
  emit('search')
}

const onReset = () => {
  emit('reset')
}

const onExpand = () => {
  emit('expand')
}

const onExportData = () => {
  emit('export-data')
}

const onAddAccount = () => {
  emit('add-account')
}

const onTotal = () => {
  emit('total')
}

const onAdd = () => {
  emit('add')
}

const onAddRole = () => {
  emit('add-role')
}

const onAddChannel = () => {
  emit('add-channel')
}

const onAddMerchantCategory = () => {
  emit('add-merchant-category')
}

const onAddMerchant = () => {
  emit('add-merchant')
}

const onExportOrderData = () => {
  emit('export-order-data')
}

const onOrderStatistics = () => {
  emit('order-statistics')
}

const onAddBankcard = () => {
  emit('add-bankcard')
}

const onApplySettlement = () => {
  emit('apply-settlement')
}

const onShowBatchOpen = () => {
  emit('show-batch-open')
}

const onShowBatchClose = () => {
  emit('show-batch-close')
}

const onShowBatchRate = () => {
  emit('show-batch-rate')
}
const onShowBatchFee = () => {
  emit('show-batch-fee')
}
</script>

<template>
  <BaseButton
    v-if="showSearch"
    type="primary"
    :icon="Search"
    :loading="searchLoading"
    @click="onSearch"
  >
    {{ t('common.search') }}
  </BaseButton>
  <BaseButton v-if="showReset" :icon="Refresh" :loading="resetLoading" plain @click="onReset">
    {{ t('common.reset') }}
  </BaseButton>
  <BaseButton
    v-if="showExpand"
    :icon="useIcon({ icon: visible ? 'vi-ep:arrow-up' : 'vi-ep:arrow-down' })"
    text
    @click="onExpand"
  >
    {{ t(visible ? 'common.shrink' : 'common.expand') }}
  </BaseButton>
  <BaseButton v-if="showAddAccount" type="warning" @click="onAddAccount">
    {{ t('systemManagement.addAccount') }}
  </BaseButton>
  <BaseButton v-if="showTotal" :icon="ShoppingCart" type="warning" @click="onTotal">
    {{ t('totalData.total') }}
  </BaseButton>
  <BaseButton v-if="showAdd" :icon="Plus" type="warning" @click="onAdd">
    {{ t('exampleDemo.add') }}
  </BaseButton>
  <BaseButton v-if="showAddRole" :icon="Plus" type="warning" @click="onAddRole">
    {{ t('systemManagement.addRole') }}
  </BaseButton>
  <BaseButton v-if="showExportOrderData" :icon="Download" type="warning" @click="onExportOrderData">
    {{ t('paymentManagement.exportOrderData') }}
  </BaseButton>
  <BaseButton v-if="showExportData" :icon="Download" type="warning" @click="onExportData">
    {{ t('common.exportData') }}
  </BaseButton>
  <BaseButton
    v-if="showOrderStatistics"
    :icon="Histogram"
    type="warning"
    @click="onOrderStatistics"
  >
    {{ t('paymentManagement.statistics') }}
  </BaseButton>
  <BaseButton v-if="showAddBankcard" type="warning" @click="onAddBankcard">
    {{ t('bankCardInfo.addBankcard') }}
  </BaseButton>
  <BaseButton v-if="showApplySettlement" type="warning" @click="onApplySettlement">
    {{ t('bankCardInfo.applySettlement') }}
  </BaseButton>
  <BaseButton v-if="showAddChannel" :icon="Plus" type="warning" @click="onAddChannel">
    {{ t('common.addChannel') }}
  </BaseButton>
  <BaseButton
    v-if="showAddMerchantCategory"
    :icon="Plus"
    type="warning"
    @click="onAddMerchantCategory"
  >
    {{ t('merchantClassification.addCategory') }}
  </BaseButton>
  <BaseButton v-if="showAddMerchant" :icon="Plus" type="warning" @click="onAddMerchant">
    {{ t('merchantList.addMerchant') }}
  </BaseButton>
  <BaseButton v-if="showBatchOpen" type="warning" @click="onShowBatchOpen"> 批量开启 </BaseButton>
  <BaseButton v-if="showBatchClose" type="warning" @click="onShowBatchClose"> 批量关闭 </BaseButton>
  <BaseButton v-if="showBatchRate" type="warning" @click="onShowBatchRate">
    批量修改费率
  </BaseButton>
  <BaseButton v-if="showBatchFee" type="warning" @click="onShowBatchFee">
    批量修改单笔费用
  </BaseButton>
</template>
