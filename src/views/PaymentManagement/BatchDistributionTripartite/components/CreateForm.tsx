import { InfoFilled } from '@element-plus/icons-vue'
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  FormInstance,
  ElTooltip,
  ElButton
} from 'element-plus'
import { defineComponent, PropType, ref } from 'vue'

interface Row {
  label: string
  value: string
}

const CreateForm = defineComponent({
  name: 'CreateForm',
  props: {
    threePartyOptions: {
      type: Array as PropType<Row[]>,
      required: true,
      default: () => []
    }
  },
  setup(props, { expose }) {
    const baseFormRef = ref<FormInstance>()

    const modelValue = ref({
      three_party_uuid: '',
      data_text: ''
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
          label="选择三方"
          prop="three_party_uuid"
          rules={{ required: true, message: '请选择三方', trigger: ['blur', 'change'] }}
        >
          <ElSelect v-model={modelValue.value.three_party_uuid} placeholder="请选择">
            {props.threePartyOptions?.map((item) => (
              <ElOption key={item.value} label={item.label} value={item.value} />
            ))}
          </ElSelect>
        </ElFormItem>

        <ElFormItem
          label="下发信息"
          prop="data_text"
          v-slots={{
            label: () => (
              <div class="flex text-14px items-center">
                <span>下发信息</span>

                <ElTooltip
                  v-slots={{
                    content: () => `通道类型&卡号&金额`
                  }}
                  placement="top"
                >
                  <ElButton icon={InfoFilled} type="text" style={{ color: '#606266' }} />
                </ElTooltip>
              </div>
            )
          }}
          rules={{ required: true, message: '请输入下发信息', trigger: ['blur', 'change'] }}
        >
          <ElInput
            type="textarea"
            rows={20}
            placeholder="请输入"
            v-model={modelValue.value.data_text}
          />
        </ElFormItem>
      </ElForm>
    )
  }
})

export default CreateForm
