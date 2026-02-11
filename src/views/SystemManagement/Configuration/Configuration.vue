<script setup lang="ts">
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { InfoFilled } from '@element-plus/icons-vue'
import { Breadcrumb } from '@/components/Breadcrumb'
import { getSettingApi, updateSettingApi, uploadImageApi } from '@/api/systemmanagement'
import { onMounted, ref } from 'vue'
import {
  ElForm,
  FormInstance,
  ElFormItem,
  ElCol,
  ElInput,
  ElTooltip,
  ElButton,
  ElMessage,
  ElSwitch,
  ElUpload,
  UploadFile
} from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useUserStoreWithOut } from '@/store/modules/user'
import { useAppStore } from '@/store/modules/app'

const { t } = useI18n()
const previewImage = ref('')
const configFormRef = ref<FormInstance>()
const appStore = useAppStore()
const userStore = useUserStoreWithOut()
const initialValue = ref()

onMounted(() => {
  getConfig()
})

const getImage = async (url: string) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_API_ADDRESS}${url}`)
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)
    return blobUrl
  } catch (error) {
    console.log('图片获取失败', error)
    return ''
  }
}

const getConfig = async () => {
  try {
    appStore.pageLoading = true
    const res = await getSettingApi()

    initialValue.value = res.data
    if (res.data.site_logo) {
      const url = await getImage(res.data.site_logo)
      previewImage.value = url
    }
    if (res.data.api_domain) {
      userStore.setAdminInfo({ ...userStore.getAdminInfo, api_domain: res.data.api_domain })
    }
    assingValues(initialValue.value)
  } catch (error) {
    console.log(error)
  } finally {
    appStore.pageLoading = false
  }
}

const assingValues = (data: any) => {
  formModel.value = {
    cms_login_ip_whitelist: data.cms_login_ip_whitelist,
    login_google_verify_statu: data.login_google_verify_statu === true,
    merchant_session_validity: data.merchant_session_validity,
    cms_session_validity: data.cms_session_validity,
    payment_timeout_callbank: data.payment_timeout_callbank,
    payout_timeout_callbank: data.payout_timeout_callbank,
    site_name: data.site_name,
    site_logo: data.site_logo,
    mch_domain: data.mch_domain,
    api_domain: data.api_domain,
    uuid: data.uuid
  }
}

const formModel = ref({
  cms_login_ip_whitelist: '',
  login_google_verify_statu: false,
  payment_timeout_callbank: false,
  payout_timeout_callbank: false,
  merchant_session_validity: 2,
  cms_session_validity: 2,
  site_name: '',
  site_logo: '',
  mch_domain: '',
  api_domain: '',
  uuid: ''
})

const uploadChange = async (uploadFile: UploadFile) => {
  // 判断是否是图片
  if (uploadFile?.raw?.type.indexOf('image') === -1) {
    ElMessage.error(t('common.uploadImageFormatError')) /* 请上传图片格式的文件 */
    return
  }
  if (!uploadFile.raw) return

  // 先用本地 blob 地址预览
  const localUrl = URL.createObjectURL(uploadFile.raw)
  previewImage.value = localUrl

  try {
    const res = await uploadImageApi(uploadFile.raw)
    formModel.value.site_logo = res.data.filePath
  } catch (error) {
    console.log(error)
  }
}

const submit = async () => {
  try {
    const valid = await configFormRef.value?.validate()

    if (!valid) return
    appStore.pageLoading = true
    const {
      cms_login_ip_whitelist,
      login_google_verify_statu,
      merchant_session_validity,
      cms_session_validity,
      payment_timeout_callbank,
      payout_timeout_callbank,
      site_name,
      site_logo,
      mch_domain,
      api_domain,
      uuid
    } = formModel.value
    const newValue = {
      cms_login_ip_whitelist,
      login_google_verify_statu,
      merchant_session_validity,
      cms_session_validity,
      site_name,
      site_logo,
      mch_domain,
      api_domain,
      payment_timeout_callbank,
      payout_timeout_callbank,
      action: 'updateSystemConfig',
      data_uuid: uuid ?? ''
    }

    const res = await updateSettingApi(newValue)

    if (res?.success) {
      ElMessage.success(t('common.successOperation'))
      getConfig()
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    console.log(error)
  } finally {
    appStore.pageLoading = false
  }
}

const reset = () => {
  assingValues(initialValue.value)
}
</script>

<template>
  <ElRow style="display: flex; align-items: stretch">
    <ElCol :span="24" :style="{ paddingLeft: '10px' }">
      <ContentWrap class="detail-div" :title="t('router.configuration')">
        <ElForm ref="configFormRef" :model="formModel" labelWidth="300px" labelPosition="right">
          <div class="w-[70%] pt-16px mb-96px">
            <ElFormItem prop="site_name">
              <template #label>
                <!-- 网站名称 -->
                {{ t('configuration.siteName') }}
              </template>
              <ElInput v-model="formModel.site_name" />
            </ElFormItem>
            <ElFormItem prop="site_logo">
              <!-- 网站logo -->
              <template #label> {{ t('configuration.siteLogo') }} </template>
              <ElUpload
                action="''"
                accept="image/*"
                :auto-upload="false"
                :show-file-list="false"
                :on-change="uploadChange"
              >
                <img
                  v-if="formModel.site_logo"
                  :src="previewImage ? previewImage : formModel.site_logo"
                  class="avatar"
                />
                <el-icon v-else class="upload-icon"><Plus /></el-icon>
              </ElUpload>
            </ElFormItem>
            <ElFormItem prop="site_name">
              <!-- 商户端域名 -->
              <template #label> {{ t('configuration.mchDomain') }} </template>
              <ElInput v-model="formModel.mch_domain" />
            </ElFormItem>
            <ElFormItem prop="site_name">
              <!-- api域名 -->
              <template #label> {{ t('configuration.apiDomain') }} </template>
              <ElInput v-model="formModel.api_domain" />
            </ElFormItem>
            <ElFormItem :label="t('configuration.loginIPWhitelist')" prop="cms_login_ip_whitelist">
              <ElInput v-model="formModel.cms_login_ip_whitelist" type="textarea" />
            </ElFormItem>

            <ElFormItem prop="login_google_verify_statu">
              <template #label>
                <div class="flex text-14px items-center">
                  <span>{{ t('configuration.googleSwitch') }}</span>
                  <ElTooltip :content="t('configuration.googleVerify')" placement="top">
                    <ElButton :icon="InfoFilled" type="text" :style="{ color: '#606266' }" />
                  </ElTooltip>
                </div>
              </template>
              <ElSwitch v-model="formModel.login_google_verify_statu" />
            </ElFormItem>

            <ElFormItem prop="payment_timeout_callbank" label="代收掉单超时自动回调">
              <ElSwitch v-model="formModel.payment_timeout_callbank" />
            </ElFormItem>
            <ElFormItem prop="payout_timeout_callbank" label="代付超时自动回调">
              <ElSwitch v-model="formModel.payout_timeout_callbank" />
            </ElFormItem>
          </div>
          <p
            class="text-16px font-700 mb-20px h-36px"
            style="border-bottom: 1px solid var(--el-border-color) !important"
            >{{ t('configuration.loginSetting') }}</p
          >
          <div class="w-[70%] pt-16px">
            <ElFormItem :label="t('configuration.loginPeriod')" prop="merchant_session_validity">
              <ElInput
                type="number"
                v-model="formModel.merchant_session_validity"
                :controls-position="'right'"
                :placeholder="t('configuration.loginPeriod')"
              />
            </ElFormItem>
            <ElFormItem :label="t('configuration.operationsideLogin')" prop="cms_session_validity">
              <ElInput
                type="number"
                v-model="formModel.cms_session_validity"
                :controls-position="'right'"
                :placeholder="t('configuration.operationsideLogin')"
              />
            </ElFormItem>
          </div>
          <div class="pl-300px mb-20px mt-30px">
            <BaseButton type="primary" @click="submit">{{
              t('configuration.saveButton')
            }}</BaseButton>
            <BaseButton @click="reset">{{ t('common.reset') }}</BaseButton>
          </div>
        </ElForm>
      </ContentWrap>
    </ElCol>
  </ElRow>
</template>

<style lang="css">
.config-infotip .v-infotip__title {
  font-size: 14px !important;
}
.detail-div > .el-card__body {
  border-top: 1px solid var(--el-border-color) !important;
}
.detail-div textarea {
  min-height: 120px !important;
}
.detail-div .el-input-number {
  width: 100%;
}
.detail-div .el-form-item {
  margin-bottom: 24px !important;
}
.avatar {
  width: 100px;
  height: 100px;
  display: block;
  object-fit: contain;
}

.upload-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  padding: 24px;
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
}
</style>
