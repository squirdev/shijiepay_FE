import { EChartsOption } from 'echarts'
import { useI18n } from '@/hooks/web/useI18n'

const { t } = useI18n()

export const lineOptions: EChartsOption = {
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    top: 20,
    data: ['代收订单量', '代付订单量']
  },
  calculable: true,
  xAxis: [
    {
      type: 'category',
      // prettier-ignore
      data: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
    }
  ],
  yAxis: [
    {
      type: 'value'
    }
  ],
  series: [
    {
      name: '代收订单量',
      type: 'bar',
      data: [2, 5, 7, 23, 25, 76, 135],
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
      data: [3, 6, 9, 26, 28, 70, 175]
    }
  ]
}

export const barOptions: EChartsOption = {
  tooltip: {
    formatter: '{a} <br/>{b} : {c}%'
  },
  series: [
    {
      name: '成功率',
      type: 'gauge',
      progress: {
        show: true
      },
      detail: {
        valueAnimation: true,
        formatter: '{value}'
      },
      data: [
        {
          value: 80,
          name: '代付成功率'
        }
      ]
    }
  ]
}
