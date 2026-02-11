import { defineComponent, PropType, watch, ref, reactive } from 'vue'
import { Dialog } from '@/components/Dialog'
import { BaseButton } from '@/components/Button'
import { useI18n } from '@/hooks/web/useI18n'
import { createTunnelApi } from '@/api/channelmanagement'
import { ElForm, ElFormItem, ElInput, ElMessage, FormInstance } from 'element-plus'

interface Info {
  uuid: string
  name: string
  bank_code: string
  statu: boolean
  three_party_bank_code: string
}

interface Row {
  uuid: string
  [key: string]: any
}

interface ConfigFormdata {
  three_party_name: string
  three_party_uuid: string
  weight: number
}

const WeightsConfig = defineComponent({
  name: 'WeightsConfig',
  props: {
    visible: {
      type: Boolean as PropType<boolean>,
      required: true,
      default: false
    },
    row: {
      type: Object as PropType<Row>,
      required: true,
      default: () => ({ uuid: undefined })
    },
    saveCallback: {
      type: Function as PropType<Function>,
      required: true
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const { t } = useI18n()
    const loading = ref(true)
    const saveLoading = ref(false)
    const baseFormRef = ref<FormInstance>()

    const formData = ref<ConfigFormdata[]>([])

    const fetchInfo = async (uuid: string) => {
      if (!uuid) return
      const newValues = {
        action: 'getWeightDatas',
        data_uuid: uuid
      }
      try {
        loading.value = true
        const res = await createTunnelApi(newValues)

        if (!res.success) return
        formData.value = res.data ?? []
      } catch (error) {
        console.log(error)
      } finally {
        loading.value = false
      }
    }

    // 只在 visible 变为 true 时请求
    watch(
      () => props.visible,
      (newVal) => {
        if (newVal && props.row?.uuid) {
          fetchInfo(props.row.uuid)
        }
      }
    )

    const closeDialog = () => {
      emit('update:modelValue', false)
    }

    const saveDialog = async () => {
      const newValues = {
        action: 'updateWeightDatas',
        data_uuid: props.row.uuid,
        weightDatas: formData.value?.map((item) => ({
          three_party_uuid: item.three_party_uuid,
          weight: item.weight
        }))
      }

      try {
        saveLoading.value = true
        const res = await createTunnelApi(newValues)

        if (res.success) {
          ElMessage.success(t('common.successOperation'))
          props.saveCallback()
        } else {
          ElMessage.error(res?.message || t('common.failedOperation'))
        }
      } catch (error) {
        console.log(error)
      } finally {
        saveLoading.value = false
      }
    }

    return () => (
      <Dialog
        title="代付银行配置"
        modelValue={props.visible}
        onUpdate:modelValue={(val) => emit('update:modelValue', val)}
        v-slots={{
          title: () => (
            <div class="flex items-center">
              <div>{t('merchantClassification.channelConfigure')}</div>
              <div class="text-[14px]">(不能大于10, 权重0表示不启用)</div>
            </div>
          ),
          footer: () => (
            <>
              <BaseButton type="primary" onClick={saveDialog}>
                {t('exampleDemo.save')}
              </BaseButton>
              <BaseButton onClick={closeDialog}>{t('dialogDemo.close')}</BaseButton>
            </>
          )
        }}
      >
        {!loading.value && !formData.value?.length && (
          <div class="text-center">无开启当前收款通道三方！</div>
        )}
        <ElForm model={formData} ref={baseFormRef} label-width="80px">
          {formData.value?.map((item, index) => (
            <ElFormItem
              label={item.three_party_name}
              prop={`[${index}].weight`}
              key={item.three_party_uuid}
              rules={[
                { required: true, message: '请输入数值', trigger: ['blur', 'change'] },
                {
                  pattern: /^(?:10(?:\.0+)?|[0-9](?:\.\d+)?)$/,
                  message: '请输入 0-10 之间的数',
                  trigger: ['blur', 'change']
                }
              ]}
            >
              <ElInput
                style="width: 90%"
                modelValue={formData.value[index].weight}
                onUpdate:modelValue={(v) => (formData.value[index]['weight'] = v)}
                placeholder={t('common.inputText')}
                // @input="formData[index].weight = formData[index].weight.replace(/\\D/g, '')"
              />
            </ElFormItem>
          ))}
        </ElForm>
      </Dialog>
    )
  }
})

export default WeightsConfig
