<script setup lang="tsx">
import { reactive, ref, watch, onMounted, unref, onBeforeUnmount } from 'vue'
import { Form, FormSchema } from '@/components/Form'
import { useI18n } from '@/hooks/web/useI18n'
// import { ElCheckbox, ElLink } from 'element-plus'
import { useForm } from '@/hooks/web/useForm'
import {
  loginApi,
  getTestRoleApi,
  getAdminRoleApi,
  refreshTokenApi,
  loginVerifyApi
} from '@/api/login'
import { useAppStore } from '@/store/modules/app'
import { usePermissionStore } from '@/store/modules/permission'
import { useRouter } from 'vue-router'
import type { RouteLocationNormalizedLoaded, RouteRecordRaw } from 'vue-router'
import { UserType } from '@/api/login/types'
import { useValidator } from '@/hooks/web/useValidator'
// import { Icon } from '@/components/Icon'
import { useUserStore } from '@/store/modules/user'
import { BaseButton } from '@/components/Button'
// import { setupTokenRefresh } from '@/utils/setupTokenRefresh'
// import router from '@/router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserInfoApi } from '@/api/systemmanagement'
import { adminRouterList } from '@/router/mgrRouter'
import { StringDecoder } from 'node:string_decoder'
import { generateFingerprint } from '@/utils/browserFingerprint'
import { useEnum } from '@/hooks/web/useEnum'

const { required } = useValidator()

const emit = defineEmits(['to-register'])

const appStore = useAppStore()

const userStore = useUserStore()

const { initAllEnums } = useEnum()

const permissionStore = usePermissionStore()

const { currentRoute, addRoute, push } = useRouter()

const { t } = useI18n()

const rules = {
  username: [required()],
  password: [required()],
  verify_code: [required()]
}

const schema = reactive<FormSchema[]>([
  {
    field: 'title',
    colProps: {
      span: 24
    },
    formItemProps: {
      slots: {
        default: () => {
          return <h2 class="text-2xl font-bold text-center w-[100%]">{t('login.login')}</h2>
        }
      }
    }
  },
  {
    field: 'username',
    label: t('login.username'),
    // value: 'admin',
    component: 'Input',
    colProps: {
      span: 24
    },
    componentProps: {
      placeholder: t('login.username')
    }
  },
  {
    field: 'password',
    label: t('login.password'),
    // value: 'admin',
    component: 'InputPassword',
    colProps: {
      span: 24
    },
    componentProps: {
      style: {
        width: '100%'
      },
      placeholder: t('login.password')
    }
  },
  {
    field: 'verify_code',
    label: t('AddMerchantForm.googleCode'),
    // value: 'admin',
    component: 'Input',
    colProps: {
      span: 24
    },
    componentProps: {
      placeholder: 'google code'
    }
  },
  // {
  //   field: 'tool',
  //   colProps: {
  //     span: 24
  //   },
  //   formItemProps: {
  //     slots: {
  //       default: () => {
  //         return (
  //           <>
  //             <div class="flex justify-between items-center w-[100%]">
  //               <ElCheckbox v-model={remember.value} label={t('login.remember')} size="small" />
  //               <ElLink type="primary" underline={false}>
  //                 {t('login.forgetPassword')}
  //               </ElLink>
  //             </div>
  //           </>
  //         )
  //       }
  //     }
  //   }
  // },
  {
    field: 'login',
    colProps: {
      span: 24
    },
    formItemProps: {
      slots: {
        default: () => {
          return (
            <>
              <div class="w-[100%]">
                <BaseButton
                  loading={loading.value}
                  type="primary"
                  class="w-[100%]"
                  onClick={signIn}
                >
                  {t('login.login')}
                </BaseButton>
              </div>
              {/* <div class="w-[100%] mt-15px">
                <BaseButton class="w-[100%]" onClick={toRegister}>
                  {t('login.register')}
                </BaseButton>
              </div> */}
            </>
          )
        }
      }
    }
  }
  // {
  //   field: 'other',
  //   component: 'Divider',
  //   label: t('login.otherLogin'),
  //   componentProps: {
  //     contentPosition: 'center'
  //   }
  // },
  // {
  //   field: 'otherIcon',
  //   colProps: {
  //     span: 24
  //   },
  //   formItemProps: {
  //     slots: {
  //       default: () => {
  //         return (
  //           <>
  //             <div class="flex justify-between w-[100%]">
  //               <Icon
  //                 icon="vi-ant-design:github-filled"
  //                 size={iconSize}
  //                 class="cursor-pointer ant-icon"
  //                 color={iconColor}
  //                 hoverColor={hoverColor}
  //               />
  //               <Icon
  //                 icon="vi-ant-design:wechat-filled"
  //                 size={iconSize}
  //                 class="cursor-pointer ant-icon"
  //                 color={iconColor}
  //                 hoverColor={hoverColor}
  //               />
  //               <Icon
  //                 icon="vi-ant-design:alipay-circle-filled"
  //                 size={iconSize}
  //                 color={iconColor}
  //                 hoverColor={hoverColor}
  //                 class="cursor-pointer ant-icon"
  //               />
  //               <Icon
  //                 icon="vi-ant-design:weibo-circle-filled"
  //                 size={iconSize}
  //                 color={iconColor}
  //                 hoverColor={hoverColor}
  //                 class="cursor-pointer ant-icon"
  //               />
  //             </div>
  //           </>
  //         )
  //       }
  //     }
  //   }
  // }
])

// const iconSize = 30

const remember = ref(userStore.getRememberMe)

