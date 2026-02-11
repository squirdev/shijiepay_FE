import { ElForm, ElFormItem, ElInput, FormInstance } from 'element-plus'
import { defineComponent, ref, onMounted, PropType, watch } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'

const DockingInfo = defineComponent({
  name: 'DockingInfo',
  props: {
    docking_info: {
      type: String as PropType<string>,
      required: true
    }
  },
  setup(props, { expose }) {
    const { t } = useI18n()
    const baseFormRef = ref<FormInstance>()

    const modelValue = ref({ docking_info: '' })

    watch(
      () => props.docking_info,
      (newVal) => {
        console.log(`test`, props.docking_info, newVal)
        modelValue.value = { docking_info: props.docking_info }
      },
      { immediate: true }
    )

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
          label="对接信息"
          prop="docking_info"
          rules={{ required: true, message: '请输入', trigger: ['blur', 'change'] }}
        >
          <ElInput
            placeholder="请输入"
            type="textarea"
            rows={24}
            modelValue={modelValue.value.docking_info}
            onUpdate:modelValue={(v) => (modelValue.value['docking_info'] = v)}
          />
        </ElFormItem>
      </ElForm>
    )
  }
})

export default DockingInfo
