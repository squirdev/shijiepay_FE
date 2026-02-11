import request from '@/axios'

export const getUserListApi = (params: any) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/userList',
    params
  })
}

export const addUserApi = (data: any) => {
  data['action'] = 'add_user_data'
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/userList',
    data
  })
}

export const updateUserApi = (data: any) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/userList',
    data
  })
}

export const delUserApi = (uuid: any) => {
  const data: any = {}
  data['action'] = 'del_user_data'
  data['data_uuid'] = uuid[0]
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/userList',
    data
  })
}

export const updateUserStateApi = (uuid: any) => {
  const data: any = {}
  data['action'] = 'update_statu'
  data['data_uuid'] = uuid[0]
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/userList',
    data
  })
}

export const getGoogleQrCodeApi = (uuid: any) => {
  const data: any = {}
  data['action'] = 'getGoogleQrcode'
  data['data_uuid'] = uuid[0]
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/userList',
    data
  })
}

export const updateGoogleCodeApi = (uuid: any) => {
  const data: any = {}
  data['action'] = 'updateGooglePwd'
  data['data_uuid'] = uuid[0]
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/userList',
    data
  })
}

/*-------------------Role List--------------------*/

export const getRoleListApi = (params: any) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/roleList',
    params
  })
}

export const addRoleApi = (data: any) => {
  data['action'] = 'add_role_data'
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/roleList',
    data
  })
}

export const editRoleApi = (data: any) => {
  data['action'] = 'edit_role_data'
  data['data_uuid'] = data['uuid']
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/roleList',
    data
  })
}

export const deleteRoleApi = (uuid: any) => {
  const data: any = {}
  data['data_uuid'] = uuid[0]
  data['action'] = 'del'
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/roleList',
    data
  })
}

/*-------------------Operation Log--------------------*/
export const getOperationLogApi = (params: any) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/systemLog',
    params
  })
}

export const getFileListApi = (params: any) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/exportFiles',
    params
  })
}

export const deleteFileApi = (uuid: any) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/exportFiles',
    data: {
      data_uuid: uuid[0],
      action: 'del'
    }
  })
}

export const downloadFileApi = (path: any) => {
  return request.get(import.meta.env.VITE_BACKEND_API_ADDRESS + path)
}

export const getSettingApi = () => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/setting',
    data: {
      action: 'getSystemConfig'
    }
  })
}

export const uploadImageApi = (file) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/getConst/upload',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: {
      action: 'uploadImage',
      file
    }
  })
}

export const updateSettingApi = (data: any) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/setting',
    data
  })
}

export const editPermissionApi = (data: any) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/roleList',
    data
  })
}

export const permissionListApi = (data: any) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/getConst/getPermissions',
    data
  })
}

export const getUserInfoApi = (data: any) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/getConst/getUserInfo',
    data
  })
}

export const IDNTestApi = (params: any) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/IDN/callback/test',
    params
  })
}

export const getMgrBrowserApi = (params: any) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/mgrBrowser',
    params
  })
}

export const mgrBrowserApi = (data: any) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/mgrBrowser',
    data
  })
}
