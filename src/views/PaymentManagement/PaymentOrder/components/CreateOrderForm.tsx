import { ElForm, ElFormItem, ElInput, FormInstance } from 'element-plus'
import { defineComponent, onMounted, PropType, ref } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'

interface Row {
  uuid: string
  note: string
  [key: string]: any
}

const CreateOrderForm = defineComponent({
  name: 'CreateOrderForm',
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

    const modelValue = ref({ google_code: '', order_info: '' })

    onMounted(() => {
      modelValue.value = {
        order_info: props.row.order_info ?? '',
        google_code: props.row.google_code ?? ''
      }
    })

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
        <ElFormItem
          label="订单信息"
          prop="order_info"
          rules={{ required: true, message: '请输入', trigger: ['blur', 'change'] }}
        >
          <ElInput
            type="textarea"
            rows={20}
            placeholder="请输入"
            modelValue={modelValue.value.order_info}
            onUpdate:modelValue={(v) => (modelValue.value['order_info'] = v)}
          />
        </ElFormItem>
        <ElFormItem
          label="google码"
          prop="google_code"
          rules={{ required: true, message: '请输入', trigger: ['blur', 'change'] }}
        >
          <ElInput
            placeholder="请输入"
            modelValue={modelValue.value.google_code}
            onUpdate:modelValue={(v) => (modelValue.value['google_code'] = v)}
          />
        </ElFormItem>
      </ElForm>
    )
  }
})

export default CreateOrderForm
