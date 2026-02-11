<script setup lang="ts">
import { ContentWrap } from '@/components/ContentWrap'
import { useClipboard } from '@/hooks/web/useClipboard'
import { ElInput } from 'element-plus'
import { ref } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'

const { copy, copied, text, isSupported } = useClipboard()

const source = ref('')

const { t } = useI18n()
</script>

<template>
  <div class="p-10px">
    <ElInput v-model="source" :placeholder="t('clipboard.placeholder') /* 请输入要复制的内容 */" />
    <BaseButton @click="copy(source)" class="mt-10px">
      <span v-if="!copied">
        {{ t('clipboard.copy') }}
        <!-- 复制 -->
      </span>
      <span v-else>
        {{ t('clipboard.copied') }}
        <!-- 已复制 -->
      </span>
    </BaseButton>
    <p v-if="isSupported">
      {{ t('clipboard.currentCopied') }}: <code>{{ text || 'none' }}</code>
      <!-- 当前已复制 -->
    </p>
    <p v-else>
      {{ t('clipboard.browserNotSupport') }}
      <!-- 你的浏览器不支持 Clipboard API -->
    </p>
  </div>
</template>
