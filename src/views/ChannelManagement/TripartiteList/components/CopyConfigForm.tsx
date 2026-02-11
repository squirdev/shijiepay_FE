import { ElForm, ElFormItem, ElInput, FormInstance } from 'element-plus'
import { defineComponent, PropType, ref } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'

interface Row {
  uuid: string
  note: string
  [key: string]: any
}

const CopyConfigForm = defineComponent({
  name: 'CopyConfigForm',
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
    const modelValue = ref({ new_name: '' })

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
          label="新三方名称"
          prop="new_name"
          rules={{ required: true, message: '请输入', trigger: ['blur', 'change'] }}
        >
          <ElInput
            placeholder="请输入"
            modelValue={modelValue.value.new_name}
            onUpdate:modelValue={(v) => (modelValue.value['new_name'] = v)}
          />
        </ElFormItem>
      </ElForm>
    )
  }
})

export default CopyConfigForm
