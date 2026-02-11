<script setup lang="ts">
import { onMounted, ref, unref } from 'vue'
import { ElDivider, ElImage, ElTag, ElMessage } from 'element-plus'
import defaultAvatar from '@/assets/imgs/logo5.png'
import UploadAvatar from './components/UploadAvatar.vue'
import { useUserStore } from '@/store/modules/user'
import { merchantUserApi } from '@/api/merchant'

const userInfo = ref()

const fetchDetailUserApi = async () => {
  const res = await merchantUserApi({ action: 'getMchInfo' })
  if (!res?.success) return

  userInfo.value = res.data
}
onMounted(() => {
  fetchDetailUserApi()
})

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
  <div class="flex justify-center items-center">
    <div class="avatar w-[150px] h-[150px] relative cursor-pointer" @click="dialogVisible = true">
      <ElImage
        class="w-[150px] h-[150px] rounded-full"
        :src="userInfo?.avatarUrl || defaultAvatar"
        fit="fill"
      />
    </div>
  </div>
  <ElDivider />
  <div class="flex justify-between items-center">
    <div>账号：</div>
    <div>{{ userInfo?.merchant_name }}</div>
  </div>
  <ElDivider />
  <div class="flex justify-between items-center">
    <div>昵称：</div>
    <div>{{ userInfo?.merchant_name }}</div>
  </div>
  <ElDivider />
  <div class="flex justify-between items-center">
    <div>手机号码：</div>
    <div>{{ userInfo?.phoneNumber ?? '-' }}</div>
  </div>
  <ElDivider />
  <div class="flex justify-between items-center">
    <div>用户邮箱：</div>
    <div>{{ userInfo?.email ?? '-' }}</div>
  </div>
  <ElDivider />
  <div class="flex justify-between items-center">
    <div>所属角色：</div>
    <div>
      <template v-if="userInfo?.roleList?.length">
        <ElTag v-for="item in userInfo?.roleList || []" :key="item" class="ml-2 mb-w"
          >{{ item }}
        </ElTag>
      </template>
      <template v-else>-</template>
    </div>
  </div>
  <ElDivider />
</template>
