<script setup lang="tsx">
import { onMounted, ref, unref, computed } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { merchantUserApi } from '@/api/merchant'
import { Dialog } from '@/components/Dialog'
import SecretForm from '@/views/MerchantManagement/MerchantList/components/SecretForm'
import EditMchPassword from './EditMchPassword.vue' // 引入修改密码组件
import { Decimal } from 'decimal.js'
import { copyToClipboard } from '@/utils'

// 1. 显式导入 Element Plus 组件和样式
import {
  ElMessage,
  ElDescriptions,
  ElDescriptionsItem,
  ElCard,
  ElButton,
  ElTabs,
  ElTabPane
} from 'element-plus'
import 'element-plus/es/components/descriptions/style/css'
import 'element-plus/es/components/descriptions-item/style/css'
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/card/style/css'

const { t } = useI18n()

interface MerchantInfo {
  merchant_name?: string
  account?: string
  merchant_id?: string
  countryName?: string
  balance_amount?: string
  issued_money_rate?: string
  payment_rate?: string
  recharge_money_rate?: string
  tunnel_datas?: Array<{ name: string; rate: number }>
  [key: string]: any
}

const mchInfo = ref<MerchantInfo>({})
const merchantKey = ref({
  key: '',
  isShow: false
})

const saveLoading = ref(false)
const secretVisible = ref(false)
const passwordVisible = ref(false) // 修改密码弹窗控制
const secretFormRef = ref()
const mchActiveName = ref('first')

// 获取商户信息
const fetchMerchantUserApi = async () => {
  const res = await merchantUserApi({ action: 'getMchInfo' })
  if (!res?.success) return

  const balance_amount = new Decimal(res.data.balance_amount || 0)
    .add(res.data.native_balance_amount || 0)
    .toNumber()

  res.data.balance_amount = balance_amount.toLocaleString()
  res.data.issued_money_rate = `${new Decimal(res.data.issued_money_rate || 0).mul(100).toString()}`
  res.data.payment_rate = `${new Decimal(res.data.payment_rate || 0).mul(100).toString()}`
  res.data.recharge_money_rate = `${new Decimal(res.data.recharge_money_rate || 0).mul(100).toString()}`
  res.data.countryName = res.data?.country?.name ?? ''

  mchInfo.value = res.data
}

// 计算属性：过滤有效的通道数据
const validTunnels = computed(() => {
  return mchInfo.value?.tunnel_datas?.filter((l) => l.name) || []
})

// 查看/隐藏秘钥逻辑
const showPwdModal = (isShow: boolean) => {
  const currentStatus = !isShow
  if (currentStatus) {
    secretVisible.value = true
  } else {
    merchantKey.value.isShow = currentStatus
    merchantKey.value.key = ''
  }
}