const initLoginInfo = () => {
  const loginInfo = userStore.getLoginInfo
  if (loginInfo) {
    const { username, password } = loginInfo
    setValues({ username, password })
  }
}

const enterLogin = (ev: KeyboardEvent) => {
  if (ev.code !== 'Enter') return
  signIn()
}

onMounted(() => {
  initLoginInfo()
  window.addEventListener('keyup', enterLogin)
})

onBeforeUnmount(() => {
  window.removeEventListener('keyup', enterLogin)
})

const { formRegister, formMethods } = useForm()
const { getFormData, getElFormExpose, setValues } = formMethods

const loading = ref(false)

// const iconColor = '#999'

// const hoverColor = 'var(--el-color-primary)'

const redirect = ref<string>('')

watch(
  () => currentRoute.value,
  (route: RouteLocationNormalizedLoaded) => {
    redirect.value = route?.query?.redirect as string
  },
  {
    immediate: true
  }
)

// 登录
const signIn = async () => {
  const formRef = await getElFormExpose()
  await formRef?.validate(async (isValid) => {
    if (isValid) {
      loading.value = true
      const { fingerprint, data } = await generateFingerprint()
      const formData = await getFormData<UserType>()
      try {
        const loginRes = await loginApi({ ...formData, fingerprint, browser_info: data })

        let res
        if (loginRes.code === 400) {
          ElMessage.error(loginRes.message ?? '登录失败')
          return
        }
        if (loginRes.code === 200) {
          res = loginRes
        }
        if (loginRes.code === 409) {
          const { value } = await ElMessageBox.prompt('', '验证码确认', {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            inputPlaceholder: '请输入验证码'
          })

          const verifyRes = await loginVerifyApi({
            action: 'browser_verify_code',
            mkey: loginRes.data.mkey,
            verify_code: value.trim()
          })
          res = verifyRes
        }

        if (res && res.data.access_token) {
          // 是否记住我
          if (unref(remember)) {
            userStore.setLoginInfo({
              username: formData.username,
              password: formData.password
            })
          } else {
            userStore.setLoginInfo(undefined)
          }
          userStore.setRememberMe(unref(remember))
          userStore.setAdminInfo(formData)

          userStore.setToken(res.data.access_token)
          userStore.setRefreshToken(res.data?.refresh_token ?? '')

          await getRole()
          await initAllEnums()

          ElMessage.success(t('common.loginSuccessful'))
        } else {
          ElMessage.error(res.message)
        }
      } catch (err) {
        console.log(err)
      } finally {
        loading.value = false
      }
    }
  })
}

// 获取角色信息
const getRole = async () => {
  const res = (await getUserInfoApi({})) as unknown as {
    data: { superadmin: boolean; permissions: string[]; role_code: string }
    success?: boolean
  }

  if (!res.success) return

  const { superadmin, permissions, role_code } = res.data
  // @ts-ignore
  userStore.setAdminInfo({ ...userStore.getAdminInfo, ...(res.data ?? {}) })

  //  || role_code === 'IEPVX7M'
  if (superadmin || role_code === 'SUPER_ADMIN') {
    userStore.setAdminRouters(adminRouterList as any as string[])
  } else {
    // 默认显示菲律宾文档
    const newPermissions = [...permissions, 'phDoc']
    const newList = adminRouterList.reduce((ret, item) => {
      // 过滤子路由
      const filteredChildren = item.children?.reduce((childList, childItem) => {
        const { pagePermission, permission } = childItem.meta || {}
        const hasPagePermission = !!pagePermission && newPermissions.includes(pagePermission[0])

        if (permission) {
          childItem.meta.permission = permission?.filter((code) => newPermissions.includes(code))
        }

        if (hasPagePermission || childItem.meta?.permission?.length) {
          // @ts-ignore
          childList.push(childItem)
        }

        return childList
      }, [])

      if (item.path === '/') {
        // @ts-ignore
        ret.push({ ...item })
      }

      if (filteredChildren?.length) {
        // @ts-ignore
        ret.push({ ...item, children: filteredChildren })
      }

      return ret
    }, [])

    userStore.setAdminRouters(newList as any as string[])
  }

  const roleRouters = [...(userStore.getAdminRouters || []), ...(userStore.getMerRouters || [])]
  permissionStore.clearRouteCache()
  // 生成路由
  if (appStore.getDynamicRouter && appStore.getServerDynamicRouter) {
    await permissionStore.generateRoutes('server', roleRouters as any).catch(() => {})
    console.log('getAddRouters:', permissionStore.getAddRouters)
  } else {
    await permissionStore.generateRoutes('frontEnd', roleRouters as any).catch(() => {})
  }

  // 添加路由
  permissionStore.getAddRouters.forEach((route) => {
    addRoute(route as RouteRecordRaw)
  })

  // 设置路由已添加标志
  permissionStore.setIsAddRouters(true)

  // 添加路由预加载
  await permissionStore.preloadRoutes('admin')

  // 获取重定向地址或默认路由
  const redirectPath = redirect.value === '/' || !redirect.value ? '/home' : redirect.value

  // 确保路由已经添加完成后再跳转
  await push(redirectPath)
}

// // 去注册页面
// const toRegister = () => {
//   emit('to-register')
// }
</script>

<template>
  <Form
    :schema="schema"
    :rules="rules"
    label-position="top"
    hide-required-asterisk
    size="large"
    class="dark:(border-1 border-[var(--el-border-color)] border-solid)"
    @register="formRegister"
  />
</template>
