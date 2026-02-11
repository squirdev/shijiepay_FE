import request from '@/axios'

export const getTunnelApi = (params: any) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/tunnle',
    params
  })
}

export const createTunnelApi = (data: any) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/tunnle',
    data
  })
}

export const deleteTunnelApi = (uuid: string) => {
  const data = { action: 'del' }
  data['data_uuid'] = uuid
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/tunnle',
    data
  })
}

export const updateTunnelApi = (data: any) => {
  data['action'] = 'update_statu'
  data['data_uuid'] = data.uuid
  data.tunnel_statu = !data.tunnel_statu
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/tunnle',
    data
  })
}

export const getTunnelRateApi = (params: any) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/tunnelRate',
    params
  })
}

export const tunnelRateApi = (data: any) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/tunnelRate',
    data
  })
}

/* -------------------- Payment Channel ----------------------*/

export const getPaymentChannelInfoApi = (uuid: any) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/channel/payout/Info/' + uuid
  })
}

export const updatePaymentChannelStatusApi = (muid: any, code: string) => {
  const data = {}
  data['action'] = 'update_channel_bank_statu'
  data['bank_code'] = code
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/channel/payout/Info/' + muid,
    data
  })
}

export const updatePaymentChannelCodeApi = (muid: any, data: any) => {
  data['action'] = 'update_channel_bank_code'
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/channel/payout/Info/' + muid,
    data
  })
}

export const getPayModules = (data: any) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/getConst/getPayModules',
    data
  })
}

export const getTripartListApi = (params: any) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/channel/threeParty',
    params
  })
}

export const createTripartApi = (data: any) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/channel/threeParty',
    data
  })
}

export const updateTripartBalanceApi = (data: any) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/channel/threeParty',
    data
  })
}

export const getThreePartyChannel = (data: any) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/channel/threeParty',
    data
  })
}

export const deleteTripartApi = (uuid: any) => {
  const data: any = {}
  data['data_uuid'] = uuid[0]
  data['action'] = 'del'
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/channel/threeParty',
    data
  })
}

export const getTripartAPIList = (params: any) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/threeParty/apis',
    params
  })
}

export const createTripartAPI = (data: any) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/threeParty/apis',
    data
  })
}

export const deleteTripartAPI = (uuid: any) => {
  const data: any = {}
  data['data_uuid'] = uuid[0]
  data['action'] = 'del'
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/threeParty/apis',
    data
  })
}

export const updateTripartAPIStatus = (data: any) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/threeParty/apis',
    data
  })
}

export const getTripartAPIInfo = (uuid: any) => {
  const data = {
    action: 'getApiConfig'
  }
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/threeParty/apis/' + uuid,
    data
  })
}

export const updateTripartAPIInfo = (uuid: string, data: any) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/threeParty/apis/' + uuid,
    data
  })
}

export const getEncryptTypesApi = (data: any) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/getConst/getEncryptTypes',
    data
  })
}

export const getPaymentChannelApi = (params: any) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/channel/payout',
    params
  })
}

export const addPaymentChannelApi = (data: any) => {
  data['action'] = 'add_channel_data'
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/channel/payout',
    data
  })
}

export const editPaymentChannelApi = (data: any) => {
  data['action'] = 'edit_channel_data'
  data['data_uuid'] = data['uuid']
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/channel/payout',
    data
  })
}

export const updatePayChannelStatusApi = (uuid: any) => {
  const data: any = {}
  data['data_uuid'] = uuid[0]
  data['action'] = 'update_statu'
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/channel/payout',
    data
  })
}

export const updatePayBalanceApi = (uuid: any) => {
  const data: any = {}
  data['data_uuid'] = uuid[0]
  data['action'] = 'getBalance'
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/channel/payout',
    data
  })
}

export const deletePaymentChannelApi = (uuid: any) => {
  const data: any = {}
  data['data_uuid'] = uuid[0]
  data['action'] = 'del'
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/channel/payout',
    data
  })
}

/* --------------- Collection channel ----------------- */
export const getCollectionChannelApi = (params: any) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/channel/trade',
    params
  })
}

export const collectionChannelApi = (data) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/channel/trade',
    data
  })
}

export const addCollectionChannelApi = (data: any) => {
  data['action'] = 'add_channel_data'
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/channel/trade',
    data
  })
}

export const editCollectionChannelApi = (data: any) => {
  data['action'] = 'edit_channel_data'
  data['data_uuid'] = data['uuid']
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/channel/trade',
    data
  })
}

export const updateColChannelStatusApi = (uuid: any) => {
  const data: any = {}
  data['data_uuid'] = uuid[0]
  data['action'] = 'update_statu'
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/channel/trade',
    data
  })
}

export const updateColBalanceApi = (uuid: any) => {
  const data: any = {}
  data['data_uuid'] = uuid[0]
  data['action'] = 'getBalance'
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/channel/trade',
    data
  })
}

export const deleteCollectionChannelApi = (uuid: any) => {
  const data: any = {}
  data['data_uuid'] = uuid[0]
  data['action'] = 'del'
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/channel/trade',
    data
  })
}

export const getInfomationApi = (uuid: any) => {
  const data: any = {}
  data['data_uuid'] = uuid[0]
  data['action'] = 'edit_channel_data'
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/channel/trade',
    data
  })
}

export const getCollectionChannelInfoApi = (uuid: any) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/channel/trade/Info/' + uuid
  })
}

export const updateCollectionTunStatusApi = (muid: any, uuid: string) => {
  const data = {}
  data['action'] = 'update_tunble_statu'
  data['data_uuid'] = uuid
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/channel/trade/Info/' + muid,
    data
  })
}

export const updateCollectionRateApi = (muid: any, data: any) => {
  data['action'] = 'update_tunnleInfo'
  data['data_uuid'] = data.uuid
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/channel/trade/Info/' + muid,
    data
  })
}

export const testOrderApi = (muid: any, data: any) => {
  data['action'] = 'test_create_order'
  data['data_uuid'] = data.uuid
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/channel/trade/Info/' + muid,
    data
  })
}

export const updateCollectionBankStatusApi = (muid: any, code: string) => {
  const data = {}
  data['action'] = 'update_channel_bank_statu'
  data['bank_code'] = code
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/channel/trade/Info/' + muid,
    data
  })
}

export const updateCollectionBankCodeApi = (muid: any, data: any) => {
  data['action'] = 'update_channel_bank_code'
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/channel/trade/Info/' + muid,
    data
  })
}

export const getModuleCodeApi = () => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/channel/trade',
    data: {
      action: 'getPayModuleDatas'
    }
  })
}

export const getPaymentModuleCodeApi = () => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/channel/payout',
    data: {
      action: 'getPayModuleDatas'
    }
  })
}

export const getPayMethodApi = (uuid: string, key: string) => {
  const data: any = {}
  data['action'] = 'get_module_codes'
  data['module_code'] = key
  data['uuid'] = uuid
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/channel/trade',
    data
  })
}

export const getWalletManageList = (data) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/getConst/getWalletTypes',
    data
  })
}

export const getWalletManageApi = (params) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/walletManage',
    params
  })
}

export const walletManageApi = (data) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/walletManage',
    data
  })
}

export const getWalletTypeApi = (params) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/walletTypes',
    params
  })
}

export const walletTypeApi = (data) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/walletTypes',
    data
  })
}

export const getMchPayoutBankApi = (params) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/mchPayoutBank',
    params
  })
}

export const mchPayoutBankApi = (data) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/mchPayoutBank',
    data
  })
}
