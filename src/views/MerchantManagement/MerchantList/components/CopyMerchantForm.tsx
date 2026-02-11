import { ElForm, ElFormItem, ElInput, FormInstance } from 'element-plus'
import { defineComponent, PropType, ref } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'

interface Row {
  uuid: string
  note: string
  [key: string]: any
}

const CopyMerchantForm = defineComponent({
  name: 'CopyMerchantForm',
  props: {
    row: {
      type: Object as PropType<Row>,
      required: true,
      default: () => ({ uuid: undefined, row: '' })
    }
  },
  setup(props, { expose }) {
    const { t } = useI18n()
    const baseFormRef = ref<FormInstance>()
    const modelValue = ref({ merchant_name: '', account: '', password: '' })

    const submit = async () => {
      try {
        const valid = await baseFormRef.value?.validate()

        if (valid) {
          return modelValue.value
        }
      } catch (error) {
        console.log(error)
      }
    }

    expose({
      submit
    })

    return () => (
      <ElForm model={modelValue} ref={baseFormRef} labelWidth="100px" labelPosition="right">
        {/* TODO */}
        <ElFormItem
          label="商户名称"
          prop="merchant_name"
          rules={{ required: true, message: '请输入', trigger: ['blur', 'change'] }}
        >
          <ElInput
            placeholder="请输入"
            modelValue={modelValue.value.merchant_name}
            onUpdate:modelValue={(v) => (modelValue.value['merchant_name'] = v)}
          />
        </ElFormItem>

        <ElFormItem
          label="商户账户"
          prop="account"
          rules={{ required: true, message: '请输入', trigger: ['blur', 'change'] }}
        >
          <ElInput
            placeholder="请输入"
            modelValue={modelValue.value.account}
            onUpdate:modelValue={(v) => (modelValue.value['account'] = v)}
          />
        </ElFormItem>

        <ElFormItem
          label="商户密码"
          prop="password"
          rules={[
            { required: true, message: '请输入', trigger: ['blur', 'change'] },
            {
              validator: (rule, value, callback) => {
                if (!value) {
                  callback(new Error('请输入密码'))
                } else if (value.length < 8 || value.length > 18) {
                  callback(new Error('密码长度必须在8-18位之间'))
                } else if (!/[a-zA-Z]/.test(value)) {
                  callback(new Error('密码必须至少包含1个字母'))
                } else if (!/\d/.test(value)) {
                  // 检查是否包含数字
                  callback(new Error('密码必须至少包含1个数字'))
                } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
                  // 检查是否包含特殊符号
                  callback(new Error('密码必须至少包含1个特殊符号'))
                } else {
                  // 所有校验都通过
                  callback()
                }
              },
              trigger: ['blur', 'change']
            }
          ]}
        >
          <ElInput
            placeholder="请输入"
            modelValue={modelValue.value.password}
            onUpdate:modelValue={(v) => (modelValue.value['password'] = v)}
          />
        </ElFormItem>
      </ElForm>
    )
  }
})

export default CopyMerchantForm
