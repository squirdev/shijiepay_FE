import {
  ElButton,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElSwitch,
  ElTooltip,
  FormInstance
} from 'element-plus'
import { defineComponent, PropType, ref, watch } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { BaseButton } from '@/components/Button'
import { updatePayoutConfigApi } from '@/api/paymentmanagement'
import { InfoFilled } from '@element-plus/icons-vue'

const BaseConfigForm = defineComponent({
  name: 'BaseConfigForm',
  props: {
    payount_statu: {
      type: Boolean as PropType<boolean>,
      required: true,
      default: () => false
    },
    batch_payout_amount_limit: {
      type: Number as PropType<number>,
      required: true,
      default: () => 0
    }
  },
  setup(props, { expose }) {
    const { t } = useI18n()
    const baseFormRef = ref<FormInstance>()

    const modelValue = ref<{ payount_statu: boolean; batch_payout_amount_limit: number }>({
      payount_statu: false,
      batch_payout_amount_limit: 0
    })

    watch(
      () => props.payount_statu,
      (newVal) => {
        modelValue.value.payount_statu = props.payount_statu
      }
    )

    watch(
      () => props.batch_payout_amount_limit,
      (newVal) => {
        modelValue.value.batch_payout_amount_limit = props.batch_payout_amount_limit
      }
    )

    const saveConfig = async () => {
      const valid = await baseFormRef.value?.validate()
      if (!valid) return
      const newValues = {
        action: 'updatePayoutConfig',
        ...modelValue.value
      }

      try {
        const res = await updatePayoutConfigApi(newValues)

        if (res?.success) {
          ElMessage.success(t('common.successOperation'))
        } else {
          ElMessage.error(res.message)
          return
        }
      } catch (error) {
        console.log(error)
      }
    }

    return () => (
      <ElForm
        class="bankForm"
        model={modelValue}
        ref={baseFormRef}
        labelWidth="160px"
        labelPosition="right"
      >
        <ElFormItem
          prop="payount_statu"
          rules={{ required: true, message: t('common.selectText'), trigger: ['blur', 'change'] }}
          v-slots={{
            label: () => (
              <div class="flex text-14px items-center">
                <span>{t('paymentManagement.switch')}</span>
                <ElTooltip content={t('paymentManagement.switchTitle')} placement="top">
                  <ElButton icon={InfoFilled} type="text" style={{ color: '#606266' }} />
                </ElTooltip>
              </div>
            )
          }}
        >
          <ElSwitch
            modelValue={modelValue.value.payount_statu}
            onUpdate:modelValue={(v) => {
              modelValue.value.payount_statu = v as unknown as boolean
            }}
          />
        </ElFormItem>
        <ElFormItem prop="batch_payout_amount_limit" label="批量下发金额限制">
          <ElInput
            type="number"
            placeholder="请输入"
            style={{ width: '120px' }}
            modelValue={modelValue.value.batch_payout_amount_limit}
            onUpdate:modelValue={(v) => {
              modelValue.value.batch_payout_amount_limit = v as unknown as number
            }}
          />
        </ElFormItem>

        <div class="pl-160px mb-20px mt-30px">
          <BaseButton type="primary" onClick={saveConfig}>
            {t('configuration.saveButton')}
          </BaseButton>
        </div>
      </ElForm>
    )
  }
})

export default BaseConfigForm
