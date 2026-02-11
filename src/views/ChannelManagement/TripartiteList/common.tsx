import { reactive } from 'vue'
import { ElSwitch, ElInput, ElSelect } from 'element-plus'
import { CrudSchema } from '@/hooks/web/useCrudSchemas'
import { useI18n } from '@/hooks/web/useI18n'

const { t } = useI18n()

export const configRowSchemas = reactive<CrudSchema[]>([
  {
    field: 'tunnel_name',
    label: t('channelManagement.name') /* 名称 */,
    width: 120
  },
  {
    field: 'code',
    label: t('channelManagement.systemChannelCode') /* 系统通道编码 */,
    width: 120
  },
  {
    field: 'statu',
    label: t('merchantList.state'),
    width: 80,
    table: {
      slots: {
        default: (data: any) => {
          return <ElSwitch class="mx-4px" v-model={data.row.statu} />
        }
      }
    }
  },
  {
    field: 'rate',
    label: t('channelManagement.ratePercentage') /* 费率% */,
    width: 140,
    table: {
      slots: {
        default: (data: any) => {
          return <ElInput v-model={data.row.rate} type="number" />
        }
      }
    }
  },
  {
    field: 'mapping_param',
    label: t('channelManagement.mappingThirdPartyCode') /* 映射三方编码 */,
    width: 140,
    table: {
      slots: {
        default: (data: any) => {
          return <ElInput v-model={data.row.mapping_param} />
        }
      }
    }
  },
  {
    field: 'merchant_id',
    label: '商户',
    width: 140,
    table: {
      slots: {
        default: (data: any) => {
          return <ElSelect v-model={data.row.merchant_id} />
        }
      }
    }
  },
  {
    field: 'amount',
    label: '金额',
    width: 140,
    table: {
      slots: {
        default: (data: any) => {
          return <ElInput v-model={data.row.amount} />
        }
      }
    }
  },
  {
    field: 'order_id',
    label: '订单号',
    width: 140,
    table: {
      slots: {
        default: (data: any) => {
          return <ElInput v-model={data.row.order_id} />
        }
      }
    }
  },
  {
    field: 'mode',
    label: '通道模式',
    width: 140,
    table: {
      slots: {
        default: (data: any) => {
          return <ElSelect v-model={data.row.merchant_id} />
        }
      }
    }
  }
])

export const payConfigRowSchemas = reactive<CrudSchema[]>([
  {
    label: t('channelManagement.statusFieldJsonPath') /* 状态字段json获取路径 */,
    field: 'get_statu_field',
    form: {
      component: 'Input',
      colProps: {
        span: 24
      }
    }
  },
  {
    label: t('channelManagement.statusSuccessValue') /* 状态成功值 */,
    field: 'success_value',
    form: {
      component: 'Input',
      colProps: {
        span: 24
      }
    }
  },
  {
    label: t('channelManagement.statusFailureValue') /* 状态失败值 */,
    field: 'fail_value',
    form: {
      component: 'Input',
      colProps: {
        span: 24
      }
    }
  },
  {
    label: t('channelManagement.remark') /* 备注 */,
    field: 'msg_field',
    form: {
      component: 'Input',
      colProps: {
        span: 24
      }
    }
  },
  {
    label: t('channelManagement.payUrlJsonPath') /* 支付url json获取路径 */,
    field: 'pay_url',
    form: {
      component: 'Input',
      colProps: {
        span: 24
      }
    }
  }
])
