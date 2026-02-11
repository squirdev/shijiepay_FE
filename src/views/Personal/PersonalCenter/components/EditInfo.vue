<script lang="ts" setup>
import { FormSchema, Form } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { useI18n } from '@/hooks/web/useI18n'
import { useValidator } from '@/hooks/web/useValidator'
import { reactive, ref, watch, onMounted } from 'vue'
import { ElDivider, ElMessage, ElMessageBox } from 'element-plus'
import { getUserInfoApi } from '@/api/systemmanagement'
import { fetchUserApi } from '@/api/login'

const props = defineProps({
  userInfo: {
    type: Object,
    default: () => ({})
  }
})

const { t } = useI18n()
const { required, phone, maxlength, email } = useValidator()

const formSchema = reactive<FormSchema[]>([
  {
    field: 'username',
    label: '用户名',
    component: 'Input',
    colProps: {
      span: 24
    }
  },
  {
    field: 'telephone',
    label: '手机号码',
    component: 'Input',
    colProps: {
      span: 24
    }
  },
  {
    field: 'email',
    label: '邮箱',
    component: 'Input',
    colProps: {
      span: 24
    }
  },
  {
    field: 'introduce',
    label: '个人介绍',
    component: 'Input',
    componentProps: {
      type: 'textarea',
      rows: 4
    },
    colProps: {
      span: 24
    }
  }
])

const rules = reactive({
  realName: [required(), maxlength(50)],
  phoneNumber: [phone()],
  email: [email()]
})

const { formRegister, formMethods } = useForm()
const { setValues, getFormData, getElFormExpose } = formMethods

const saveLoading = ref(false)
const info = ref()

const getInfo = async () => {
  const res = (await getUserInfoApi({})) as unknown as {
    data: { superadmin: boolean; permissions: string[] }
    success?: boolean
  }

  if (!res.success) return
  info.value = res.data
  setValues(res.data)
}

onMounted(() => {
  getInfo()
})
const save = async () => {
  const elForm = await getElFormExpose()
  const valid = await elForm?.validate().catch((err) => {
    console.log(err)
  })
  if (valid) {
    ElMessageBox.confirm('是否确认修改?', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        try {
          const formData = await getFormData()

          const { username, telephone, email, introduce } = formData
          saveLoading.value = true
          const newValues = {
            action: 'updateUserInfo',
            username: username ?? '',
            telephone: telephone ?? '',
            email: email ?? '',
            introduce: introduce ?? ''
          }
          const res = await fetchUserApi(newValues)
          if (res?.success) {
            ElMessage.success(t('common.successOperation'))
          } else {
            ElMessage.error(res.message)
          }
        } catch (error) {
          console.log(error)
        } finally {
          saveLoading.value = false
        }
      })
      .catch(() => {})
  }
}
</script>

<template>
  <div class="w-60%">
    <Form :rules="rules" @register="formRegister" :schema="formSchema" />
    <ElDivider />
    <BaseButton type="primary" @click="save">保存</BaseButton>
  </div>
</template>
