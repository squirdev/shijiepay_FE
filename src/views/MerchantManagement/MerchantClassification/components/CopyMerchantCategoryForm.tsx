import { ElForm, ElFormItem, ElInput, FormInstance } from 'element-plus'
import { defineComponent, PropType, ref } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'

interface Row {
  uuid: string
  note: string
  [key: string]: any
}

const CopyMerchantCategoryForm = defineComponent({
  name: 'CopyMerchantCategoryForm',
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
    const modelValue = ref({ name: '', note: '' })

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
          label="新建分类名称"
          prop="name"
          rules={{ required: true, message: '请输入', trigger: ['blur', 'change'] }}
        >
          <ElInput
            placeholder="请输入"
            modelValue={modelValue.value.name}
            onUpdate:modelValue={(v) => (modelValue.value['name'] = v)}
          />
        </ElFormItem>

        <ElFormItem
          label="备注"
          prop="note"
          rules={{ required: true, message: '请输入', trigger: ['blur', 'change'] }}
        >
          <ElInput
            placeholder="请输入"
            modelValue={modelValue.value.note}
            onUpdate:modelValue={(v) => (modelValue.value['note'] = v)}
          />
        </ElFormItem>
      </ElForm>
    )
  }
})

export default CopyMerchantCategoryForm
