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
    type: Boolean,
    default: false
  }
})

const rules = reactive({
  name: [required()],
  tunnel_uuid: [required()],
  country: [required()]
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
  submit
})

const filteredFormSchema = computed(() => {
  return props.isEdit
    ? props.formSchema.filter(
        (field) => field.field !== 'mer_password' && field.field !== 'confirm_password'
      )
    : props.formSchema
})
</script>

<template>
  <Form :rules="rules" @register="formRegister" :schema="filteredFormSchema" />
</template>
