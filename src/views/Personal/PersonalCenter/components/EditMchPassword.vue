<script setup lang="ts">
import { Form, FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { useI18n } from '@/hooks/web/useI18n'
import { reactive, ref } from 'vue'
import { useValidator } from '@/hooks/web/useValidator'
import { ElMessage, ElMessageBox, ElDivider } from 'element-plus'
import { merchantUserApi } from '@/api/merchant'
import { fetchUserApi } from '@/api/login'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/store/modules/user'

const { required } = useValidator()
const route = useRoute()
const userStore = useUserStore()
const { t } = useI18n()

const emit = defineEmits(['success']) // 定义事件

const formSchema = reactive<FormSchema[]>([
  {
    field: 'newPassword',
    label: '新密码',
    component: 'InputPassword',
    colProps: {
      span: 24
    },
    componentProps: {
      strength: true
    }
  },
  {
    field: 'newPassword2',
    label: '确认新密码',
    component: 'InputPassword',
    colProps: {
      span: 24
    },
    componentProps: {
      strength: true
    }
  },
  {
    field: 'verify_code',
    label: 'google码',
    component: 'Input',
    colProps: {
      span: 24
    }
  }
])

const rules = reactive({
  verify_code: [required()],
  newPassword: [required()],
  newPassword2: [
    required(),
    {
      asyncValidator: async (_, val, callback) => {
        const formData = await getFormData()
        const { newPassword } = formData
        if (val !== newPassword) {
          callback(new Error('确认新密码与新密码不一致'))
        } else {
          callback()
        }
      }
    }
  ]
})

const { formRegister, formMethods } = useForm()
const { getFormData, getElFormExpose } = formMethods

const saveLoading = ref(false)
const loginOut = () => {
  console.log('logout route', route.path)
  const path = window.location.pathname
  if (path.startsWith('/pay4Mgr/')) userStore.logoutConfirm()
  if (path.startsWith('/pay4Mch/')) userStore.merLogoutConfirm()
}

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
        const formData = await getFormData()
        const path = window.location.pathname
        const { newPassword, verify_code } = formData

        try {
          saveLoading.value = true
          let res
          if (path.startsWith('/pay4Mgr/')) {
            const newValues = {
              action: 'updateUserPwd',
              password: newPassword,
              google_code: verify_code
            }
            res = await fetchUserApi(newValues)
          }
          if (path.startsWith('/pay4Mch/')) {
            const newValues = {
              action: 'resetPassword',
              password: newPassword,
              verify_code
            }
            res = await merchantUserApi(newValues)
          }

          if (res?.success) {
            elForm?.resetFields()
            emit('success') // 通知父组件关闭弹窗
            ElMessage.success(t('common.successOperation'))
          } else {
            ElMessage.error(res.message)
            return
          }
          elForm?.resetFields()
          loginOut()
        } catch (error) {
          console.log(error)
        } finally {
          saveLoading.value = false
        }
      })
      .catch(() => {})
  }
}

defineExpose({
  save
})
</script>

<template>
  <div>
    <Form :rules="rules" @register="formRegister" :schema="formSchema" />
  </div>
</template>
