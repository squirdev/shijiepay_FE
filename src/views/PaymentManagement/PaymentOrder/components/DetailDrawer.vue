<script setup lang="ts">
import { computed, ref } from 'vue'
import { propTypes } from '@/utils/propTypes'
import {
  ElDrawer,
  ElSteps,
  ElStep,
  ElDescriptions,
  ElDescriptionsItem,
  ElTag,
  ElTabs,
  ElTabPane
} from 'element-plus'
import { useI18n } from '@/hooks/web/useI18n'
import { payStatuOptions } from '@/utils/options'

const { t } = useI18n()

const props = defineProps({
  modelValue: propTypes.bool.def(false),
  currentRow: propTypes.object.def({})
})

const emit = defineEmits(['update:modelValue'])

const activeName = ref('basic')

// 计算属性：控制抽屉的显示隐藏
const visible = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
})

// 计算属性：当前进度步骤 (0-4)
const activeStep = computed(() => {
  const row = props.currentRow
  if (!row) return 0

  // 1. 支付判断
  // 如果不是支付成功状态（可能是待支付、支付中、或支付失败/超时），
  // 进度条应该停留在第 2 步（索引1），即“支付”节点
  if (row.pay_statu !== 'ispay') {
    return 1
  }

  // --- 走到这里说明支付已经成功 (Step 1 & 2 完成) ---
  // 2. 回调/通知判断
  if (row.callback_statu === 'success') {
    return 4 // 全部完成 (Step 1,2,3,4 全绿)
  }

  // 如果是处理中或失败，应该停留在第 3 步（索引2），即“通知中”节点
  // 此时配合 currentProcessStatus 显示蓝色或红色
  if (['processing', 'failed'].includes(row.callback_statu)) {
    return 2
  }

  // 默认刚支付完，也停留在第 3 步
  return 2
})

const payStatus = computed(() => {
  const statu = payStatuOptions.find((l) => l.value === props?.currentRow?.pay_statu)?.label
  return statu || '处理中'
})

// 计算当前步骤的状态
const currentProcessStatus = computed(() => {
  const row = props.currentRow
  if (!row) return 'process'

  const errorPayStatus = ['pay_timeout', 'pay_failed', 'pay_reject']
  const errorCallbackStatus = ['failed']

  // 1. 支付阶段出错 (activeStep 为 1)
  if (activeStep.value === 1 && errorPayStatus.includes(row.pay_statu)) {
    return 'error'
  }

  // 2. 通知阶段出错 (activeStep 为 2)
  // 注意：这里原本是 3，现在需要改为 2，因为 active=2 才是"通知中"这一步
  if (activeStep.value === 2 && errorCallbackStatus.includes(row.callback_statu)) {
    return 'error'
  }

  return 'process'
})

const cardBgClass = computed(() => {
  const statu = props.currentRow?.pay_statu
  if (statu === 'ispay') {
    return 'bg-green-500'
  } else if (['pay_failed', 'pay_timeout', 'pay_reject'].includes(statu)) {
    return 'bg-red-500'
  } else {
    return 'bg-blue-500'
  }
})
</script>

