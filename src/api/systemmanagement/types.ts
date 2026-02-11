export type UserType = {
  _id: string
  account: string
  password: string
  username: string
  status: boolean
  permission: string
  _current_login: string
  is_activate: boolean
  role_code: string
  uuid: string
  create_time: Date
  id: number
  current_login_ip: string
  current_login_time: string
  last_login_ip: string
  last_login_time: Date
  session_token: string
}

export type UserRole = {
  _id: string
  uuid: string
  name: string
  note: string
  create_time: Date
  role_code: string
  permissions: string[]
}

export type OperationLog = {
  ip: string
  method: string
  note: string
  state_code: number
  url_path: string
  user_uuid: string
  uuid: string
  _id: string
}

export type ExportFileListType = {
  uuid: string
  exporter: string
  filename: string
  path: string
  file_size: number
  total: number
  out_count: number
  statu: string
  create_time: Date
  note: string
}
