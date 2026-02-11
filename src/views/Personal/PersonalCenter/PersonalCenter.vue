<script setup lang="ts">
import { ContentWrap } from '@/components/ContentWrap'
import { ref, unref } from 'vue'
import {
  ElTabPane,
  ElTabs,
  ElButton,
  ElMessage,
  ElContainer,
  ElAside,
  ElMain,
  ElMenu,
  ElMenuItem,
  ElIcon
} from 'element-plus'
import defaultAvatar from '@/assets/imgs/logo5.png'
import UploadAvatar from './components/UploadAvatar.vue'
import { Dialog } from '@/components/Dialog'
import EditInfo from './components/EditInfo.vue'
import EditPassword from './components/EditPassword.vue'
import moduleName from 'module'
import AccountInformation from './components/AccountInformation.vue'
import { useRoute } from 'vue-router'
import { User, Edit } from '@element-plus/icons-vue'

const userInfo = ref()
const route = useRoute()

const path = window.location.pathname
const isMerchant = path.startsWith('/pay4Mch/')

const witchPane = ref('accout')

const fetchDetailUserApi = async () => {
  // 这里可以调用接口获取用户信息
  const data = {
    id: 1,
    username: 'admin',
    realName: 'admin',
    phoneNumber: '18888888888',
    email: '502431556@qq.com',
    avatarUrl: '',
    roleList: ['超级管理员']
  }
  userInfo.value = data
}
fetchDetailUserApi()

const activeName = ref('first')

const dialogVisible = ref(false)

const uploadAvatarRef = ref<ComponentRef<typeof UploadAvatar>>()
const avatarLoading = ref(false)
const saveAvatar = async () => {
  try {
    avatarLoading.value = true
    const base64 = unref(uploadAvatarRef)?.getBase64()
    console.log(base64)
    // 这里可以调用修改头像接口
    fetchDetailUserApi()
    ElMessage.success('修改成功')
    dialogVisible.value = false
  } catch (error) {
    console.log(error)
  } finally {
    avatarLoading.value = false
  }
}
</script>

<template>
  <div>
    <div
      v-if="isMerchant"
      class="flex overflow-hidden personal bg-[#fff] !h-[calc(100vh-var(--top-tool-height)-var(--tags-view-height)-var(--app-footer-height))]"
    >
      <ContentWrap class="flex-[3] ml-20px h-full overflow-y-auto">
        <AccountInformation />
      </ContentWrap>
    </div>

    <div v-if="!isMerchant" class="flex w-100% h-100%">
      <ContentWrap title="基本资料" class="flex-[3] ml-20px">
        <ElTabs v-model="activeName">
          <ElTabPane label="基本信息" name="first">
            <EditInfo :user-info="userInfo" />
          </ElTabPane>
          <ElTabPane label="修改密码" name="second">
            <EditPassword />
          </ElTabPane>
        </ElTabs>
      </ContentWrap>
    </div>

    <Dialog v-model="dialogVisible" title="修改头像" width="800px">
      <UploadAvatar ref="uploadAvatarRef" :url="userInfo?.avatarUrl || defaultAvatar" />

      <template #footer>
        <ElButton type="primary" :loading="avatarLoading" @click="saveAvatar"> 保存 </ElButton>
        <ElButton @click="dialogVisible = false">关闭</ElButton>
      </template>
    </Dialog>
  </div>
</template>

<style lang="less">
.account-settings {
  border-right: 1px solid #dcdfe6;
}

.account-settings-menu {
  background-color: transparent;
  border: none;

  .el-menu-item {
    height: 48px !important;
    color: var(--pure-theme-menu-text);
    background-color: transparent !important;
    transition: color 0.2s;

    &:hover {
      color: var(--pure-theme-menu-title-hover) !important;
    }

    &.is-active {
      color: #fff !important;

      &:hover {
        color: #fff !important;
      }

      &::before {
        position: absolute;
        inset: 0 8px;
        clear: both;
        margin: 4px 0;
        content: '';
        background: var(--el-color-primary);
        border-radius: 3px;
      }
    }
  }
}
</style>

<style lang="less" scoped>
.personal {
  border-radius: 12px;

  :deep(.el-descriptions__title) {
    font-size: 18px;
  }
  :deep(.el-descriptions__label) {
    font-size: 14px;
    font-weight: 700;
  }
}
</style>
