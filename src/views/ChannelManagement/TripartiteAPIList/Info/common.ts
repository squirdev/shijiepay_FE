export const paymentList = [
  {
    id: (Math.random() * 100000).toFixed(3),
    label: '上游分配ID',
    sys_fields: 'mch_id',
    api_field: '',
    field_type: 'string',
    is_encrypt: false,
    value: ''
  },
  {
    id: (Math.random() * 100000).toFixed(3),
    label: '订单金额',
    sys_fields: 'amount',
    api_field: '',
    field_type: 'string',
    is_encrypt: false,
    value: ''
  },
  {
    id: (Math.random() * 100000).toFixed(3),
    label: '收款类型',
    sys_fields: 'pay_type',
    api_field: '',
    field_type: 'string',
    is_encrypt: false,
    value: ''
  },
  {
    id: (Math.random() * 100000).toFixed(3),
    label: '系统单号',
    sys_fields: 'mch_order_id',
    api_field: '',
    field_type: 'string',
    is_encrypt: false,
    value: ''
  },
  {
    id: (Math.random() * 100000).toFixed(3),
    label: '回调地址',
    sys_fields: 'notifyurl',
    api_field: '',
    field_type: 'string',
    is_encrypt: false,
    value: ''
  },
  {
    id: (Math.random() * 100000).toFixed(3),
    label: '支付成功后跳转到该页面',
    sys_fields: 'callbackurl',
    api_field: '',
    field_type: 'string',
    is_encrypt: false,
    value: ''
  },
  {
    id: (Math.random() * 100000).toFixed(3),
    label: '签名',
    sys_fields: 'sign',
    api_field: '',
    field_type: 'string',
    is_encrypt: false,
    value: ''
  }
]

export const payoutList = [
  {
    id: (Math.random() * 100000).toFixed(3),
    label: '上游分配ID',
    sys_fields: 'mch_id',
    api_field: '',
    field_type: 'string',
    is_encrypt: false,
    value: ''
  },
  {
    id: (Math.random() * 100000).toFixed(3),
    label: '系统单号',
    sys_fields: 'mch_order_id',
    api_field: '',
    field_type: 'string',
    is_encrypt: false,
    value: ''
  },
  {
    id: (Math.random() * 100000).toFixed(3),
    label: '银行类型',
    sys_fields: 'back_code',
    api_field: '',
    field_type: 'string',
    is_encrypt: false,
    value: ''
  },
  {
    id: (Math.random() * 100000).toFixed(3),
    label: '收款人姓名',
    sys_fields: 'bank_owner',
    api_field: '',
    field_type: 'string',
    is_encrypt: false,
    value: ''
  },
  {
    id: (Math.random() * 100000).toFixed(3),
    label: '收款账号',
    sys_fields: 'account_number',
    api_field: '',
    field_type: 'string',
    is_encrypt: false,
    value: ''
  },
  {
    id: (Math.random() * 100000).toFixed(3),
    label: '订单金额',
    sys_fields: 'amount',
    api_field: '',
    field_type: 'string',
    is_encrypt: false,
    value: ''
  },
  {
    id: (Math.random() * 100000).toFixed(3),
    label: '回调地址',
    sys_fields: 'notifyurl',
    api_field: '',
    field_type: 'string',
    is_encrypt: false,
    value: ''
  },
  {
    id: (Math.random() * 100000).toFixed(3),
    label: '签名',
    sys_fields: 'sign',
    api_field: '',
    field_type: 'string',
    is_encrypt: false,
    value: ''
  }
]

export const paymentCheckOrderList = [
  {
    id: (Math.random() * 100000).toFixed(3),
    label: '上游分配ID',
    sys_fields: 'mch_id',
    api_field: '',
    field_type: 'string',
    is_encrypt: false,
    value: ''
  },
  {
    id: (Math.random() * 100000).toFixed(3),
    label: '系统单号',
    sys_fields: 'mch_order_id',
    api_field: '',
    field_type: 'string',
    is_encrypt: false,
    value: ''
  },
  {
    id: (Math.random() * 100000).toFixed(3),
    label: '签名',
    sys_fields: 'sign',
    api_field: '',
    field_type: 'string',
    is_encrypt: false,
    value: ''
  }
]

export const payoutCheckOrderList = [
  {
    id: (Math.random() * 100000).toFixed(3),
    label: '上游分配ID',
    sys_fields: 'mch_id',
    api_field: '',
    field_type: 'string',
    is_encrypt: false,
    value: ''
  },
  {
    id: (Math.random() * 100000).toFixed(3),
    label: '系统单号',
    sys_fields: 'mch_order_id',
    api_field: '',
    field_type: 'string',
    is_encrypt: false,
    value: ''
  },
  {
    id: (Math.random() * 100000).toFixed(3),
    label: '签名',
    sys_fields: 'sign',
    api_field: '',
    field_type: 'string',
    is_encrypt: false,
    value: ''
  }
]

