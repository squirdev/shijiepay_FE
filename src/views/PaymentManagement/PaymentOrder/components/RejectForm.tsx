import { ElForm, ElFormItem, ElRadioGroup, ElRadio, FormInstance } from 'element-plus'
import { defineComponent, onMounted, PropType, ref } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'

interface Row {
  uuid: string
  note: string
  [key: string]: any
}

const RejectForm = defineComponent({
  name: 'RejectForm',
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

    const modelValue = ref({ reason_msg: '' })

    onMounted(() => {
      modelValue.value = { reason_msg: props.row.reason_msg ?? '' }
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
          label="请选择驳回原因"
          prop="reason_msg"
          labelWidth={120}
          rules={{ required: true, message: '请选择', trigger: ['blur', 'change'] }}
        >
          <ElRadioGroup
            class="flex flex-col !items-start"
            modelValue={modelValue.value.reason_msg}
            onUpdate:modelValue={(v) => (modelValue.value['reason_msg'] = v ?? '')}
          >
            <ElRadio value="姓名不符">姓名不符</ElRadio>
            <ElRadio value="银行卡号不存在">银行卡号不存在</ElRadio>
            <ElRadio value="银行维护中">银行维护中</ElRadio>
            <ElRadio value="账号达到限额">账号达到限额</ElRadio>
            <ElRadio value="账号不存在或已销号">账号不存在或已销号</ElRadio>
            <ElRadio value="网络错误，请重新提交">网络错误，请重新提交</ElRadio>
            <ElRadio value="出款通道维护">出款通道维护</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
      </ElForm>
    )
  }
})

export default RejectForm
