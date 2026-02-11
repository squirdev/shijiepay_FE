export type SystemAPILog = {
  _id: string
  _request_method: string
  url_path: string
  ip: string
  request_data: string
  response_code: number
  response_text: number
  api_name: string
  uuid: string
  create_time: Date
}

export type ChannelAPILog = {
  _id: string
  _request_method: string
  url_path: string
  ip: string
  request_data: string
  response_code: number
  response_text: number
  api_name: string
  uuid: string
  create_time: Date
}
