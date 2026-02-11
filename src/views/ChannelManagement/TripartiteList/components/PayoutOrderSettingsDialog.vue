<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Dialog } from '@/components/Dialog'
import { BaseButton } from '@/components/Button'
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElTooltip,
  ElButton,
  ElRow,
  ElCol,
  ElSwitch
} from 'element-plus'
import { useI18n } from '@/hooks/web/useI18n'
import { InfoFilled } from '@element-plus/icons-vue'

const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  saveLoading: {
    type: Boolean,
    default: false
  },
  row: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const formRef = ref<InstanceType<typeof ElForm>>()
const saveLoading = ref(false)
const formState = reactive({
  max_consecutive_failures: 0,
  min_limit_balance_amount: 0,
  max_limit_balance_amount: 0,
  payout_amount_min: 0,
  payout_amount_max: 0,
  payout_ck_amount_min: 0,
  payout_ck_amount_max: 0,
  payout_daily_limit_count: 0,
  payment_amount_min: 0,
  payment_amount_max: 0,
  sf_not_callback_close: false
})

watch(
  () => props.row,
  (newVal) => {
    if (newVal) {
      Object.assign(formState, newVal)
    }
  },
  { deep: true, immediate: true }
)

watch(
  () => props.saveLoading,
  (newVal) => {
    saveLoading.value = newVal
  },
  { deep: true, immediate: true }
)

const handleClose = () => {
  emit('update:modelValue', false)
}
const rules = {
  payout_verification_amount: [
    // { required: true, message: '请输入代付审核金额', trigger: ['blur', 'change'] },
    {
      pattern: /^(?:[0-9]|10)$/,
      message: '请输入 0-10 之间的数',
      trigger: ['blur', 'change']
    }
  ]
}
const handleSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (valid) {
    emit('submit', formState)
  }
}
</script>

<template>
  <Dialog
    :model-value="props.modelValue"
    title="接单配置"
    style="overflow-x: hidden"
    @close="handleClose"
  >
    <ElForm ref="formRef" :model="formState" :rules="rules" label-position="top">
      <div style="overflow-x: hidden">
        <ElRow :gutter="20">
          <ElCol :span="11">
            <ElFormItem
              :label="t('tripartiteList.maxBalanceAlert')"
              prop="max_limit_balance_amount"
            >
              <ElInput v-model.number="formState.max_limit_balance_amount" type="number" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="11">
            <ElFormItem
              :label="t('tripartiteList.minBalanceAlert')"
              prop="min_limit_balance_amount"
            >
              <ElInput v-model.number="formState.min_limit_balance_amount" type="number" />
            </ElFormItem>
          </ElCol>

          <ElCol :span="11">
            <ElFormItem prop="payout_daily_limit_count">
              <template #label>
                <div class="flex text-11px items-center">
                  <span class="w-[100px] leading-normal breack-all">代付单日限制笔数</span>
                  <ElTooltip content="为0时候不限制" placement="top">
                    <ElButton :icon="InfoFilled" type="text" style="color: #606266" />
                  </ElTooltip>
                </div>
              </template>
              <ElInput v-model.number="formState.payout_daily_limit_count" type="number" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="11">
            <!-- label="代付最小接单金额" -->
            <ElFormItem prop="payout_amount_min">
              <template #label>
                <div class="flex text-11px items-center" style="height: 32px">
                  <span class="w-[100px] leading-normal breack-all">代付最小接单金额</span>
                </div>
              </template>
              <ElInput v-model.number="formState.payout_amount_min" type="number" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="11">
            <ElFormItem label="代付最大接单金额" prop="payout_amount_max">
              <ElInput v-model.number="formState.payout_amount_max" type="number" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="11">
            <ElFormItem label="代付最小出款金额" prop="payout_ck_amount_min">
              <ElInput v-model.number="formState.payout_ck_amount_min" type="number" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="11">
            <!-- label="代付最大出款金额" -->
            <ElFormItem prop="payout_ck_amount_max">
              <template #label>
                <div class="flex text-11px items-center" style="height: 32px">
                  <span class="w-[100px] leading-normal breack-all">代付最大出款金额</span>
                </div>
              </template>
              <ElInput v-model.number="formState.payout_ck_amount_max" type="number" />
            </ElFormItem>
          </ElCol>

          <ElCol :span="11">
            <ElFormItem prop="max_consecutive_failures">
              <template #label>
                <div class="flex text-11px items-center">
                  <span class="w-[114px] leading-normal breack-all">
                    {{ t('tripartiteList.maxConsecutiveFailures') }}
                  </span>
                  <ElTooltip
                    :content="t('tripartiteList.maxConsecutiveFailuresTooltip')"
                    placement="top"
                  >
                    <ElButton :icon="InfoFilled" type="text" style="color: #606266" />
                  </ElTooltip>
                </div>
              </template>
              <ElInput v-model.number="formState.max_consecutive_failures" type="number" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="11">
            <!-- label="代收接单金额最小值" -->
            <ElFormItem prop="payment_amount_min">
              <template #label>
                <div class="flex text-11px items-center" style="height: 32px">
                  <span class="w-[100px] leading-normal breack-all">代收接单金额最小值</span>
                </div>
              </template>
              <ElInput v-model.number="formState.payment_amount_min" type="number" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="11">
            <ElFormItem label="代收接单金额最大值" prop="payment_amount_min">
              <template #label>
                <div class="flex text-11px items-center" style="height: 32px">
                  <span class="w-[100px] leading-normal breack-all">代收接单金额最大值</span>
                </div>
              </template>
              <ElInput v-model.number="formState.payment_amount_max" type="number" />
            </ElFormItem>
          </ElCol>

          <ElCol :span="11">
            <ElFormItem prop="sf_not_callback_close">
              <template #label>
                <div class="flex text-11px items-center" style="height: 32px">
                  <span class="w-[140px] leading-normal breack-all">3分钟内三方未回调单子停用</span>
                </div>
              </template>
              <ElSwitch v-model="formState.sf_not_callback_close" />
            </ElFormItem>
          </ElCol>
          <!-- -->
        </ElRow>
      </div>
    </ElForm>
    <template #footer>
      <BaseButton :loading="saveLoading" type="primary" @click="handleSubmit">{{
        t('exampleDemo.save')
      }}</BaseButton>
      <BaseButton @click="handleClose">{{ t('dialogDemo.close') }}</BaseButton>
    </template>
  </Dialog>
</template>