<template>
  <ElDrawer
    v-model="visible"
    title="详细"
    size="800"
    class="my-detail-drawer"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <div class="p-0">
      <div class="flex gap-4 mb-6">
        <!-- 左侧蓝色卡片 -->
        <!-- TODO 根据订单状态显示不同背景颜色 -->
        <div
          :class="[
            'flex-1 rounded-lg p-5 text-white flex flex-col justify-between shadow-md min-h-[100px]',
            cardBgClass
          ]"
        >
          <div class="text-lg font-bold break-all">
            {{ currentRow.order_id || '-' }}
          </div>
          <div class="text-sm opacity-90 mt-2"> 当前状态: {{ payStatus }} </div>
        </div>

        <!-- 右侧白色金额卡片 -->
        <div
          class="flex-1 bg-white border border-gray-200 rounded-lg p-5 flex items-center justify-around shadow-sm"
        >
          <div class="text-center">
            <div class="text-gray-500 text-xs mb-1">订单金额</div>
            <div class="text-xl font-semibold text-gray-800">
              ¥
              {{ currentRow.order_amount ? Number(currentRow.order_amount).toLocaleString() : '0' }}
            </div>
          </div>
          <div class="w-[1px] h-10 bg-gray-200"></div>
          <div class="text-center">
            <div class="text-gray-500 text-xs mb-1">订单手续费</div>
            <div class="text-xl font-semibold text-gray-800">
              ¥
              {{ currentRow.repay_amount ? Number(currentRow.repay_amount).toLocaleString() : '0' }}
            </div>
          </div>
        </div>
      </div>

      <!-- 进程区域 -->
      <div class="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
        <div class="font-bold text-gray-700 mb-6 text-base">进程</div>
        <ElSteps
          :active="activeStep"
          align-center
          finish-status="success"
          :process-status="currentProcessStatus"
        >
          <ElStep title="创建">
            <template #description>
              <div class="text-xs mt-1">{{ currentRow.create_time || currentRow.order_time }}</div>
            </template>
          </ElStep>
          <ElStep title="支付">
            <template #description>
              <div v-if="activeStep >= 2" class="text-xs mt-1">{{
                currentRow.pay_time || '处理中'
              }}</div>
            </template>
          </ElStep>
          <ElStep title="通知中">
            <template #description>
              <!-- 只是展示逻辑，具体字段根据你API返回调整 -->
              <div v-if="activeStep >= 2" class="text-xs mt-1">
                {{ currentRow.callback_statu === 'failed' ? '通知失败' : '系统处理' }}
              </div>
            </template>
          </ElStep>
          <ElStep title="通知完成">
            <template #description>
              <div v-if="activeStep >= 4" class="text-xs mt-1">{{ currentRow.callback_time }}</div>
            </template>
          </ElStep>
        </ElSteps>
      </div>

      <!-- 基础信息区域 -->
      <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <ElTabs v-model="activeName">
          <ElTabPane label="基本信息" name="basic">
            <ElDescriptions :column="2" border>
              <ElDescriptionsItem label="商户名称">
                {{ currentRow.merchant_name || '-' }}
              </ElDescriptionsItem>

              <ElDescriptionsItem label="卡号">
                {{ currentRow.payee_account || '-' }}
              </ElDescriptionsItem>

              <ElDescriptionsItem label="收款人">
                {{ currentRow.payee_owner || '-' }}
              </ElDescriptionsItem>

              <ElDescriptionsItem label="商户单号">
                {{ currentRow.merchant_order_id || '-' }}
              </ElDescriptionsItem>

              <ElDescriptionsItem label="三方单号">
                {{ currentRow.channel_order_id || '-' }}
              </ElDescriptionsItem>

              <ElDescriptionsItem label="金额">
                {{ currentRow.order_amount }}
              </ElDescriptionsItem>

              <ElDescriptionsItem label="手续费">
                {{ currentRow.repay_amount || 0 }}
              </ElDescriptionsItem>

              <ElDescriptionsItem label="订单时间">
                {{ currentRow.order_time || '-' }}
              </ElDescriptionsItem>

              <ElDescriptionsItem label="回调状态">
                <ElTag v-if="currentRow.callback_statu === 'success'" type="success">成功</ElTag>
                <ElTag v-else-if="currentRow.callback_statu === 'failed'" type="danger">失败</ElTag>
                <ElTag v-else type="info">{{ currentRow.callback_statu || '未回调' }}</ElTag>
              </ElDescriptionsItem>
            </ElDescriptions>
          </ElTabPane>
          <ElTabPane label="下单信息" name="order">
            <!-- TODO -->
            <div>下单信息</div>
          </ElTabPane>
          <ElTabPane label="回调信息" name="callback">
            <!-- TODO -->
            <div>回调信息</div>
          </ElTabPane>
        </ElTabs>
      </div>
    </div>
  </ElDrawer>
</template>

<style scoped>
:deep(.el-step__title) {
  font-size: 14px;
}
:deep(.el-descriptions__label) {
  width: 120px;
  font-weight: bold;
  background-color: #f9fafb;
}
</style>

<style lang="less">
.my-detail-drawer {
  .el-drawer__header {
    margin-bottom: 16px !important;
  }
}
</style>
