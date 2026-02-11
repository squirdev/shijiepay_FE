export type MerchantListType = {
  _id: string
  uuid: string
  merchant_id: string
  merchant_name: string
  balance_amount: number
  freeze_amount: number
  account: string
  amount_max: number
  amount_min: number
  password: string
  current_login_time: Date
  current_login_ip: string
  last_login_time: Date
  last_login_ip: string
  agentadmin_uuid: string
  login_ip_whitelist: string
  logoUrl: string
  collect_money_switch: boolean
  paybehalf_switch: boolean
  paybehalf_max_money: number
  paybehalf_min_money: number
  google_key: string
  merchant_classify_uuid: string
  create_time: Date
  secret_key: string
  statu: boolean
  note: string
  country: string
}

export type MerchantClassificationType = {
  _id: string
  uuid: string
  classify_name: string
  note: string
}

export type MerchantClassificationChannelInfoType = {
  _id: string
  uuid: string
  classify_name: string
  tunnel_name: string
  tunnel_code: string
  tunnel_statu: boolean
  open_three_party: string
  note: string
  rate: number
}

export type InternalListType = {
  _id: string
  uuid: string
  operate_user_uuid: string
  merchant_id: string
  amount: number
  actual_amount: number
  repay_amount: number
  note: string
  agentadmin_uuid: string
  create_time: Date
}

export type DeductionListType = {
  _id: string
  uuid: string
  operate_user_uuid: string
  merchant_id: string
  amount: number
  note: string
  agentadmin_uuid: string
  create_time: Date
}

export type WithdrawListType = {
  _id: string
  uuid: string
  merchant_uuid: string
  amount: number
  actual_amount: number
  repay_amount: number
  statu: string
  bankcard_uuid: string
  admin_uuid: string
  dealwith_time: Date
  agentadmin_uuid: string
  payee_bank: string
  payee_bankcard: string
  payee_username: string
  payqrcode_url: string
  create_time: Date
}
