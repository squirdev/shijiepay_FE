<script setup lang="tsx">
import { ref, PropType, defineExpose } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElCheckboxGroup,
  ElCheckbox
} from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
interface Options {
  label: string
  value: string
  country?: string
  rate?: number
}

export interface WriteFormData {
  name: string
  country: string
  mch_id: string
  mch_secretkey: string
  mch_login_url: string
  mch_account: string
  mch_password: string
  callback_ip: string
  note: string
  countryTunnelDatas: string[]
  filteredTunnelDatas?: string | Options[]
}

const props = defineProps({
  modelValue: {
    type: Object as PropType<WriteFormData>,
    required: true
  },
  rules: {
    type: Object as PropType<FormRules>,
    default: () => ({})
  },
  merchantCountryOptions: {
    type: Array as PropType<any[]>,
    default: () => []
  },
  filteredTunnelOptions: {
    type: Array as PropType<any[]>,
    default: () => []
  },
  loading: Boolean
})

const emit = defineEmits(['update:modelValue', 'countryChange'])

const { t } = useI18n()

// 表单实例引用
const formRef = ref<FormInstance>()

// 表单验证方法
const validate = async () => {
  if (!formRef.value) return false
  return await formRef.value.validate()
}


// 暴露方法给父组件
defineExpose({
  validate,
  formRef
})

// 渲染表单的方法
const renderForm = () => (
  <ElForm
    ref={formRef}
    model={props.modelValue}
    rules={props.rules}
    labelWidth="130px"
    labelPosition="right"
    class="custom-form"
  >
    <ElFormItem label={t('channelManagement.channelName')} prop="name">
      <ElInput
        v-model={props.modelValue.name}
        placeholder={t('common.inputText')}
        class="w-[300px]"
      />
    </ElFormItem>

    <ElFormItem label={t('channelManagement.country')} prop="country">
      <ElSelect
        v-model={props.modelValue.country}
        placeholder={t('channelManagement.selectCountry')}
        class="w-[300px]"
      >
        {props.merchantCountryOptions.map((item) => (
          <ElOption key={item.value} label={item.label} value={item.value} />
        ))}
      </ElSelect>
    </ElFormItem>

    <ElFormItem label="上游分配ID" prop="mch_id">
      <ElInput
        v-model={props.modelValue.mch_id}
        placeholder={t('common.inputText')}
        class="w-[300px]"
      />
    </ElFormItem>
    <ElFormItem label="上游秘钥" prop="mch_secretkey">
      <ElInput
        v-model={props.modelValue.mch_secretkey}
        placeholder={t('common.inputText')}
        class="w-[300px]"
      />
    </ElFormItem>

    <ElFormItem label="上游商户登陆地址" prop="mch_login_url">
      <ElInput
        v-model={props.modelValue.mch_login_url}
        placeholder={t('common.inputText')}
        class="w-[300px]"
      />
    </ElFormItem>

    <ElFormItem label="上游商户登陆账户" prop="mch_account">
      <ElInput
        v-model={props.modelValue.mch_account}
        placeholder={t('common.inputText')}
        class="w-[300px]"
      />
    </ElFormItem>

    <ElFormItem label="上游商户登陆密码" prop="mch_password">
      <ElInput
        v-model={props.modelValue.mch_password}
        placeholder={t('common.inputText')}
        class="w-[300px]"
      />
    </ElFormItem>
    <ElFormItem label="回调IP" prop="callback_ip">
      <ElInput
        type="textarea"
        rows="4"
        v-model={props.modelValue.callback_ip}
        placeholder={t('common.inputText')}
        class="w-[300px]"
      />
    </ElFormItem>

    <ElFormItem label={t('channelManagement.remark')} prop="note">
      <ElInput
        v-model={props.modelValue.note}
        class="w-[300px]"
        placeholder={t('common.inputText')}
      />
    </ElFormItem>
  </ElForm>
)
</script>

<template>
  <component :is="renderForm()" />
</template>
