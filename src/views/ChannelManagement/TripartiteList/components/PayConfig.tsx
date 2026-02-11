import {
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElSwitch,
  FormInstance,
  ElTooltip,
  ElMessage
} from 'element-plus'
import { PropType, defineComponent, onMounted, ref } from 'vue'
import { getEncryptTypesApi, createTripartApi } from '@/api/channelmanagement'
import { useI18n } from '@/hooks/web/useI18n'

interface Option {
  label: string
  value: string
}

const PayConfigInfo = defineComponent({
  name: 'PayConfigInfo',
  props: {
    type: {
      type: String as PropType<'payment' | 'payout'>,
      required: true
    },
    currentRow: {
      type: Object as PropType<Record<string, any>>,
      required: true
    }
  },
  setup(props, { expose }) {
    const { t } = useI18n()

    const fieldList = [
      {
        id: (Math.random() * 100000).toFixed(3),
        label: t('channelManagement.upstreamAllocationID') /* 上游分配ID */,
        sys_fields: 'mch_id',
        api_field: '',
        field_type: 'string',
        is_encrypt: false
      },

      {
        id: (Math.random() * 100000).toFixed(3),
        label: t('channelManagement.transactionAmount') /* 交易金额 */,
        sys_fields: 'amount',
        api_field: '',
        field_type: 'string',
        is_encrypt: false
      },
      {
        id: (Math.random() * 100000).toFixed(3),
        label: t('channelManagement.transactionStatus') /* 交易状态 */,
        sys_fields: 'opstate',
        api_field: '',
        field_type: 'string',
        is_encrypt: false
      },
      {
        id: (Math.random() * 100000).toFixed(3),
        label: t('channelManagement.callbackParameters') /* 回调携带参数 */,
        sys_fields: 'remark',
        api_field: '',
        field_type: 'string',
        is_encrypt: false
      },
      {
        id: (Math.random() * 100000).toFixed(3),
        label: t('channelManagement.signature') /* 签名 */,
        sys_fields: 'sign',
        api_field: '',
        field_type: 'string',
        is_encrypt: false
      }
    ]

    const baseFormRef = ref<FormInstance>()
    const encryptTypeOptions = ref<Option[]>([])
    const modelValue = ref({ request_method: '', encrypt_type: '', fields_col: [...fieldList] })

    const fetchEncryptTypes = async () => {
      const res = await getEncryptTypesApi({})

      if (!res.success) return

      encryptTypeOptions.value = res.data?.map((item) => ({ label: item.name, value: item.code }))
    }

    const fetchConfig = async () => {
      const values = { action: '', data_uuid: props.currentRow?.uuid }

      if (props.type === 'payment') {
        values.action = 'getPaymentCallbacksConfig'
      }
      if (props.type === 'payout') {
        values.action = 'getPayoutCallbacksConfig'
      }

      const res = await createTripartApi(values)
      if (!res.success) return
      if (res.data?.fields_col?.length) {
        const newList = res.data?.fields_col?.map((item) => {
          const label = fieldList.find((l) => l.sys_fields === item.sys_fields)?.label ?? ''
          return { ...item, label }
        })
        modelValue.value = { ...res.data, fields_col: newList }
      }
    }

    onMounted(() => {
      fetchConfig()
      fetchEncryptTypes()
    })

    const submit = async () => {
      try {
        const valid = await baseFormRef.value?.validate()

        if (valid) {
          const { fields_col, request_method, encrypt_type } = modelValue.value
          const newList = fields_col.map((l) => ({ ...l, label: undefined }))

          const apiFieldArray = newList.filter((l) => !!l.api_field.trim())

          if (!apiFieldArray.length) {
            ElMessage.error(t('common.pleaseConfigureFixedParameters') /* 请配置固定参数 */)
            return
          }

          return { fields_col: newList, request_method, encrypt_type }
        }
      } catch (error) {
        console.log(error)
      }
    }

    expose({
      submit
    })

    return () => (
      <ElForm model={modelValue} ref={baseFormRef} labelWidth="80px" labelPosition="right">
        <ElFormItem
          label={t('channelManagement.callbackMethod') /* 回调方式 */}
          prop="request_method"
          rules={{
            required: true,
            message: t('common.selectText') /* 请选择 */,
            trigger: ['blur', 'change']
          }}
        >
          <ElSelect
            modelValue={modelValue.value.request_method}
            onUpdate:modelValue={(v) => (modelValue.value.request_method = v)}
            placeholder={t('common.selectText') /* 请选择 */}
          >
            <ElOption value="get" label={t('APILogs.get') /* GET */}></ElOption>
            <ElOption value="post" label={t('APILogs.post') /* POST */}></ElOption>
          </ElSelect>
        </ElFormItem>

        <ElFormItem
          label={t('channelManagement.encryptionMethod') /* 加密方式 */}
          prop="encrypt_type"
          rules={{
            required: true,
            message: t('common.selectText') /* 请选择 */,
            trigger: ['blur', 'change']
          }}
        >
          <ElSelect
            modelValue={modelValue.value.encrypt_type}
            onUpdate:modelValue={(v) => (modelValue.value.encrypt_type = v)}
          >
            {encryptTypeOptions.value?.map((item) => (
              <ElOption key={item.value} value={item.value} label={item.label} />
            ))}
          </ElSelect>
        </ElFormItem>
        {modelValue.value.fields_col?.map((item, index) => (
          <div class="flex">
            <ElFormItem
              label={t('common.fixedParameters') /* 固定参数 */}
              prop={`fields_col[${index}].api_field`}
              // rules={{ required: true, message: t('common.inputText') /* 请输入 */, trigger: ['blur', 'change'] }}
            >
              <ElInput
                modelValue={modelValue.value['fields_col'][index]?.['api_field']}
                onUpdate:modelValue={(v) =>
                  (modelValue.value['fields_col'][index]['api_field'] = v)
                }
                placeholder={t('common.inputText') /* 请输入 */}
                v-slots={{
                  prepend: () => (
                    <>
                      {item.label.length >= 6 ? (
                        <ElTooltip content={item.label} placement="top">
                          <div class="w-60px truncate">{item.label}</div>
                        </ElTooltip>
                      ) : (
                        <div class="w-60px">{item.label}</div>
                      )}
                    </>
                  )
                }}
              ></ElInput>
            </ElFormItem>
            <ElFormItem
              label={t('channelManagement.parameterType') /* 参数类型 */}
              prop={`fields_col[${index}].field_type`}
            >
              <ElSelect
                modelValue={modelValue.value['fields_col'][index]['field_type']}
                onUpdate:modelValue={(v) =>
                  (modelValue.value['fields_col'][index]['field_type'] = v)
                }
                style={{ width: '100px' }}
                placeholder={t('common.selectText') /* 请选择 */}
              >
                <ElOption value="int">int</ElOption>
                <ElOption value="string">string</ElOption>
                <ElOption value="float">float</ElOption>
              </ElSelect>
            </ElFormItem>
            <ElFormItem
              label={t('channelManagement.participateInSignature') /* 参与签名 */}
              prop={`fields_col[${index}].is_encrypt`}
            >
              <ElSwitch
                modelValue={modelValue.value['fields_col'][index]['is_encrypt']}
                onUpdate:modelValue={(v: boolean) =>
                  (modelValue.value['fields_col'][index]['is_encrypt'] = v)
                }
              />
            </ElFormItem>
          </div>
        ))}
      </ElForm>
    )
  }
})

export default PayConfigInfo
