import request from '@/axios'

export const getMerchantListApi = (params: any) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/merchantList',
    params
  })
}

export const getCountryListApi = (data: any) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/getConst/country_datas',
    headers: {
      'Content-Type': 'application/json'
    },
    data
  })
}

export const addMerchantApi = (data: any) => {
  data['action'] = 'add_merchant_data'
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/merchantList',
    data
  })
}

export const editMerchantApi = (data: any) => {
  data['action'] = 'edit_merchant_data'
  data['data_uuid'] = data['uuid']
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/merchantList',
    data
  })
}

export const deleteMerchantApi = (uuid: any) => {
  const data: any = {}
  data['data_uuid'] = uuid[0]
  data['action'] = 'del'
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/merchantList',
    data
  })
}

export const clearLogTokenApi = (uuid: any) => {
  const data: any = {}
  data['data_uuid'] = uuid[0]
  data['action'] = 'clearLogToken'
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/merchantList',
    data
  })
}

export const getGoogleQrCodeApi = (uuid: any) => {
  const data: any = {}
  data['data_uuid'] = uuid[0]
  data['action'] = 'getGoogleQrcode'
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/merchantList',
    data
  })
}

export const updateGoogleCodeApi = (uuid: any) => {
  const data: any = {}
  data['data_uuid'] = uuid[0]
  data['action'] = 'updateGooglePwd'
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/merchantList',
    data
  })
}

export const updateSerkeyApi = (uuid: any) => {
  const data: any = {}
  data['data_uuid'] = uuid[0]
  data['action'] = 'updateSerkey'
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/merchantList',
    data
  })
}

export const getSerkeyApi = (data: any) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/merchantList',
    data
  })
}

export const updateMerchantStatusApi = (uuid: any) => {
  const data: any = {}
  data['data_uuid'] = uuid[0]
  data['action'] = 'update_statu'
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/merchantList',
    data
  })
}

export const internalFillingApi = (data: any) => {
  data['action'] = 'rechargeMoney'
  data['data_uuid'] = data['uuid']
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/merchantList',
    data
  })
}

export const deductionAmountApi = (data: any) => {
  data['action'] = 'reduceMoney'
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/merchantList',
    data
  })
}

export const getMerchantFundflowApi = (uuid: any, params: any) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/merchant/fundflow/' + uuid,
    params
  })
}

export const exportMerchantFundflowApi = (uuid: any, params: any) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/merchant/fundflow/' + uuid,
    data: {
      action: 'export_order'
    },
    params
  })
}

export const getMerchantDetailApi = (uuid: any) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/merchant/Info/' + uuid
  })
}

export const updateChannelStatusApi = (uuid: any, id: any) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/merchant/Info/' + uuid,
    data: {
      data_uuid: id,
      action: 'update_tunble_statu'
    }
  })
}

export const updateChannelInfoApi = (uuid: any, data: any) => {
  data['action'] = 'update_tunnleInfo'
  data['data_uuid'] = data.uuid
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/merchant/Info/' + uuid,
    data
  })
}

export const getMerchantClassificationApi = (params: any) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/merchantClassify',
    params
  })
}

export const addMerchantClassificationApi = (data: any) => {
  data['action'] = 'add_classify_data'
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/merchantClassify',
    data
  })
}

export const editMerchantClassificationApi = (data: any) => {
  data['action'] = 'editChannelInfo'
  data['data_uuid'] = data['uuid']
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/merchantClassify',
    data
  })
}

export const deleteMerchantClassificationApi = (uuid: any) => {
  const data: any = {}
  data['data_uuid'] = uuid[0]
  data['action'] = 'delClassify'
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/merchantClassify',
    data
  })
}

export const merchantClassificationApi = (data) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/merchantClassify',
    data
  })
}

export const getChannelInfoApi = (uuid: string, data: any) => {
  return request.post({
    url:
      import.meta.env.VITE_BACKEND_API_ADDRESS +
      '/SJP4-padmin/merchantClassify/channelInfo/' +
      uuid,
    data
  })
}

export const updateStatusChannelApi = (id: any, uuid: any) => {
  const data: any = {}
  data['action'] = 'update_tynnel_statu'
  data['data_uuid'] = uuid
  return request.post({
    url:
      import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/merchantClassify/channelInfo/' + id,
    data
  })
}

export const editChannelInfoApi = (id: any, uuid: any, value: any) => {
  const data: any = { ...value }
  data['action'] = 'edit_channelInfo'
  data['data_uuid'] = uuid
  return request.post({
    url:
      import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/merchantClassify/channelInfo/' + id,
    data
  })
}

export const getInternalListStatisticsApi = (params) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/rechargeMoney',
    data: {
      action: 'getTotalData'
    },
    params
  })
}

export const getInternalListApi = (params: any) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/rechargeMoney',
    params
  })
}

export const getDeductionListStatisticsApi = (params) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/reduceMoney',
    data: {
      action: 'getTotalData'
    },
    params
  })
}

export const getDeductionListApi = (params: any) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/reduceMoney',
    params
  })
}

export const getWithdrawalListApi = (params: any) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/withdrawList',
    params
  })
}

export const getWithdrawalStatisticsApi = (params) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/withdrawList',
    data: {
      action: 'getTotalData'
    },
    params
  })
}

export const withdrawApi = (data) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/withdrawList',
    data
  })
}

export const getWithdrawalApi = (params: any) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/rechargeMoney',
    params
  })
}

export const getMerchantSubListApi = (id: string, params: any) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/merchantSubList/' + id,
    params
  })
}

export const merchantSubListApi = (id: string, data: any) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/merchantSubList/' + id,
    data
  })
}

export const getMerchantRoleApi = (uuid, params) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/merchantRole/' + uuid,
    params
  })
}

export const merchantRoleApi = (uuid, data) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/merchantRole/' + uuid,
    data
  })
}

export const getMchPermissions = (data) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/getConst/getMchPermissions',
    data
  })
}

// 商户日志
export const getMerchantLogApi = (params: any) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/merchantLog',
    params
  })
}
