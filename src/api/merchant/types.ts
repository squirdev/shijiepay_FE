export type ExportFileListType = {
  uuid: string
  exporter: string
  file_name: string
  path: string
  file_size: number
  total: number
  out_count: number
  statu: string
  create_time: Date
  note: string
}

export type BankCardType = {
  uuid: string
  bank_uid: string
  account: string
  account_username: string
  note: string
  create_time: Date
  availableBalance: number
  balance_amount: number
  native_balance_amount: number
}
