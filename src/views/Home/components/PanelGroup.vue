<script setup lang="ts">
import { CountTo } from '@/components/CountTo'
import { useDesign } from '@/hooks/web/useDesign'
import { useI18n } from '@/hooks/web/useI18n'
import { ref, reactive, onMounted, PropType } from 'vue'
import { getCountApi, getStatisticsApi } from '@/api/dashboard/analysis'
import type { AnalysisTotalTypes } from '@/api/dashboard/analysis/types'

import { ElCard, ElTooltip, ElSkeleton } from 'element-plus'

const { t } = useI18n()

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('panel')

// const loading = ref(true)
const props = defineProps({
  loading: {
    type: Boolean as PropType<boolean>
  },
  totalState: {
    type: Object as PropType<any>,
    default: () => null
  }
})
</script>

<template>
  <div :class="[prefixCls, 'flex', 'gap-20px', 'justify-between']">
    <div class="w-[20%]">
      <ElCard shadow="hover" class="mb-20px">
        <ElSkeleton :loading="loading" animated :rows="2">
          <template #default>
            <ElTooltip
              placement="bottom"
              raw-content
              :content="`<div>
                <div>普通钱包余额: ${Number(props.totalState?.balance_amount ?? 0).toLocaleString()}</div>
                <div>原生钱包余额: ${Number(props.totalState?.native_balance_amount ?? 0).toLocaleString()}</div>
                </div>`"
            >
              <div :class="`${prefixCls}__item flex justify-between`">
                <div>
                  <div
                    :class="`${prefixCls}__item--icon ${prefixCls}__item--peoples p-14px inline-block rounded-6px`"
                  >
                    <Icon icon="ant-design:credit-card-filled" :size="40" />
                  </div>
                </div>
                <div class="flex flex-col justify-between">
                  <div :class="`${prefixCls}__item--text text-16px text-gray-500 text-right`"
                    >当前余额</div
                  >

                  <CountTo
                    class="text-20px font-700 text-right"
                    :start-val="0"
                    :end-val="props.totalState?.total_balance_amount ?? 0"
                    :duration="2600"
                  />
                </div>
              </div>
            </ElTooltip>
          </template>
        </ElSkeleton>
      </ElCard>
    </div>

    <div class="w-[20%]">
      <ElCard shadow="hover" class="mb-20px">
        <ElSkeleton :loading="loading" animated :rows="2">
          <template #default>
            <div :class="`${prefixCls}__item flex justify-between`">
              <div>
                <div
                  :class="`${prefixCls}__item--icon ${prefixCls}__item--message p-14px inline-block rounded-6px`"
                >
                  <Icon icon="ant-design:pie-chart-filled" :size="40" />
                </div>
              </div>
              <div class="flex flex-col justify-between">
                <div :class="`${prefixCls}__item--text text-16px text-gray-500 text-right`"
                  >今日代收订单量</div
                >
                <CountTo
                  class="text-20px font-700 text-right"
                  :start-val="0"
                  :end-val="props.totalState?.payment_order_count ?? 0"
                  :duration="2600"
                />
              </div>
            </div>
          </template>
        </ElSkeleton>
      </ElCard>
    </div>

    <div class="w-[20%]">
      <ElCard shadow="hover" class="mb-20px">
        <ElSkeleton :loading="loading" animated :rows="2">
          <template #default>
            <div :class="`${prefixCls}__item flex justify-between`">
              <div>
                <div
                  :class="`${prefixCls}__item--icon ${prefixCls}__item--message p-14px inline-block rounded-6px`"
                >
                  <Icon icon="ant-design:pie-chart-filled" :size="40" />
                </div>
              </div>
              <div class="flex flex-col justify-between">
                <div :class="`${prefixCls}__item--text text-16px text-gray-500 text-right`"
                  >今日代付订单量</div
                >
                <CountTo
                  class="text-20px font-700 text-right"
                  :start-val="0"
                  :end-val="props.totalState?.payout_order_count ?? 0"
                  :duration="2600"
                />
              </div>
            </div>
          </template>
        </ElSkeleton>
      </ElCard>
    </div>

    <div class="w-[20%]">
      <ElCard shadow="hover" class="mb-20px">
        <ElSkeleton :loading="loading" animated :rows="2">
          <template #default>
            <div :class="`${prefixCls}__item flex justify-between`">
              <div>
                <div
                  :class="`${prefixCls}__item--icon ${prefixCls}__item--money p-14px inline-block rounded-6px`"
                >
                  <Icon icon="ant-design:database-filled" :size="40" />
                </div>
              </div>
              <div class="flex flex-col justify-between">
                <div :class="`${prefixCls}__item--text text-16px text-gray-500 text-right`"
                  >今日代收金额</div
                >
                <CountTo
                  class="text-20px font-700 text-right"
                  :start-val="0"
                  :end-val="props.totalState?.payment_order_amount ?? 0"
                  :duration="2600"
                />
              </div>
            </div>
          </template>
        </ElSkeleton>
      </ElCard>
    </div>

    <div class="w-[20%]">
      <ElCard shadow="hover" class="mb-20px">
        <ElSkeleton :loading="loading" animated :rows="2">
          <template #default>
            <div :class="`${prefixCls}__item flex justify-between`">
              <div>
                <div
                  :class="`${prefixCls}__item--icon ${prefixCls}__item--shopping p-14px inline-block rounded-6px`"
                >
                  <Icon icon="ant-design:hdd-filled" :size="40" />
                </div>
              </div>
              <div class="flex flex-col justify-between">
                <div :class="`${prefixCls}__item--text text-16px text-gray-500 text-right`"
                  >今日代付金额</div
                >
                <CountTo
                  class="text-20px font-700 text-right"
                  :start-val="0"
                  :end-val="props.totalState?.payout_order_amount ?? 0"
                  :duration="2600"
                />
              </div>
            </div>
          </template>
        </ElSkeleton>
      </ElCard>
    </div>
  </div>
</template>

<style lang="less" scoped>
// :deep(.el-card__body) {
//   padding: 0%;
// }

@prefix-cls: ~'@{adminNamespace}-panel';

.@{prefix-cls} {
  &__item {
    &--peoples {
      color: #40c9c6;
    }

    &--message {
      color: #36a3f7;
    }

    &--money {
      color: #f4516c;
    }

    &--shopping {
      color: #34bfa3;
    }

    &:hover {
      :deep(.@{adminNamespace}-icon) {
        color: #fff !important;
      }
      .@{prefix-cls}__item--icon {
        transition: all 0.38s ease-out;
      }
      .@{prefix-cls}__item--peoples {
        background: #40c9c6;
      }
      .@{prefix-cls}__item--message {
        background: #36a3f7;
      }
      .@{prefix-cls}__item--money {
        background: #f4516c;
      }
      .@{prefix-cls}__item--shopping {
        background: #34bfa3;
      }
    }
  }
}
</style>
