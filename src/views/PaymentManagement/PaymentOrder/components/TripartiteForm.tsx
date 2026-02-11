import {
  ElForm,
  ElFormItem,
  ElInput,
  FormInstance,
  ElSelect,
  ElOption,
  ElMessage
} from 'element-plus'
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
    }
  },
  setup(props, { expose }) {
    const { t } = useI18n()
    const baseFormRef = ref<FormInstance>()
    const options = ref<Option[]>([])
    const modelValue = ref({ threeparty_uuid: '' })

    const getList = async () => {
      const values = {
        action: 'getThreePartyPtDatas',
        data_uuid: props.row.uuid
      }
      try {
        const res = await fetchPayoutApi(values)

        if (!res.success) {
          ElMessage.error(res.message)
          return
        }

        options.value =
          res.data?.sf_datas?.map((item) => ({ label: item.name, value: item.uuid })) ?? []
      } catch (error) {
        console.log(error)
      }
    }

    onMounted(() => {
      modelValue.value = { threeparty_uuid: props.row.threeparty_uuid ?? '' }
      getList()
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
          label="选择的三方"
          prop="threeparty_uuid"
          rules={{ required: true, message: '请输入', trigger: ['blur', 'change'] }}
        >
          <ElSelect
            placeholder="请选择"
            modelValue={modelValue.value.threeparty_uuid}
            onUpdate:modelValue={(v) => (modelValue.value['threeparty_uuid'] = v)}
          >
            {options.value?.map((item) => (
              <ElOption key={item.value} value={item.value} label={item.label} />
            ))}
          </ElSelect>
        </ElFormItem>
      </ElForm>
    )
  }
})

export default TripartiteForm
