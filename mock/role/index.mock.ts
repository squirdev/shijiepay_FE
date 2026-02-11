import { SUCCESS_CODE } from '@/constants'

const timeout = 1000

const testList = [
  {
    path: '/',
    component: '#',
    redirect: '/pay4Mch/home',
    name: 'pay4MchRoot',
    meta: {
      hidden: true
    }
  },
  {
    path: '/pay4Mgr',
    component: '#',
    redirect: '/pay4Mch/home',
    name: 'pay4MchHomeRoot',
    meta: {
      hidden: true
    }
  },
  {
    path: '/pay4Mch/home',
    component: '#',
    redirect: '/pay4Mch/Home/Home',
    name: 'MerchantHome',
    meta: {},
    children: [
      {
        path: 'Home',
        component: 'views/Merchant/Home/Home',
        name: 'MerchantHomeDemo',
        meta: {
          title: 'router.home',
          icon: 'ant-design:home-outlined'
        }
      }
    ]
  },
  {
    path: '/pay4Mch/accountinformation',
    component: '#',
    redirect: '/pay4Mch',
    name: 'AccountInformation/AccountInformation',
    meta: {
      hidden: true
    },
    children: [
      {
        path: 'AccountInformation',
        component: 'views/Merchant/AccountInformation/AccountInformation',
        name: 'AccountInformation',
        meta: {
          title: 'router.accountinformation',
          icon: 'ant-design:solution-outlined'
        }
      }
    ]
  },
  {
    path: '/pay4Mch/bankcardinformation',
    component: '#',
    redirect: '/pay4Mch',
    name: 'BankCardInformation/BankCardInformation',
    meta: {},
    children: [
      {
        path: 'BankCardInformation',
        component: 'views/Merchant/BankCardInformation/BankCardInformation',
        name: 'BankCardInformation',
        meta: {
          title: 'router.bankcardinformation',
          icon: 'ant-design:credit-card-outlined'
        }
      }
    ]
  },
  {
    path: '/pay4Mch/collectionorder',
    component: '#',
    redirect: '/pay4Mch',
    name: 'CollectionOrder/CollectionOrder',
    meta: {},
    children: [
      {
        path: 'CollectionOrder',
        component: 'views/Merchant/CollectionOrder/CollectionOrder',
        name: 'CollectionOrder',
        meta: {
          title: 'router.collectionorder',
          icon: 'ant-design:money-collect-outlined'
        }
      }
    ]
  },
  {
    path: '/pay4Mch/paymentorder',
    component: '#',
    redirect: '/pay4Mch',
    name: 'PaymentOrder/PaymentOrder',
    meta: {},
    children: [
      {
        path: 'PaymentOrder',
        component: 'views/Merchant/PaymentOrder/PaymentOrder',
        name: 'MerchantPaymentOrder',
        meta: {
          title: 'router.paymentorder',
          icon: 'ant-design:property-safety-outlined'
        }
      }
    ]
  },
  {
    path: '/pay4Mch/CashFlow',
    component: '#',
    redirect: '/pay4Mch',
    name: 'CashFlow/CashFlow',
    meta: {},
    children: [
      {
        path: 'CashFlow',
        component: 'views/Merchant/CashFlow/CashFlow',
        name: 'MerchantCashFlow',
        meta: {
          title: 'router.cashflow',
          icon: 'ant-design:bar-chart-outlined'
        }
      }
    ]
  },
  {
    path: '/pay4Mch/merchantreport',
    component: '#',
    redirect: '/pay4Mch',
    name: 'MerchantReport/MerchantReport',
    meta: {},
    children: [
      {
        path: 'merMerchantReport',
        component: 'views/Merchant/MerchantReport/MerchantReport',
        name: 'merMerchantReport',
        meta: {
          title: 'router.merchantreport',
          icon: 'ant-design:pay-circle-outlined'
        }
      }
    ]
  },
  {
    path: '/pay4Mch/settlementrecords',
    component: '#',
    redirect: '/pay4Mch',
    name: 'SettlementRecords/SettlementRecords',
    meta: {},
    children: [
      {
        path: 'SettlementRecords',
        component: 'views/Merchant/SettlementRecords/SettlementRecords',
        name: 'SettlementRecords',
        meta: {
          title: 'router.settlementrecords',
          icon: 'ant-design:money-collect-filled'
        }
      }
    ]
  },
  {
    path: '/pay4Mch/downloadfile',
    component: '#',
    redirect: '/pay4Mch',
    name: 'DownloadFile/DownloadFile',
    meta: {},
    children: [
      {
        path: 'DownloadFile',
        component: 'views/Merchant/DownloadFile/DownloadFile',
        name: 'DownloadFile',
        meta: {
          title: 'router.downloadfile',
          icon: 'ant-design:file-protect-outlined'
        }
      }
    ]
  }
  // '/dashboard',
  // '/dashboard/analysis',
  // '/dashboard/workplace',
  // 'external-link',
  // 'https://element-plus-admin-doc.cn/',
  // '/guide',
  // '/guide/index',
  // '/components',
  // '/components/form',
  // '/components/form/default-form',
  // '/components/form/use-form',
  // '/components/form/ref-form',
  // '/components/table',
  // '/components/table/default-table',
  // '/components/table/use-table',
  // '/components/table/tree-table',
  // '/components/table/table-image-preview',
  // '/components/table/table-video-preview',
  // '/components/table/ref-table',
  // '/components/table/card-table',
  // '/components/editor-demo',
  // '/components/editor-demo/editor',
  // '/components/editor-demo/json-editor',
  // '/components/editor-demo/code-editor',
  // '/components/search',
  // '/components/descriptions',
  // '/components/image-viewer',
  // '/components/dialog',
  // '/components/icon',
  // '/components/iconPicker',
  // '/components/echart',
  // '/components/count-to',
  // '/components/qrcode',
  // '/components/highlight',
  // '/components/infotip',
  // '/components/input-password',
  // '/components/waterfall',
  // '/components/image-cropping',
  // '/components/video-player',
  // '/components/avatars',
  // '/components/i-agree',
  // 'function',
  // '/function/multiple-tabs',
  // '/function/multiple-tabs-demo/:id',
  // '/function/request',
  // '/function/test',
  // '/hooks',
  // '/hooks/useWatermark',
  // '/hooks/useTagsView',
  // '/hooks/useValidator',
  // '/hooks/useCrudSchemas',
  // '/hooks/useClipboard',
  // '/hooks/useNetwork',
  // '/level',
  // '/level/menu1',
  // '/level/menu1/menu1-1',
  // '/level/menu1/menu1-1/menu1-1-1',
  // '/level/menu1/menu1-2',
  // '/level/menu2',
  // '/example',
  // '/example/example-dialog',
  // '/example/example-page',
  // '/example/example-add',
  // '/example/example-edit',
  // '/example/example-detail',
  // '/authorization',
  // '/authorization/department',
  // '/authorization/user',
  // '/authorization/role',
  // '/authorization/menu',
  // '/error',
  // '/error/404-demo',
  // '/error/403-demo',
  // '/error/500-demo',
  // '/systemmanagement',
  // '/systemmanagement/log',
  // '/systemmanagement/configuration'
]

const List: any[] = []

export default [
  // 列表接口
  {
    url: '/mock/role/list2',
    method: 'get',
    timeout,
    response: () => {
      return {
        code: SUCCESS_CODE,
        data: testList
      }
    }
  }
]
