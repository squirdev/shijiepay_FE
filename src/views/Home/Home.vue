<script setup lang="ts">
import PanelGroup from './components/PanelGroup.vue'
import { Breadcrumb } from '@/components/Breadcrumb'
import { barOptions, lineOptions } from './echarts-data'
import { ContentWrap } from '@/components/ContentWrap'
import { ElRow, ElCol } from 'element-plus'
import { Echart } from '@/components/Echart'
import { ref, onMounted } from 'vue'
import { getStatisticsApi } from '@/api/dashboard/analysis'
import { EChartsOption } from 'echarts'
import { useI18n } from '@/hooks/web/useI18n'
import { Decimal } from 'decimal.js'

const { t } = useI18n()

const loading = ref(true)
const payoutBarOptions = ref<EChartsOption>({ ...barOptions })
const currentLineoptions = ref<EChartsOption>({ ...lineOptions })

const totalState = ref({
  total_balance_amount: 0,
  DavPaymentOrderCount: 0,
  day_ds_actual_amount: 0,
  day_df_actual_amount: 0,
  payment_success_rate: 0,
  zt_datas: {}
})

const fetchStatisticsApi = async () => {
  try {
    const res = await getStatisticsApi({ action: 'indexTotalData' })
    res.data.total_balance_amount = new Decimal(res.data.balance_amount || 0)
      .add(res.data.native_balance_amount || 0)
      .toNumber()
    totalState.value = res.data
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
      value: totalState.value.payment_success_rate ?? 0,
      name: '代收成功率'
    }
  ]

  const xAxisData: string[] = []
  const payment: number[] = []
  const payout: number[] = []

  for (const [key, value] of Object.entries(totalState.value?.zt_datas ?? {})) {
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
        data: Object.keys(totalState.value?.zt_datas ?? {})
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
  <PanelGroup :loading="loading" :totalState="totalState" />
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
</template>
