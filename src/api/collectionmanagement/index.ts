import request from '@/axios'

export const getOrderListApi = (params: any) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/collectionOrder',
    params: params
  })
}

export const getTotalOrderApi = (params) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/collectionOrder',
    data: {
      action: 'totalData'
    },
    params
  })
}

export const collectionOrderApi = (data) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/collectionOrder',
    data
  })
}

export const getDropOrderListApi = (params: any) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/loseOrderList',
    params
  })
}

export const dropOrderListApi = (data: any) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/loseOrderList',
    data
  })
}

export const getCallbackRecordApi = (params: any) => {
  return request.get({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/payment/callbackLog',
    params
  })
}

// export const exportPayOrderApi = () => {
//     const formData = new FormData()
//     formData.append('data_uuid', '666')
//     formData.append('action', 'export_order')
//     return request.post({
//       url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/payment',
//       formData,
//       headers: {
//         'Content-Type': 'multipart/form-data' // Explicitly set Content-Type
//       }
//     })
// }

export const exportOrderListApi = (params) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/collectionOrder',
    data: {
      action: 'export_order'
    },
    params
  })
}

export const getThreePartyDatasApi = (data) => {
  return request.post({
    url: import.meta.env.VITE_BACKEND_API_ADDRESS + '/SJP4-padmin/getConst/getThreePartyDatas',
    data
  })
}
