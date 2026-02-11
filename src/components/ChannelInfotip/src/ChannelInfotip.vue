<script setup lang="ts">
import { PropType } from 'vue'
// import { Highlight } from '@/components/Highlight'
import { useDesign } from '@/hooks/web/useDesign'
import { propTypes } from '@/utils/propTypes'
import { InfoTipSchema } from './types'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('channelinfotip')

defineProps({
  title: propTypes.string.def(''),
  schema: {
    type: Array as PropType<Array<string | InfoTipSchema>>,
    required: true,
    default: () => []
  },
  showIndex: propTypes.bool.def(true),
  highlightColor: propTypes.string.def('var(--el-color-primary)')
})

// const emit = defineEmits(['click'])

// const keyClick = (key: string) => {
//   emit('click', key)
// }
</script>

<template>
  <div
    :class="[
      prefixCls,
      'p-20px mb-20px border-1px border-solid border-[var(--el-color-primary)] bg-channel-info-tip'
    ]"
  >
    <div v-if="title" :class="[`${prefixCls}__header`, 'flex items-center']">
      <Icon icon="majesticons:lightbulb-shine" :size="22" color="var(--el-color-primary)" />
      <span :class="[`${prefixCls}__title`, 'pl-5px text-16px']">{{ title }}</span>
    </div>
    <!-- <div :class="`${prefixCls}__content`">
      <p v-for="(item, $index) in schema" :key="$index" class="text-14px mt-15px">
        <Highlight
          :keys="typeof item === 'string' ? [] : item.keys"
          :color="highlightColor"
          @click="keyClick"
        >
          {{ showIndex ? `${$index + 1}、` : '' }}{{ typeof item === 'string' ? item : item.label }}
        </Highlight>
      </p>
    </div> -->
  </div>
</template>

<style>
.bg-channel-info-tip {
  background-color: #cce5ff;
  color: #004085;
  border-color: #b8daff;
}
.lg-middle {
  width: 100%;
}
@media (min-width: 992px) {
  .lg-middle {
    max-width: 50%;
  }
}
</style>
