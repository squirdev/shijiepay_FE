import { ElForm, ElFormItem, ElInput, FormInstance, ElSelect, ElOption } from 'element-plus'
import { defineComponent, onMounted, PropType, ref } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { fetchPayoutApi } from '@/api/paymentmanagement'

interface Row {
  uuid: string
  note: string
  [key: string]: any
}

interface Option {
  label: string
  value: string
}

const TripartiteForm = defineComponent({
  name: 'TripartiteForm',
  props: {
    row: {
      type: Object as PropType<Row>,
      required: true,
      default: () => ({ uuid: undefined, row: '' })
    },
    threePartyOptions: {
      type: Array as PropType<Option[]>,
      required: true,
      default: () => []
    }
  },
  setup(props, { expose }) {
    const { t } = useI18n()
    const baseFormRef = ref<FormInstance>()
    const modelValue = ref({ threeparty_uuid: '' })

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
          label="选择的三方"
          prop="threeparty_uuid"
          rules={{ required: true, message: '请输入', trigger: ['blur', 'change'] }}
        >
          <ElSelect
            placeholder="请选择"
            modelValue={modelValue.value.threeparty_uuid}
            onUpdate:modelValue={(v) => (modelValue.value['threeparty_uuid'] = v)}
          >
            {props.threePartyOptions?.map((item) => (
              <ElOption key={item.value} value={item.value} label={item.label} />
            ))}
          </ElSelect>
        </ElFormItem>
      </ElForm>
    )
  }
})

export default TripartiteForm
