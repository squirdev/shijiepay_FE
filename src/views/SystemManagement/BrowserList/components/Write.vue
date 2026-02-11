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
    type: Object as PropType<any>,
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

const rules = reactive({
  username: [required()],
  account: [required()],
  'department.id': [required()],

  review_statu: [required()],
  verification_code: [
    required(),

    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('请输入内容'))
        } else {
          // 表示只允许字母和数字
          const reg = /^[a-zA-Z0-9]{6}$/

          if (!reg.test(value)) {
            callback(new Error('格式错误：长度必须为6位，且只能包含字母和数字'))
          } else {
            callback() // 校验通过
          }
        }
      },
      trigger: ['blur', 'change']
    }
  ]
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
  const newFormSchema = props.formSchema.map((item) => {
    if (item.field === 'review_statu') {
      item.componentProps.disabled = ['reject', 'unknown_core'].includes(
        props.currentRow?.review_statu
      )
      return item
    }
    return item
  })

  return newFormSchema
})

defineExpose({
  submit
})
</script>

<template>
  <Form :rules="rules" @register="formRegister" :schema="filteredFormSchema" />
</template>
