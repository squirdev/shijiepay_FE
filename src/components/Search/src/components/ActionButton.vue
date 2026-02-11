<script setup lang="ts">
import { useIcon } from '@/hooks/web/useIcon'
import { propTypes } from '@/utils/propTypes'
import { useI18n } from '@/hooks/web/useI18n'
import { Search, Refresh } from '@element-plus/icons-vue'

const emit = defineEmits(['search', 'reset', 'expand'])

const { t } = useI18n()

defineProps({
  showSearch: propTypes.bool.def(true),
  showReset: propTypes.bool.def(true),
  showExpand: propTypes.bool.def(false),
  showAddAccount: propTypes.bool.def(false),
  visible: propTypes.bool.def(true),
  searchLoading: propTypes.bool.def(false),
  resetLoading: propTypes.bool.def(false)
})

const onSearch = () => {
  emit('search')
}

const onReset = () => {
  emit('reset')
}

const onExpand = () => {
  emit('expand')
}

const onAddAccount = () => {
  console.log('onAddAccount')
}
</script>

<template>
  <BaseButton
    v-if="showSearch"
    type="primary"
    :icon="Search"
    :loading="searchLoading"
    @click="onSearch"
  >
    {{ t('common.search') }}
  </BaseButton>
  <BaseButton v-if="showReset" :icon="Refresh" :loading="resetLoading" plain @click="onReset">
    {{ t('common.reset') }}
  </BaseButton>
  <BaseButton
    v-if="showExpand"
    :icon="useIcon({ icon: visible ? 'vi-ep:arrow-up' : 'vi-ep:arrow-down' })"
    text
    @click="onExpand"
  >
    {{ t(visible ? 'common.shrink' : 'common.expand') }}
  </BaseButton>
  <BaseButton v-if="showAddAccount" type="warning" @click="onAddAccount">
    {{ t('common.addChannel') }}
  </BaseButton>
</template>
