<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { ElTabs, ElTabPane } from 'element-plus'
import { ref, onMounted } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { Breadcrumb } from '@/components/Breadcrumb'
import { getPayoutConfigApi } from '@/api/paymentmanagement'
import { BankType } from '@/api/paymentmanagement/types'
import { useAppStore } from '@/store/modules/app'
import ConfigForm from './components/ConfigForm'
import BaseConfigForm from './components/BaseConfigForm'
import PHConfigForm from './components/PHConfigForm'

interface ValueItem {
  id?: string
  amount_min: number
  amount_max: number
  amount: number
}

interface SelectConfig {
  payount_statu: boolean
  batch_payout_amount_limit: number
  ph_payount_statu: boolean
  vn_payount_statu: boolean
  vn_maintain_bankcodes: string[]
  ph_maintain_bankcodes: string[]
  fisbursed_amount_interval: ValueItem[]
}

interface Bank {
  vn_bank_datas: BankType[]
  ph_bank_datas: BankType[]
  ph_not_select_banks: string[]
  vn_not_select_banks: string[]
}

const appStore = useAppStore()
const activeName = ref('first')

const banks = ref<Bank>({
  vn_bank_datas: [], // 越南所有的银行
  ph_bank_datas: [], // 菲律宾所有的银行
  ph_not_select_banks: [],
  vn_not_select_banks: []
})
const selectedBanks = ref<SelectConfig>({
  payount_statu: false,
  batch_payout_amount_limit: 0,
  ph_payount_statu: false,
  vn_payount_statu: false,
  vn_maintain_bankcodes: [],
  ph_maintain_bankcodes: [],
  fisbursed_amount_interval: []
})
const { t } = useI18n()

const fetchBanks = async () => {
  appStore.pageLoading = true
  try {
    const response = await getPayoutConfigApi()
    if (!response?.success) return

    const { site_data, vn_bank_datas, ph_bank_datas, vn_not_select_banks, ph_not_select_banks } =
      response.data ?? {}

    banks.value = {
      vn_bank_datas:
        vn_bank_datas?.map((bank) => ({
          code: bank.code,
          name: bank.code,
          logo: bank.logo,
          uuid: bank.uuid,
          transferSupported: bank.transferSupported
        })) ?? [],
      ph_bank_datas:
        ph_bank_datas?.map((bank) => ({
          code: bank.code,
          name: bank.code,
          logo: bank.logo,
          uuid: bank.uuid,
          transferSupported: bank.transferSupported
        })) ?? [],
      vn_not_select_banks: vn_not_select_banks ?? [],
      ph_not_select_banks: ph_not_select_banks ?? []
    }

    selectedBanks.value = {
      payount_statu: !!site_data?.payount_statu,
      batch_payout_amount_limit: site_data?.batch_payout_amount_limit,
      ph_payount_statu: !!site_data?.ph_payount_statu,
      vn_payount_statu: !!site_data?.vn_payount_statu,
      vn_maintain_bankcodes: site_data?.vn_maintain_bankcodes ?? [],
      ph_maintain_bankcodes: site_data?.ph_maintain_bankcodes ?? [],
      fisbursed_amount_interval: site_data?.fisbursed_amount_interval ?? []
    }
  } catch (error) {
    console.error('Error fetching bank data:', error)
  } finally {
    appStore.pageLoading = false
  }
}

onMounted(() => {
  fetchBanks()
})
</script>

<template>
  <ContentWrap style="padding: 0px 16px">
    <ElTabs v-model="activeName" class="demo-tabs">
      <ElTabPane label="代付配置" name="first">
        <BaseConfigForm
          :payount_statu="selectedBanks.payount_statu"
          :batch_payout_amount_limit="selectedBanks.batch_payout_amount_limit"
        />
      </ElTabPane>
      <!-- 越南代付配置 -->
      <ElTabPane label="越南代付配置" name="second">
        <ConfigForm
          key="vn_bank_datas"
          class="red-checkbox-group"
          action="updateVnConfig"
          :bankData="banks.vn_bank_datas"
          :payount_statu="selectedBanks.vn_payount_statu"
          :selectBank="selectedBanks.vn_maintain_bankcodes"
          :notSelectBanks="banks.vn_not_select_banks"
        />
      </ElTabPane>
      <!-- 菲律宾代付配置 -->
      <ElTabPane label="菲律宾代付配置" name="third">
        <PHConfigForm
          key="ph_bank_datas"
          action="updatePhConfig"
          :bankData="banks.ph_bank_datas"
          :payount_statu="selectedBanks.ph_payount_statu"
          :selectBank="selectedBanks.ph_maintain_bankcodes"
          :notSelectBanks="banks.ph_not_select_banks"
          :fisbursed_amount_interval="selectedBanks.fisbursed_amount_interval"
        />
      </ElTabPane>
    </ElTabs>
  </ContentWrap>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #fafafa;
}

.header h2 {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
}

.page-body {
  display: flex;
  flex-direction: column;
  width: 80%;
  padding: 30px;
}

.actions {
  display: flex;
  gap: 10px;
}

.service-section {
  width: 40%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.bank-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px 0;
}
.red-checkbox-group {
  --el-checkbox-checked-input-fill: #f56c6c; /* 选中背景色 */
  --el-checkbox-checked-icon-color: #fff; /* 对勾颜色 */
  --el-checkbox-checked-border-color: #f56c6c; /* 选中边框色 */
  --el-checkbox-input-border-color-hover: #f56c6c; /* 悬停边框色 */
}

.bankForm :deep(.el-checkbox-button__inner) {
  padding: 10px 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
  transition: all 0.3s ease;
  cursor: pointer;
}

.bankFormItem.el-checkbox.el-checkbox--default {
  height: auto;
  /* width: 100% !important;*/
  padding: 10px 20px !important;
  margin-bottom: 20px !important;
}
.bankFormItem .el-checkbox__label {
  display: flex;
  flex-direction: column;
  flex: 1 !important;
}
.bankFormItem .checkbox-group-container {
  flex: 1 !important;
}
</style>
