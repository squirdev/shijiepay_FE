<script setup lang="tsx">
import { reactive, ref, watch, onMounted, unref, onBeforeUnmount } from 'vue'
import { Form, FormSchema } from '@/components/Form'
import { useI18n } from '@/hooks/web/useI18n'
// import { ElCheckbox, ElLink } from 'element-plus'
import { useForm } from '@/hooks/web/useForm'
import { merchantLoginApi, getTestRoleApi, getAdminRoleApi } from '@/api/login'
import { useAppStore } from '@/store/modules/app'
import { usePermissionStore } from '@/store/modules/permission'
import { useRouter, useRoute } from 'vue-router'
import type { RouteLocationNormalizedLoaded, RouteRecordRaw } from 'vue-router'
import { UserType } from '@/api/login/types'
import { useValidator } from '@/hooks/web/useValidator'
// import { Icon } from '@/components/Icon'
import { useUserStore } from '@/store/modules/user'
import { BaseButton } from '@/components/Button'
import { ElMessage } from 'element-plus'
import { merchantList } from '@/router/mchRouter'
import qs from 'qs'
import { merchantUserApi } from '@/api/merchant'
const { required } = useValidator()

const emit = defineEmits(['to-register'])

const appStore = useAppStore()

const userStore = useUserStore()

const permissionStore = usePermissionStore()

const { currentRoute, addRoute, push } = useRouter()

const { t } = useI18n()
const route = useRoute()
const rules = {
  username: [required()],
  password: [required()],
  verify_code: [required()]
}

const currentMerchantId = ''

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
      const formData = await getFormData<UserType>()

      try {
        const res = await merchantLoginApi(formData, currentMerchantId)

        if (res && res.data.access_token) {
          // if (res) {

          // 是否记住我
          if (unref(remember)) {
            userStore.setLoginInfo({
              username: formData.username,
              password: formData.password
            })
          } else {
            userStore.setLoginInfo(undefined)
          }
          userStore.setMerchantId(currentMerchantId)
          userStore.setRememberMe(unref(remember))
          userStore.setUserInfo(formData)
          userStore.setMerToken(res.data.access_token)
          userStore.setMerRefreshToken(res.data?.refresh_token ?? '')

          await getRole()
          // 是否使用动态路由
          if (appStore.getDynamicRouter) {
          } else {
            await permissionStore.generateRoutes('static').catch(() => {})
            permissionStore.getAddRouters.forEach((route) => {
              addRoute(route as RouteRecordRaw) // 动态添加可访问路由表
            })
            permissionStore.setIsAddRouters(true)
            push({ path: redirect.value || permissionStore.addRouters[0].path })
          }
          // setupMerTokenRefresh()
          ElMessage.success(t('common.loginSuccessful'))
        } else {
          ElMessage.error(res.message)
        }
      } catch (err) {
        ElMessage.error(err.message)
      } finally {
        loading.value = false
      }
    }
  })
}

// 获取角色信息
const getRole = async () => {
  const res = (await merchantUserApi({ action: 'getMchInfo' })) as unknown as {
    data: { permissions: string[]; role_code: string }
    success?: boolean
  }

  if (!res.success) return

  const { permissions, role_code } = res.data
  const routers = merchantList as any as AppCustomRouteRecordRaw[]

  if (role_code === 'MCH_SUPER_ADMIN') {
    userStore.setMerRouters(routers)
  } else {
    // 默认显示菲律宾文档
    const newPermissions = [...permissions]
    const newList = routers.reduce((ret, item) => {
      debugger
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
console.log(3333, newList);
    userStore.setMerRouters(newList as any as string[])
  }

  const roleRouters = [...(userStore.getMerRouters || [])]
  appStore.getDynamicRouter && appStore.getServerDynamicRouter
    ? await permissionStore.generateRoutes('server', roleRouters).catch(() => {})
    : await permissionStore.generateRoutes('frontEnd', roleRouters).catch(() => {})

  permissionStore.getAddRouters.forEach((route) => {
    addRoute(route as RouteRecordRaw) // 动态添加可访问路由表
  })
  permissionStore.setIsAddRouters(true)

  // 添加路由预加载
  await permissionStore.preloadRoutes('merchant')

  // 获取重定向地址或默认路由
  const redirectPath = redirect.value === '/' || !redirect.value ? '/home' : redirect.value

  push({ path: redirectPath })
}

// // 去注册页面
// const toRegister = () => {
//   emit('to-register')
// }
</script>

<template>
  <Form
    :model="{ merchantId: currentMerchantId }"
    :schema="schema"
    :rules="rules"
    label-position="top"
    hide-required-asterisk
    size="large"
    class="dark:(border-1 border-[var(--el-border-color)] border-solid)"
    @register="formRegister"
  />
</template>
