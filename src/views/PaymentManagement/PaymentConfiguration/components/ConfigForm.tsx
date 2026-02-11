import {
  ElIcon,
  ElButton,
  ElCheckbox,
  ElCheckboxGroup,
  ElForm,
  ElFormItem,
  ElMessage,
  ElSwitch,
  ElTooltip,
  FormInstance
} from 'element-plus'
import { defineComponent, PropType, ref, watch } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { BaseButton } from '@/components/Button'
import { InfoFilled, Warning } from '@element-plus/icons-vue'
import { updatePayoutConfigApi } from '@/api/paymentmanagement'
import { Icon } from '@/components/Icon'

interface Row {
  code: string
  name: string
}

interface SaveValues {
  action: 'updateVnConfig' | 'updatePhConfig'
  vn_payount_statu?: boolean
  ph_payount_statu?: boolean
  vn_maintain_bankcodes?: string[]
  ph_maintain_bankcodes?: string[]
}

const ConfigForm = defineComponent({
  name: 'ConfigForm',
  props: {
    action: {
      type: String as PropType<'updateVnConfig' | 'updatePhConfig'>,
      required: true,
      default: () => ''
    },
    bankData: {
      type: Array as PropType<Row[]>,
      required: true,
      default: () => []
    },
    payount_statu: {
      type: Boolean as PropType<boolean>,
      required: true,
      default: () => false
    },
    selectBank: {
      type: Array as PropType<string[]>,
      required: true,
      default: () => []
    },
    notSelectBanks: {
      type: Array as PropType<string[]>
    }
  },
  setup(props, { expose }) {
    const { t } = useI18n()
    const checkAll = ref(false)
    const isIndeterminate = ref(false)
    const baseFormRef = ref<FormInstance>()

    const modelValue = ref<{ payount_statu: boolean; maintain_bankcodes: string[] }>({
      payount_statu: false,
      maintain_bankcodes: []
    })

    watch(
      () => props.selectBank,
      (newVal) => {
        if (newVal && newVal.filter((l) => l).length) {
          modelValue.value = {
            payount_statu: props.payount_statu,
            maintain_bankcodes: props.selectBank.filter((l) => l)
          }
          if (props.selectBank.length < props.bankData.length) {
            checkAll.value = false
            isIndeterminate.value = true
          } else {
            isIndeterminate.value = false
            checkAll.value = true
          }
        }
      }
    )

    watch(
      () => props.payount_statu,
      (newVal) => {
        modelValue.value.payount_statu = newVal
        console.log(22222, modelValue.value.payount_statu)
      }
    )

    const saveConfig = async () => {
      const valid = await baseFormRef.value?.validate()
      if (!valid) return
      const newValues: SaveValues = {
        action: props.action
      }
      if (props.action === 'updateVnConfig') {
        newValues.vn_payount_statu = modelValue.value.payount_statu
        newValues.vn_maintain_bankcodes = modelValue.value.maintain_bankcodes
      }
      if (props.action === 'updatePhConfig') {
        newValues.ph_payount_statu = modelValue.value.payount_statu
        newValues.ph_maintain_bankcodes = modelValue.value.maintain_bankcodes
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
      <ElForm model={modelValue} ref={baseFormRef} labelWidth="160px" labelPosition="right">
        <ElFormItem
          prop="payount_statu"
          rules={{ required: true, message: '请选择', trigger: ['blur', 'change'] }}
          v-slots={{
            label: () => (
              <div class="flex text-14px items-center">
                {/* 代付业务开关 */}
                <span>{t('paymentManagement.payoutServiceSwitch')} </span>
                {/*   项目代付业务开关，控制整个项目代付功能的运行  */}
                <ElTooltip
                  content={t(
                    'paymentManagement.payoutServiceSwitchDescription'
                  )} /* 项目代付业务开关，控制整个项目代付功能的运行 */
                  placement="top"
                >
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
        <ElFormItem
          prop="maintain_bankcodes"
          class="bankFormItem"
          // rules={{
          //   required: true,
          //   message: t('common.selectText') /* 请选择 */,
          //   trigger: ['blur', 'change']
          // }}
          v-slots={{
            label: () => (
              <div class="flex text-14px items-center">
                {/* 代付银行维护限制 */}
                <span>{t('paymentManagement.selectBankTitle')}</span>
                {/* 选择配置维护停用的银行Code */}
                <ElTooltip content={t('paymentManagement.selectBank')} placement="top">
                  <ElButton icon="InfoFilled" type="text" style={{ color: '#606266' }} />
                </ElTooltip>
              </div>
            )
          }}
        >
          <div class="mb-10px">
            <ElCheckbox
              v-model={checkAll.value}
              indeterminate={isIndeterminate.value}
              onChange={(val: boolean) => {
                isIndeterminate.value = false
                if (val) {
                  modelValue.value.maintain_bankcodes = props.bankData.map((b) => b.code)
                } else {
                  modelValue.value.maintain_bankcodes = []
                }
              }}
            >
              全选
            </ElCheckbox>
          </div>
          <ElCheckboxGroup
            size="large"
            modelValue={modelValue.value.maintain_bankcodes}
            onUpdate:modelValue={(v) => {
              if (v.length < props.bankData.length) {
                checkAll.value = false
                isIndeterminate.value = v.length > 0
              } else {
                isIndeterminate.value = false
                checkAll.value = true
              }
              modelValue.value.maintain_bankcodes = v as unknown as string[]
            }}
          >
            {props.bankData.map((bank) => (
              <ElCheckbox
                key={bank.code}
                label={bank.name}
                value={bank.code}
                border
                class="px-20px py-10px mb-20px"
              >
                <div class="inline-flex items-center gap-[4px]">
                  {props.notSelectBanks?.includes(bank.uuid) &&
                    !modelValue.value.maintain_bankcodes.includes(bank.code) && (
                      <Icon
                        icon="vi-ant-design:warning-outlined"
                        style={{ color: '#f56c6c' }}
                      ></Icon>
                    )}
                  <span> {bank.name}</span>
                </div>
              </ElCheckbox>
            ))}
          </ElCheckboxGroup>
        </ElFormItem>
        <div class="pl-160px mb-20px mt-30px">
          <BaseButton type="primary" onClick={saveConfig}>
            {t('configuration.saveButton')}
            {/* 提交保存 */}
          </BaseButton>
        </div>
      </ElForm>
    )
  }
})

export default ConfigForm
