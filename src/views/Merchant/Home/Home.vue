<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import PanelGroup from './components/PanelGroup.vue'
import { ElRow, ElCol, ElCard, ElSkeleton } from 'element-plus'
import { Echart } from '@/components/Echart'
import { Breadcrumb } from '@/components/Breadcrumb'
import { barOptions, lineOptions } from './echarts-data'
import { ContentWrap } from '@/components/ContentWrap'
import { ref, onMounted } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { getMchStatisticsApi } from '@/api/merchant'

const { t } = useI18n()

const payoutBarOptions = ref<EChartsOption>({ ...barOptions })
const currentLineoptions = ref<EChartsOption>({ ...lineOptions })

const loading = ref(true)

const statisData = ref()

const fetchStatisticsApi = async () => {
  try {
    const res = await getMchStatisticsApi({ action: 'homeTotalData' })
    statisData.value = res.data

    processChart()
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

const processChart = () => {
  payoutBarOptions.value.series![0]!.data = [
    {
      value: statisData.value.payment_success_rate ?? 0,
      name: '代收成功率'
    }
  ]

  const xAxisData: string[] = []
  const payment: number[] = []
  const payout: number[] = []

  for (const [key, value] of Object.entries(statisData.value?.zt_datas ?? {})) {
    xAxisData.push(key)

    payment.push(
      (value as Record<'payment_order_count' | 'payout_order_count', number>).payment_order_count
    )
    payout.push(
      (value as Record<'payment_order_count' | 'payout_order_count', number>).payout_order_count
    )
  }

  currentLineoptions.value = {
    ...currentLineoptions.value,
    xAxis: [
      {
        type: 'category',
        data: Object.keys(statisData.value?.zt_datas ?? {})
      }
    ],
    series: [
      {
        name: '代收订单量',
        type: 'bar',
        data: payment,
        markPoint: {
          data: [
            { type: 'max', name: 'Max' },
            { type: 'min', name: 'Min' }
          ]
        },
        markLine: {
          data: [{ type: 'average', name: 'Avg' }]
        }
      },
      {
        name: '代付订单量',
        type: 'bar',
        data: payout
      }
    ]
  }
}

onMounted(() => {
  fetchStatisticsApi()
})
</script>

<template>
  <div>
    <PanelGroup :totalData="statisData?.dayTotalData" />

    <ElRow :gutter="20" justify="space-between">
      <ElCol :span="10">
        <div class="bg-#fff">
          <!-- @vue-ignore -->
          <Echart key="payoutChart" :options="payoutBarOptions" />
        </div>
      </ElCol>
      <ElCol :span="14">
        <div class="bg-#fff">
          <!-- @vue-ignore -->
          <Echart :options="currentLineoptions" />
        </div>
      </ElCol>
    </ElRow>
  </div>
</template>
