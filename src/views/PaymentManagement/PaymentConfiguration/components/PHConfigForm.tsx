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
  FormInstance,
  ElInputNumber
} from 'element-plus'
import { defineComponent, onMounted, PropType, ref, watch } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { BaseButton } from '@/components/Button'
import { InfoFilled, Warning } from '@element-plus/icons-vue'
import { updatePayoutConfigApi } from '@/api/paymentmanagement'
import { Icon } from '@/components/Icon'
import { Plus, Delete } from '@element-plus/icons-vue'

interface Row {
  code: string
  name: string
}

interface ValueItem {
  id?: string
  amount_min: number
  amount_max: number
  amount: number
}

interface Values {
  payount_statu: boolean
  maintain_bankcodes: string[]
  fisbursed_amount_interval: ValueItem[]
}

interface SaveValues {
  action: 'updateVnConfig' | 'updatePhConfig'
  vn_payount_statu?: boolean
  ph_payount_statu?: boolean
  vn_maintain_bankcodes?: string[]
  ph_maintain_bankcodes?: string[]
  fisbursed_amount_interval?: ValueItem[]
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
    },
    fisbursed_amount_interval: {
      type: Array as PropType<ValueItem[]>
    }
  },
  setup(props, { expose }) {
    const { t } = useI18n()
    const checkAll = ref(false)
    const isIndeterminate = ref(false)
    const baseFormRef = ref<FormInstance>()

    const modelValue = ref<Values>({
      payount_statu: false,
      maintain_bankcodes: [],
      fisbursed_amount_interval: [
        { id: (Math.random() * 100000).toFixed(3), amount_min: 0, amount_max: 0, amount: 0 }
      ]
    })

    watch(
      () => props.selectBank,
      (newVal) => {
        if (newVal && newVal.filter((l) => l).length) {
          modelValue.value.payount_statu = props.payount_statu
          modelValue.value.maintain_bankcodes = props.selectBank.filter((l) => l)

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
      }
    )

    watch(
      () => props.fisbursed_amount_interval,
      (newVal) => {
        const newDatas = props?.fisbursed_amount_interval?.map((item) => ({
          ...item,
          id: (Math.random() * 100000).toFixed(3)
        })) as ValueItem[]
        modelValue.value.fisbursed_amount_interval =
          newDatas?.length > 0
            ? newDatas
            : [
                {
                  id: (Math.random() * 100000).toFixed(3),
                  amount_min: 0,
                  amount_max: 0,
                  amount: 0
                }
              ]
      }
    )

    onMounted(() => {
      const newDatas = props?.fisbursed_amount_interval?.map((item) => ({
        ...item,
        id: (Math.random() * 100000).toFixed(3)
      })) as ValueItem[]

      modelValue.value = {
        payount_statu: props.payount_statu,
        maintain_bankcodes: props.selectBank.filter((l) => l),
        fisbursed_amount_interval:
          newDatas?.length > 0
            ? newDatas
            : [
                {
                  id: (Math.random() * 100000).toFixed(3),
                  amount_min: 0,
                  amount_max: 0,
                  amount: 0
                }
              ]
      }
    })

    const headerOperate = (id?: string) => {
      if (id) {
        if (modelValue.value.fisbursed_amount_interval.length === 1) return
        modelValue.value.fisbursed_amount_interval =
          modelValue.value.fisbursed_amount_interval.filter((l) => l.id !== id)
        return
      }

      modelValue.value.fisbursed_amount_interval.push({
        id: (Math.random() * 100000).toFixed(3),
        amount_min: 0,
        amount_max: 0,
        amount: 0
      })
    }

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
        newValues.fisbursed_amount_interval = modelValue.value.fisbursed_amount_interval.map(
          (item) => {
            delete item.id
            return item
          }
        )
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

        {modelValue.value.fisbursed_amount_interval.map((item, index) => {
          return (
            <ElFormItem label={`商户下发区间收费${index + 1}`}>
              <div class="flex items-center">
                <ElInputNumber
                  placeholder="请输入区间起始金额"
                  controls-position="right"
                  modelValue={item.amount_min}
                  onUpdate:modelValue={(v) => (item['amount_min'] = v as number)}
                />
                <span class="mx-4px">~</span>
                <ElInputNumber
                  placeholder="请输入区间结束金额"
                  controls-position="right"
                  modelValue={item.amount_max}
                  onUpdate:modelValue={(v) => (item['amount_max'] = v as number)}
                />
                <ElInputNumber
                  placeholder="请输入费用金额"
                  controls-position="right"
                  class="ml-8px"
                  modelValue={item.amount}
                  onUpdate:modelValue={(v) => (item['amount'] = v as number)}
                />
                <ElButton class="ml-8px" icon={Delete} onClick={() => headerOperate(item.id)}>
                  删除
                </ElButton>
              </div>
            </ElFormItem>
          )
        })}
        <div class="ml-160px">
          <ElButton icon={Plus} style={{ width: '315px' }} onClick={() => headerOperate()}>
            添加
          </ElButton>
        </div>
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
