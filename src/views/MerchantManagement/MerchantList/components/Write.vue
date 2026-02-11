<script setup lang="ts">
import { Form, FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { computed, PropType, reactive, watch } from 'vue'
import { PaymentChannelType } from '@/api/channelmanagement/types'
import { useValidator } from '@/hooks/web/useValidator'
import { useI18n } from '@/hooks/web/useI18n'
const { t } = useI18n()

const { required } = useValidator()

const props = defineProps({
  currentRow: {
    type: Object as PropType<PaymentChannelType>,
    default: () => undefined
  },
  formSchema: {
    type: Array as PropType<FormSchema[]>,
    default: () => []
  },
  isEdit: {
    type: Boolean
  }
})

const passwordMatchValidator = async (rule, value, callback) => {
  const formData = (await getFormData()) || {}

  if (value !== formData.password) {
    callback(new Error(t('formDemo.passwordMismatch')))
  } else {
    callback()
  }
}
const rules = reactive({
  country: [required()],
  merchant_name: [required()],
  merchant_classify_uuid: [required()],
  account: [required()],
  account_name: [required()],
  password: props.isEdit
    ? []
    : [
        required(),

        {
          validator: (rule, value, callback) => {
            if (!value) {
              callback(new Error('请输入密码'))
            } else if (value.length < 8 || value.length > 18) {
              callback(new Error('密码长度必须在8-18位之间'))
            } else if (!/[a-zA-Z]/.test(value)) {
              callback(new Error('密码必须至少包含1个字母'))
            } else if (!/\d/.test(value)) {
              // 检查是否包含数字
              callback(new Error('密码必须至少包含1个数字'))
            } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
              // 检查是否包含特殊符号
              callback(new Error('密码必须至少包含1个特殊符号'))
            } else {
              // 所有校验都通过
              callback()
            }
          },
          trigger: ['blur', 'change']
        }
      ],
  confirm_password: props.isEdit
    ? []
    : [
        required(),
        {
          validator: (rule, value, callback) => {
            if (!value) {
              callback(new Error('请输入密码'))
            } else if (value.length < 8 || value.length > 18) {
              callback(new Error('密码长度必须在8-18位之间'))
            } else if (!/[a-zA-Z]/.test(value)) {
              callback(new Error('密码必须至少包含1个字母'))
            } else if (!/\d/.test(value)) {
              // 检查是否包含数字
              callback(new Error('密码必须至少包含1个数字'))
            } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
              // 检查是否包含特殊符号
              callback(new Error('密码必须至少包含1个特殊符号'))
            } else {
              // 所有校验都通过
              callback()
            }
          },
          trigger: ['blur', 'change']
        },
        { validator: passwordMatchValidator }
      ], // Add match validation
  ip_whitelist: [required()],
  cz_amount: [required()],
  kc_amount: [required()],
  wallet_type: [required()],
  google_code: [required()],
  wallet_type_uuid: [required()]
})

const { formRegister, formMethods } = useForm()
const { setValues, getFormData, getElFormExpose } = formMethods

const submit = async () => {
  const elForm = await getElFormExpose()
  const valid = await elForm?.validate().catch((err) => {
    console.log(err)
  })
  if (valid) {
    const formData = await getFormData()
    return formData
  }
}

watch(
  () => props.currentRow,
  (currentRow) => {
    if (!currentRow) return
    setValues(currentRow)
  },
  {
    deep: true,
    immediate: true
  }
)

defineExpose({
  submit,
  setValues
})

const filteredFormSchema = computed(() => {
  return props.isEdit
    ? props.formSchema.filter(
        (field) => field.field !== 'password' && field.field !== 'confirm_password'
      )
    : props.formSchema
})
</script>

<template>
  <Form :rules="rules" @register="formRegister" :schema="filteredFormSchema" />
</template>