export const get_balanceList = [
  {
    id: (Math.random() * 100000).toFixed(3),
    label: '上游分配ID',
    sys_fields: 'mch_id',
    api_field: '',
    field_type: 'string',
    is_encrypt: false,
    value: ''
  }
]

export const defalutBaseModelValue = {
  api_url: '',
  request_method: '',
  encrypt_type: '',
  is_null_value_encrypt: ''
}
export const defaultResModelValue = {
  get_statu_field: '',
  success_value: '',
  fail_value: '',
  msg_field: '',
  pay_url: ''
}

export const paymentResFormItemList = [
  {
    label: '状态字段json获取路径',
    prop: 'get_statu_field'
  },
  {
    label: '状态成功值',
    prop: 'success_value'
  },
  {
    label: '状态失败值',
    prop: 'fail_value'
  },
  {
    label: '备注',
    prop: 'msg_field'
  },
  {
    label: '支付url json获取路径',
    prop: 'pay_url'
  }
]

export const payoutResFormItemList = [
  {
    label: '状态字段json获取路径',
    prop: 'get_statu_field'
  },
  {
    label: '状态成功值',
    prop: 'success_value'
  },
  {
    label: '状态失败值',
    prop: 'fail_value'
  },
  {
    label: '备注',
    prop: 'msg_field'
  }
]

export const paymentCheckResFormItemList = [
  {
    label: '状态字段json获取路径',
    prop: 'get_statu_field'
  },
  {
    label: '状态成功值',
    prop: 'success_value'
  },
  {
    label: '状态失败值',
    prop: 'fail_value'
  },
  {
    label: '备注',
    prop: 'msg_field'
  }
]

export const payoutCheckResFormItemList = [
  {
    label: '状态字段json获取路径',
    prop: 'get_statu_field'
  },
  {
    label: '状态成功值',
    prop: 'success_value'
  },
  {
    label: '状态失败值',
    prop: 'fail_value'
  },
  {
    label: '备注',
    prop: 'msg_field'
  }
]

export const get_balanceResFormItemList = [
  {
    label: '状态字段json获取路径',
    prop: 'get_statu_field'
  },
  {
    label: '状态成功值',
    prop: 'success_value'
  },
  {
    label: '状态失败值',
    prop: 'fail_value'
  },
  {
    label: '备注',
    prop: 'msg_field'
  },
  {
    label: '余额字段 json获取路径',
    prop: 'balance_amount_field'
  }
]

export const defaultHeaderModelValue = [
  {
    id: (Math.random() * 100000).toFixed(3),
    field: '',
    value: ''
  }
]

export const defalutDynamicModelValue = [
  {
    id: (Math.random() * 100000).toFixed(3),
    key: '',
    field_type: 'string',
    is_encrypt: false,
    value: ''
  }
]

export const getDefaultFixedModelValue = (type: string) => {
  switch (type) {
    case 'payment':
      return paymentList
    case 'payout':
      return payoutList
    case 'payment_check_order':
      return paymentCheckOrderList
    case 'payout_check_order':
      return payoutCheckOrderList
    case 'get_balance':
      return get_balanceList
    default:
      return paymentList
  }
}

export const getProcessFixedModelValue = (type: string, list: any[]) => {
  let currentFixedList
  switch (type) {
    case 'payment':
      currentFixedList = paymentList
      break
    case 'payout':
      currentFixedList = payoutList
      break
    case 'payment_check_order':
      currentFixedList = paymentCheckOrderList
      break
    case 'payout_check_order':
      currentFixedList = payoutCheckOrderList
      break
    case 'get_balance':
      currentFixedList = get_balanceList
      break
    default:
      currentFixedList = paymentList
      break
  }
  const newList = list.map((item) => {
    const label = currentFixedList.find((l) => l.sys_fields === item.sys_fields)?.label ?? ''
    return { ...item, label }
  })
  return newList
}

export const getFormItemList = (type: string) => {
  switch (type) {
    case 'payment':
      return paymentResFormItemList
    case 'payout':
      return payoutResFormItemList
    case 'payment_check_order':
      return paymentCheckResFormItemList
    case 'payout_check_order':
      return payoutCheckResFormItemList
    case 'get_balance':
      return get_balanceResFormItemList
    default:
      return paymentList
  }
}
