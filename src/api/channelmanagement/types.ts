export type PaymentChannelType = {
  _id: string
  uuid: string
  amount_max: number
  amount_min: number
  callback_ip: string
  channel_name: string
  create_time: Date
  daily_limit_count: number
  balance_amount: number
  mer_account: string
  mer_id: string
  mer_password: string
  module_code: string
  payout_rate: number
  public_key: string
  secret_key: string
  statu: boolean
  note: string
}

export type moduleCodeOptionType = {
  value: string
  label: string
  supportedChannels: Array<{ name: string; code: string; checked: boolean }>
}

export type CollectionChannelType = {
  _id: string
  uuid: string
  select_tunnel_codes: string
  amount_max: number
  amount_min: number
  callback_ip: string
  channel_name: string
  create_time: Date
  daily_limit_count: number
  mer_account: string
  mer_id: string
  mer_password: string
  module_code: string
  public_key: string
  secret_key: string
  statu: boolean
  note: string
}

export type TunnelType = {
  _id: string
  code: string
  create_time: string
  currency_name: string
  tunnel_name: string
  tunnel_statu: boolean
  uuid: string
  country?: string
}
