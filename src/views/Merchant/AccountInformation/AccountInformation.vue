<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { Descriptions, DescriptionsSchema } from '@/components/Descriptions'
import { onMounted, PropType, reactive } from 'vue'
import { ElTag } from 'element-plus'
import { Breadcrumb } from '@/components/Breadcrumb'
import { sample } from 'lodash-es'
import { Alignment } from 'element-plus/es/components/table-v2/src/constants'

const { t } = useI18n()

const schema = reactive<DescriptionsSchema[]>([
  {
    field: 'name',
    label: t('accountInfo.name'),
    span: 24
  },
  {
    field: 'userId',
    label: t('accountInfo.userId'),
    span: 24
  },
  {
    field: 'userType',
    label: t('accountInfo.userType'),
    span: 24
  },
  {
    field: 'account',
    label: t('accountInfo.account'),
    span: 24
  },
  {
    field: 'registerTime',
    label: t('accountInfo.registerTime'),
    span: 24
  },
  {
    field: 'merchantKey',
    label: t('accountInfo.merchantKey'),
    span: 24
  },
  {
    field: 'collectionInterestRate',
    label: t('accountInfo.collectionInterestRate'),
    span: 24
  },
  {
    field: 'issuingInterestRate',
    label: t('accountInfo.issuingInterestRate'),
    span: 24
  },
  {
    field: 'internalRechargeRate',
    label: t('accountInfo.internalRechargeRate'),
    span: 24
  },
  {
    field: 'cashierBANKQRrate',
    label: t('accountInfo.cashierBANKQRrate'),
    span: 24
  },
  {
    field: 'scanZALOrate',
    label: t('accountInfo.scanZALOrate'),
    span: 24
  },
  {
    field: 'scanMOMOrate',
    label: t('accountInfo.scanMOMOrate'),
    span: 24
  },
  {
    field: 'scanViettelrate',
    label: t('accountInfo.scanViettelrate'),
    span: 24
  },
  {
    field: 'nativeMOMOrate',
    label: t('accountInfo.nativeMOMOrate'),
    span: 24
  },
  {
    field: 'nativeZALOrate',
    label: t('accountInfo.nativeZALOrate'),
    span: 24
  },
  {
    field: 'nativeViettelrate',
    label: t('accountInfo.nativeViettelrate'),
    span: 24
  },
  {
    field: 'cardBANKQRrate',
    label: t('accountInfo.cardBANKQRrate'),
    span: 24
  }
])

const sampleData = {
  name: 'John',
  userId: '12345',
  userType: 'Admin',
  account: 'john@example.com',
  registerTime: '2024-01-01 10:00:00',
  merchantKey: 'abc123xyz',
  collectionInterestRate: '2.5%',
  issuingInterestRate: '1.5%',
  internalRechargeRate: '1.0%',
  cashierBANKQRrate: '2.0%',
  scanZALOrate: '2.5%',
  scanMOMOrate: '3.0%',
  scanViettelrate: '1.8%',
  nativeMOMOrate: '2.2%',
  nativeZALOrate: '2.0%',
  nativeViettelrate: '1.7%',
  cardBANKQRrate: '2.8%'
}
</script>

<template>
  <ContentWrap :style="{ minHeight: '700px', display: 'flex', justifyContent: 'left' }">
    <Descriptions :style="{ maxWidth: '1000px' }" :schema="schema" :data="sampleData || {}" />
  </ContentWrap>
</template>
<style scoped>
:deep(.v-descriptions) {
  background-color: #cce5ff;
  border-color: #b8daff;
  border-radius: 10px;
}
:deep(.outline-solid) {
  outline-style: none;
}
:deep(.el-col) {
  margin: 10px;
  padding-right: 30px;
}
:deep(.text-left) {
  width: 30% !important;
  text-align: right !important;
  background-color: #cce5ff !important;
}
</style>
