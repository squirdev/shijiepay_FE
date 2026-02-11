import { ElForm, ElFormItem, ElInput, FormInstance } from 'element-plus'
import { defineComponent, ref } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'

const SecretForm = defineComponent({
  name: 'SecretForm',
  setup(props, { expose }) {
    const { t } = useI18n()
    const baseFormRef = ref<FormInstance>()

    const modelValue = ref({ google_code: '' })

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

export default SecretForm
