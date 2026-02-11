import { ElForm, ElFormItem, ElInput, FormInstance } from 'element-plus'
import { defineComponent, onMounted, PropType, ref } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'

interface Row {
  uuid: string
  lose_note: string
  [key: string]: any
}

const NoteForm = defineComponent({
  name: 'NoteForm',
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

    const modelValue = ref({ lose_note: '' })

    onMounted(() => {
      modelValue.value = { lose_note: props.row.lose_note ?? '' }
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
          label="备注"
          prop="lose_note"
          rules={{ required: true, message: '请输入', trigger: ['blur', 'change'] }}
        >
          <ElInput
            placeholder="请输入"
            modelValue={modelValue.value.lose_note}
            onUpdate:modelValue={(v) => (modelValue.value['lose_note'] = v)}
          />
        </ElFormItem>
      </ElForm>
    )
  }
})

export default NoteForm
