import request from '@/axios'

export const getMchStatisticsApi = (data) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/pay4Mch/mchTotalData',
    data
  })
}

export const getBankDatasApi = () => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/pay4Mch/dataRqe/getBankDatas'
  })
}

export const getBankCardsApi = (params: any) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/pay4Mch/merchantBankCard',
    params
  })
}

export const addBankCardApi = (data: any) => {
  data['action'] = 'add_bankcard'
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/pay4Mch/merchantBankCard',
    data
  })
}

export const editBankCardApi = (data: any) => {
  data['action'] = 'edit_bankcard'
  data['data_uuid'] = data['uuid']
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/pay4Mch/merchantBankCard',
    data
  })
}

export const deleteBankCardApi = (uuid: any) => {
  const data: any = {}
  data['action'] = 'del'
  data['data_uuid'] = uuid[0]
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/pay4Mch/merchantBankCard',
    data
  })
}

export const bankCarkApi = (data) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/pay4Mch/merchantBankCard',
    data
  })
}

export const getCollectionOrderApi = (params: any) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/pay4Mch/payOrder',
    params
  })
}

export const exportCollectionOrderApi = (params) => {
  const data = { action: 'export_order' }
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/pay4Mch/payOrder',
    data,
    params
  })
}

export const getTotalCollectionOrderApi = (params) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/pay4Mch/payOrder',
    data: { action: 'getTotalData' },
    params
  })
}

export const getPaymentOrderApi = (params: any) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/pay4Mch/merPayout',
    params
  })
}

export const exportPaymentOrderApi = (params) => {
  const data = { action: 'export_order' }
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/pay4Mch/merPayout',
    data,
    params
  })
}

export const getTotalPaymentOrderApi = (params) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/pay4Mch/merPayout',
    data: { action: 'getTotalData' },
    params
  })
}

export const getDownloadFileApi = (params: any) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/pay4Mch/fileDownload',
    params
  })
}

export const deleteDownloadFileApi = (uuid: any) => {
  const data: any = {}
  data['action'] = 'del'
  data['data_uuid'] = uuid[0]
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/pay4Mch/fileDownload',
    data
  })
}

export const getFundflowApi = (params: any) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/pay4Mch/merFundflow',
    params
  })
}

export const exportFundflowApi = (params) => {
  const data = { action: 'export_order' }
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/pay4Mch/merFundflow',
    data,
    params
  })
}

export const getAvailableBalanceApi = () => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/pay4Mch/mchUser'
  })
}

export const getReportApi = (data: any) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/pay4Mch/merFormTotal',
    data
  })
}

export const getSettlementApi = (params: any) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/pay4Mch/withdrawApply',
    params
  })
}

export const merchantUserApi = (data) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/pay4Mch/mchUser',
    data
  })
}

export const channelDataApi = (data) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/pay4Mch/mchTotalData',
    data
  })
}

export const getWalletManageList = (data) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/pay4Mch/dataRqe/getMchWalletDatas',
    data
  })
}

export const getSubMerchantList = (params) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/pay4Mch/subMerchantList',
    params
  })
}

export const fetchSubMerchant = (data) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/pay4Mch/subMerchantList',
    data
  })
}

export const getRoleListApi = (params: any) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/pay4Mch/mchRole',
    params
  })
}

export const roleListApi = (data: any) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/pay4Mch/mchRole',
    data
  })
}

export const permissionListApi = (data: any) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/pay4Mch/mchConst',
    data
  })
}

export const getConstRoleList = (data: any) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/pay4Mch/mchConst',
    data
  })
}
