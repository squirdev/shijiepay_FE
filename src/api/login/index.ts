import request from '@/axios'
import type { UserType } from './types'
import router from '@/router'
interface RoleParams {
  roleName: string
}

export const loginApi = (data) => {
  console.log(data)
  data['action'] = 'pwdLogin'
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/login',
    data
  })
}

export const loginVerifyApi = (data) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/login',
    data
  })
}

export const merchantLoginApi = (data: UserType, id: any): Promise<IResponse<UserType>> => {
  console.log(data)
  data['action'] = 'pwdLogin'
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + `/pay4Mch/login/${id}`,
    data
  })
}

export const refreshTokenApi = (token: string): Promise<IResponse<UserType>> => {
  // console.log(token)
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/token/refresh'
  })
}

export const refreshMerTokenApi = (token: string): Promise<IResponse<UserType>> => {
  // console.log(token)
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/pay4Mch/token/refresh'
  })
}

export const loginOutApi = () => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/login_out'
  })
}

export const merLoginOutApi = () => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/pay4Mch/login_out'
  })
}

export const fetchUserApi = (data) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/userInfo/data',
    data
  })
}

export const getAdminRoleApi = (
  params: RoleParams
): Promise<IResponse<AppCustomRouteRecordRaw[]>> => {
  return request.get({ url: '/mock/role/list', params })
}

export const getTestRoleApi = (params: RoleParams): Promise<IResponse<string[]>> => {
  return request.get({ url: '/mock/role/list2', params })
}
