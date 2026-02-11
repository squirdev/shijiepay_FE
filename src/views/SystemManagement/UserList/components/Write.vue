<script setup lang="ts">
import { Form, FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { computed, PropType, reactive, watch } from 'vue'
import { UserType } from '@/api/systemmanagement/types'
import { useValidator } from '@/hooks/web/useValidator'
import { useI18n } from '@/hooks/web/useI18n'
const { t } = useI18n()

const { required } = useValidator()

const props = defineProps({
  currentRow: {
    type: Object as PropType<UserType>,
    default: () => undefined
  },
  formSchema: {
    type: Array as PropType<FormSchema[]>,
    default: () => []
  },
  type: {
    type: String as PropType<'edit' | 'changePassword'>
  }
})

const passwordMatchValidator = async (rule, value, callback) => {
  const formData = (await getFormData()) || {}
  console.log(formData)
  if (value !== formData.password) {
    console.log(value, formData.password)
    callback(new Error(t('formDemo.passwordMismatch')))
  } else {
    callback()
  }
}

const rules = reactive({
  username: [required()],
  account: [required()],
  'department.id': [required()],

  password:
    props.type === 'changePassword'
      ? [
          required(),
          {
            min: 6,
            max: 18,
            message: '密码长度应为 6 到 18 个字符',
            trigger: ['blur', 'change']
          }
        ]
      : [],
  confirm_password:
    props.type === 'changePassword'
      ? [
          required(),
          {
            min: 6,
            max: 18,
            message: '密码长度应为 6 到 18 个字符',
            trigger: ['blur', 'change']
          },
          { validator: passwordMatchValidator }
        ]
      : [],

  google_code: props.type === 'changePassword' ? [required()] : []
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

const filteredFormSchema = computed(() => {
  return props.type === 'edit'
    ? props.formSchema.filter(
        (field) => field.field !== 'password' && field.field !== 'ConfirmPassword'
      )
    : props.formSchema
})

defineExpose({
  submit
})
</script>

<template>
  <Form :rules="rules" @register="formRegister" :schema="filteredFormSchema" />
</template>