// 提交查看秘钥的表单
const updateSecret = async () => {
  const secretForm = unref(secretFormRef)
  const formData = await secretForm?.submit()
  if (!formData) return

  const newValues = {
    action: 'get_secret_key',
    ...formData
  }

  try {
    saveLoading.value = true
    const res = await merchantUserApi(newValues)
    if (res?.success) {
      ElMessage.success(t('common.successOperation'))
      secretVisible.value = false
      merchantKey.value = {
        key: res.data.secret_key ?? '',
        isShow: true
      }
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    console.error(error)
  } finally {
    saveLoading.value = false
  }
}

const passwordRef = ref()
// 修改密码弹窗关闭回调
const closePasswordDialog = () => {
  passwordVisible.value = false
}

const handleSavePassword = () => {
  passwordRef.value?.save()
}

onMounted(() => {
  fetchMerchantUserApi()
})
</script>

<template>
  <div class="account-info-container">
    <ElTabs v-model="mchActiveName">
      <ElTabPane label="基本信息" name="first">
        <!-- 模块一：账号信息 (模仿截图样式) -->
        <ElCard shadow="hover" class="mb-20px info-card w-[800px]">
          <template #header>
            <div class="card-header">
              <span class="title">账号信息</span>
              <p class="subtitle">您的账号基本信息</p>
            </div>
          </template>

          <div class="info-row">
            <div class="label">{{ t('accountInfo.account') }}</div>
            <div class="value-text">{{ mchInfo.account || '-' }}</div>
          </div>

          <div class="info-row mt-15px">
            <div class="label">密码</div>
            <div class="value-box">
              <span>••••••••••••••••</span>
            </div>
            <ElButton type="primary" class="ml-15px" @click="passwordVisible = true"
              >修改密码</ElButton
            >
          </div>
        </ElCard>

        <!-- 模块二：API 信息 (模仿截图样式) -->
        <ElCard shadow="hover" class="info-card w-[800px]">
          <template #header>
            <div class="card-header">
              <span class="title">API 信息</span>
              <p class="subtitle">用于接口调用的商户信息和密钥</p>
            </div>
          </template>

          <div class="info-row">
            <div class="label">商户号 (merid)</div>
            <div class="value-box">
              <span>{{ mchInfo.merchant_id }}</span>
            </div>
            <ElButton
              type="primary"
              class="ml-15px"
              @click="copyToClipboard(mchInfo.merchant_id || '', '商户号')"
              >复制</ElButton
            >
          </div>

          <div class="info-row mt-15px">
            <div class="label">密钥 (key)</div>
            <div class="value-box">
              <span v-if="merchantKey.key" class="font-mono">{{ merchantKey.key }}</span>
              <span v-else>••••••••••••••••••••••••</span>
            </div>
            <ElButton
              type="primary"
              class="ml-15px"
              @click="() => showPwdModal(merchantKey.isShow)"
            >
              {{ merchantKey.isShow ? '隐藏' : '查看' }}
            </ElButton>
          </div>
        </ElCard>
      </ElTabPane>

      <ElTabPane label="费率信息" name="rate">
        <!-- 模块三：费率信息 (保留原有展示) -->
        <ElCard shadow="hover" class="info-card mb-20px w-[800px]">
          <template #header>
            <div class="card-header">
              <span class="title">基础费率</span>
            </div>
          </template>
          <ElDescriptions :column="3" border>
            <ElDescriptionsItem :label="t('AddMerchantForm.issuanceInterest')">
              {{ mchInfo.issued_money_rate }}%
            </ElDescriptionsItem>

            <ElDescriptionsItem :label="t('AddMerchantForm.paymentInterest')">
              {{ mchInfo.payment_rate }}%
            </ElDescriptionsItem>

            <ElDescriptionsItem :label="t('merchantList.internalRate')">
              {{ mchInfo.recharge_money_rate }}%
            </ElDescriptionsItem>
          </ElDescriptions>
        </ElCard>

        <ElCard shadow="hover" class="info-card w-[800px]">
          <template #header>
            <div class="card-header">
              <span class="title">代收通道费率</span>
            </div>
          </template>
          <ElDescriptions :column="3" border>
            <!-- 动态循环通道费率 -->
            <ElDescriptionsItem
              v-for="tunnel in validTunnels"
              :key="tunnel.name"
              :label="tunnel.name"
            >
              {{ new Decimal(tunnel.rate || 0).mul(100).toString() }}%
            </ElDescriptionsItem>
          </ElDescriptions>
        </ElCard>
      </ElTabPane>
    </ElTabs>

    <!-- 弹窗：查看商户秘钥 -->
    <Dialog v-model="secretVisible" title="查看商户秘钥">
      <div class="mr-20px">
        <SecretForm ref="secretFormRef" />
      </div>
      <template #footer>
        <BaseButton type="primary" :loading="saveLoading" @click="updateSecret"> 提交 </BaseButton>
        <BaseButton @click="secretVisible = false">{{ t('dialogDemo.close') }}</BaseButton>
      </template>
    </Dialog>

    <!-- 弹窗：修改密码 -->
    <Dialog v-model="passwordVisible" title="修改密码" width="500px">
      <EditMchPassword ref="passwordRef" @success="closePasswordDialog" />
      <template #footer>
        <BaseButton type="primary" :loading="saveLoading" @click="handleSavePassword">
          {{ t('exampleDemo.save') /* 保存 */ }}
        </BaseButton>
        <BaseButton @click="closePasswordDialog">
          {{ t('dialogDemo.close') /* 关闭 */ }}
        </BaseButton>
      </template>
    </Dialog>
  </div>
</template>

<style scoped lang="less">
.mb-20px {
  margin-bottom: 20px;
}
.mt-15px {
  margin-top: 15px;
}
.ml-15px {
  margin-left: 15px;
}

.info-card {
  :deep(.el-card__header) {
    padding-bottom: 10px;
    border-bottom: 1px solid #ebeef5;
  }
}

.card-header {
  .title {
    font-size: 16px;
    font-weight: bold;
    color: #303133;
  }
  .subtitle {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
  }
}

.info-row {
  display: flex;
  align-items: center;

  .label {
    width: 120px;
    color: #606266;
    font-size: 14px;
  }

  .value-text {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
  }

  .value-box {
    flex: 1;
    background-color: #f5f7fa;
    border-radius: 4px;
    padding: 8px 12px;
    color: #606266;
    font-size: 14px;
    line-height: 1.5;
    min-height: 36px;
    display: flex;
    align-items: center;
    border: 1px solid #e4e7ed;

    .font-mono {
      font-family: monospace;
      letter-spacing: 0.5px;
    }
  }
}
</style>
