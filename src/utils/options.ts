export const callbackTypeOptions = [
  {
    label: '全部',
    value: ''
  },
  {
    label: '手动',
    value: 'manual'
  },
  {
    label: '自动',
    value: 'automatic'
  }
]

export const callbackStatuOptions = [
  {
    label: '全部',
    value: ''
  },
  {
    label: '成功',
    value: 'success'
  },
  {
    label: '失败',
    value: 'failed'
  },
  {
    label: '未回调',
    value: 'not_calledback'
  },
  {
    label: '回调中',
    value: 'progress'
  },
  {
    label: '超时未回调',
    value: 'TIME_OUT_NOT_CALLEDBACK'
  }
]

export const payStatuOptions = [
  {
    label: '全部',
    value: ''
  },
  {
    label: '已支付',
    value: 'ispay'
  },
  {
    label: '未支付',
    value: 'notpay'
  },
  {
    label: '支付超时',
    value: 'pay_timeout'
  },
  {
    label: '支付失败',
    value: 'pay_failed'
  },
  {
    label: '驳回支付',
    value: 'pay_reject'
  },
  {
    label: '支付中',
    value: 'paying'
  }
]

export const fundflowTypeOptions = [
  {
    label: '全部',
    value: ''
  },
  {
    label: '代收',
    value: 'income_order'
  },
  {
    label: '代付',
    value: 'pay_payout'
  },
  {
    label: '内充',
    value: 'recharge'
  },
  {
    label: '结算',
    value: 'settlement'
  },
  {
    label: '退回结算',
    value: 'gobackSettlEment'
  },
  {
    label: '减金额',
    value: 'reduce'
  },
  {
    label: '代收退回',
    value: 'incomeOrder_goback'
  },
  {
    label: '代付退回',
    value: 'payBehalf_goback'
  }
]

export const walletTypeOptions = [
  {
    label: '普通钱包',
    value: 'ordinary_wallet'
  },
  {
    label: '原生钱包',
    value: 'native_wallet'
  }
]

export const reviewStatusOptions = [
  {
    label: '未审核',
    value: 'military_core'
  },
  {
    label: '已审核',
    value: 'unknown_core'
  },
  {
    label: '已自动审核',
    value: 'autonomous_laboratory'
  }
]

export const browserReviewStatusOptions = [
  {
    label: '全部',
    value: ''
  },
  {
    label: '未审核',
    value: 'military_core'
  },
  {
    label: '已审核',
    value: 'unknown_core'
  },
  {
    label: '拒绝',
    value: 'reject'
  }
]

// 订单异常类型
export const orderAbnormalTypesOptions = [
  { label: '全部', value: '' },
  { label: '支付失败未退费', value: 'payout_zfsb_wt' },
  { label: '支付失败重复退费', value: 'payout_zfsb_ct' },
  { label: '未扣费', value: 'payout_wk' },
  { label: '重复扣费', value: 'payout_ck' },
  { label: '支付成功未添加金额', value: 'payment_wa' },
  { label: '支付成功重复添加金额', value: 'payment_ca' },
  { label: '支付失败添加金额', value: 'payment_sa' }
]

// 订单类型
export const orderTypesOptions = [
  { label: '全部', value: '' },
  { label: '代收', value: 'payment' },
  { label: '代付', value: 'payout' }
]
