import { defineComponent, PropType, watch, ref, reactive } from 'vue'
import { Dialog } from '@/components/Dialog'
import { BaseButton } from '@/components/Button'
import { useI18n } from '@/hooks/web/useI18n'
import { createTripartApi } from '@/api/channelmanagement'
import {
  ElInput,
  ElMessage,
  ElSelect,
  ElOption,
  ElSwitch,
  ElForm,
  ElFormItem,
  FormInstance,
  ElMessageBox,
  ElTooltip
} from 'element-plus'

interface Row {
  uuid: string
  [key: string]: any
}

interface Option {
  label: string
  value: string
}

interface Mch {
  mch_uuid: string
  merchant_id: string
  merchant_name: string
}

interface TestInfo {
  order_id: string
  mch_datas: Mch[]
}

const CollectionTest = defineComponent({
  name: 'negotiationTest',
  props: {
    visible: {
      type: Boolean as PropType<boolean>,
      required: true,
      default: false
    },
    row: {
      type: Object as PropType<Row>,
      required: true,
      default: () => ({ uuid: undefined })
    },
    saveCallback: {
      type: Function as PropType<Function>,
      required: true
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const { t } = useI18n()
    const loading = ref(true)
    const saveLoading = ref(false)
    const baseFormRef = ref<FormInstance>()

    const modelValue = ref({
      merchant_id: '',
      amount: '',
      order_id: '',
      tunnel_uuid: '',
      bank_code: '',
      bank_account: '',
      bank_username: ''
    })

    const testData = ref<TestInfo>()

    const fetchInfo = async (uuid: string) => {
      if (!uuid) return
      const testValues = {
        action: 'get_payout_test_data',
        data_uuid: uuid
      }
      try {
        loading.value = true
        const { data: retData } = await createTripartApi(testValues)

        modelValue.value.order_id = retData.data.order_id

        testData.value = retData.data
      } catch (error) {
        console.log(error)
      } finally {
        loading.value = false
      }
    }

    // 只在 visible 变为 true 时请求
    watch(
      () => props.visible,
      (newVal) => {
        if (newVal && props.row?.uuid) {
          fetchInfo(props.row.uuid)
        }
        if (!newVal) {
          baseFormRef.value?.resetFields()
        }
      }
    )

    const closeDialog = () => {
      emit('update:modelValue', false)
    }

    const saveDialog = async () => {
      const formValid = await baseFormRef.value?.validate()
      if (!formValid) return

      const newValues = {
        action: 'payout_test_order',
        data_uuid: props.row.uuid,
        ...modelValue.value
      }

      try {
        saveLoading.value = true
        const res = await createTripartApi(newValues)

        if (res.success) {
          ElMessage.success(t('common.successOperation'))

          ElMessageBox.alert(
            <div>
              <div class="flex h-42px items-center text-14px">
                <span class="w-100px text-right mr-20px color-[#636363]">系统单号:</span>
                <span class="color-[#0e0e0e]">{res.data.order_id ?? ''}</span>
              </div>
              <div class="flex h-42px items-center text-14px">
                <span class="w-100px text-right mr-20px color-[#636363]">三方单号:</span>
                <span class="color-[#0e0e0e]">{res.data.channel_order_id ?? ''}</span>
              </div>
              <div class="flex h-42px items-center text-14px">
                <span class="w-100px text-right mr-20px color-[#636363]">下单状态:</span>
                <span class="color-[#67c23a]">成功</span>
              </div>
            </div>,
            '订单信息',
            {
              confirmButtonText: '确定',
              dangerouslyUseHTMLString: true,
              customStyle: {
                '--el-messagebox-width': '576px',
                width: '576px!important'
              }
            }
          )

          props?.saveCallback()
          closeDialog() // Close dialog on success
        } else {
          ElMessage.error(res?.message || t('common.failedOperation'))
        }
      } catch (error) {
        console.log(error)
      } finally {
        saveLoading.value = false
      }
    }

    return () => (
      <Dialog
        title="代付下单测试"
        modelValue={props.visible}
        onUpdate:modelValue={(val) => emit('update:modelValue', val)}
        v-slots={{
          footer: () => (
            <>
              <BaseButton type="primary" loading={saveLoading.value} onClick={saveDialog}>
                {t('exampleDemo.save')}
              </BaseButton>
              <BaseButton onClick={closeDialog}>{t('dialogDemo.close')}</BaseButton>
            </>
          )
        }}
      >
        <div class="pl-4px">
          <ElForm model={modelValue} ref={baseFormRef} labelWidth="100px" labelPosition="right">
            <ElFormItem
              label="商户"
              prop="merchant_id"
              rules={{
                required: true,
                message: t('common.selectText'),
                trigger: ['blur', 'change']
              }}
            >
              <ElSelect
                v-model={modelValue.value.merchant_id}
                placeholder={t('common.selectText')}
                class="w-1/1"
              >
                {testData.value?.mch_datas?.map((item) => (
                  <ElOption
                    key={item.merchant_id}
                    label={item.merchant_name}
                    value={item.merchant_id}
                  />
                ))}
              </ElSelect>
            </ElFormItem>
            <ElFormItem
              label="金额"
              prop="amount"
              rules={{
                required: true,
                message: t('common.inputText'),
                trigger: ['blur', 'change']
              }}
            >
              <ElInput
                v-model={modelValue.value.amount}
                placeholder={t('common.inputText')}
                type="number"
              />
            </ElFormItem>
            <ElFormItem
              label="订单号"
              prop="order_id"
              rules={{
                required: true,
                message: t('common.inputText'),
                trigger: ['blur', 'change']
              }}
            >
              <ElInput v-model={modelValue.value.order_id} placeholder={t('common.inputText')} />
            </ElFormItem>
            <ElFormItem
              label="银行code"
              prop="bank_code"
              rules={{
                required: true,
                message: t('common.inputText'),
                trigger: ['blur', 'change']
              }}
            >
              <ElInput v-model={modelValue.value.bank_code} placeholder={t('common.inputText')} />
            </ElFormItem>

            <ElFormItem
              label="收款人姓名"
              prop="bank_account"
              rules={{
                required: true,
                message: t('common.inputText'),
                trigger: ['blur', 'change']
              }}
            >
              <ElInput
                v-model={modelValue.value.bank_account}
                placeholder={t('common.inputText')}
              />
            </ElFormItem>
            <ElFormItem
              label="收款卡号"
              prop="bank_username"
              rules={{
                required: true,
                message: t('common.inputText'),
                trigger: ['blur', 'change']
              }}
            >
              <ElInput
                v-model={modelValue.value.bank_username}
                placeholder={t('common.inputText')}
              />
            </ElFormItem>
          </ElForm>
        </div>
      </Dialog>
    )
  }
})

export default CollectionTest
