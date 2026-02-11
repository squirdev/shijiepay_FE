import { Layout } from '@/utils/routerHelper'

export const merchantList = [
  {
    path: '/',
    component: '#',
    redirect: '/home',
    name: 'pay4MchRoot',
    meta: {
      hidden: true
    }
  },
  {
    path: '/home',
    component: '#',
    redirect: '/Home/Home',
    name: 'MerchantHome',
    meta: {},
    children: [
      {
        path: 'Home',
        component: 'views/Merchant/Home/Home',
        name: 'MerchantHomeDemo',
        meta: {
          title: 'router.home',
          icon: 'ant-design:home-outlined',
          pagePermission: [
            {
              code: 'INDEX_TOTAL_NUMBER_SHOW',
              name: '主页'
            }
          ].map((l) => l.code)
        }
      }
    ]
  },
  {
    path: '/accountinformation',
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
    path: '/bankcardinformation',
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
          icon: 'ant-design:credit-card-outlined',
          pagePermission: [
            {
              code: 'merchantBankCard',
              name: '商户银行卡'
            }
          ].map((l) => l.code),
          permission: [
            { code: 'merchantBankCardAdd', name: '添加' },
            { code: 'merchantBankCardEdit', name: '编辑' },
            { code: 'merchantBankCardDel', name: '删除' }
          ].map((l) => l.code)
        }
      }
    ]
  },

  {
    path: '/collectionorder',
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
          icon: 'ant-design:money-collect-outlined',
          pagePermission: [
            {
              code: 'paymentOrder',
              name: '代收订单'
            }
          ].map((l) => l.code),
          permission: [
            { code: 'paymentTotal', name: '统计' },
            { code: 'paymentExport', name: '导出' }
          ].map((l) => l.code)
        }
      }
    ]
  },
  {
    path: '/paymentorder',
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
          icon: 'ant-design:property-safety-outlined',
          pagePermission: [{ code: 'payoutOrder', name: '代付订单' }].map((l) => l.code),
          permission: [
            { code: 'payoutTotal', name: '统计' },
            { code: 'payoutExport', name: '导出' }
          ].map((l) => l.code)
        }
      }
    ]
  },
  {
    path: '/CashFlow',
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
          icon: 'ant-design:bar-chart-outlined',
          pagePermission: [{ code: 'merFundflow', name: '资金流水' }].map((l) => l.code),
          permission: [{ code: 'merFundflowExport', name: '导出' }].map((l) => l.code)
        }
      }
    ]
  },
  {
    path: '/ChannelData',
    component: '#',
    redirect: '/pay4Mch',
    name: 'ChannelData/ChannelData',
    meta: {},
    children: [
      {
        path: 'ChannelData',
        component: 'views/Merchant/ChannelData/ChannelData',
        name: 'MerchantChannelData',
        meta: {
          title: '通道数据',
          icon: 'ant-design:merge-outlined'
        }
      }
    ]
  },
  {
    path: '/merchantreport',
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
          icon: 'ant-design:pay-circle-outlined',
          pagePermission: [{ code: 'merFormTotal', name: '商户报表' }].map((l) => l.code),
          permission: []
        }
      }
    ]
  },
  {
    path: '/settlementrecords',
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
          icon: 'ant-design:money-collect-filled',
          pagePermission: [{ code: 'Withdraw', name: '结算记录' }].map((l) => l.code),
          permission: [
            { code: 'WithdrawTotal', name: '统计' },
            { code: 'WithdrawExport', name: '导出' }
          ].map((l) => l.code)
        }
      }
    ]
  },
  {
    path: '/downloadfile',
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
          icon: 'ant-design:file-protect-outlined',
          pagePermission: [{ code: 'merExportData', name: '数据下载' }].map((l) => l.code),
          permission: [{ code: 'merExportDataDel', name: '删除' }].map((l) => l.code)
        }
      }
    ]
  },
  {
    path: '/merchantSubList',
    component: '#',
    redirect: '/pay4Mch',
    name: 'MerchantSubList/MerchantSubList',
    meta: {},
    children: [
      {
        path: 'MerchantSubList',
        component: 'views/Merchant/MerchantSubList/MerchantSubList',
        name: 'SubAccount',
        meta: {
          title: '账户管理',
          icon: 'ant-design:user-add-outlined',
          pagePermission: [
            {
              code: 'subMerchantList',
              name: '账户管理'
            }
          ].map((l) => l.code),
          permission: [
            { code: 'mchSubAdd', name: '添加' },
            { code: 'mchSubEdit', name: '编辑' },
            { code: 'mchSubDel', name: '删除' },
            { code: 'CatMchSubGoogleCode', name: '查看用户Google码' },
            { code: 'UpdateMchSubGoogleCode', name: '更新用户Google码' },
            { code: 'mchSubUpdateStatu', name: '更新状态' },
            { code: 'mchSubUpdatePasswd', name: '修改密码' }
          ].map((l) => l.code)
        }
      }
    ]
  },
  {
    path: '/merchantRoleList',
    component: '#',
    redirect: '/pay4Mch',
    name: 'MerchantRoleList/MerchantRoleList',
    meta: {},
    children: [
      {
        path: 'MerchantRoleList',
        component: 'views/Merchant/MerchantRoleList/MerchantRoleList',
        name: 'MerchantRoleList',
        meta: {
          title: '角色列表',
          icon: 'ant-design:shop-outlined',
          pagePermission: [
            {
              code: 'mchRole',
              name: '账户角色'
            }
          ].map((l) => l.code),
          permission: [
            { code: 'mchRoleAdd', name: '添加' },
            { code: 'mchRoleEdit', name: '编辑' },
            { code: 'mchRoleDel', name: '删除' },
            { code: 'mchRoleUpdatePermissions', name: '更新权限' }
          ].map((l) => l.code)
        }
      }
    ]
  },
  {
    path: '/personalPage',
    component: '#',
    redirect: '/personal/personal-center-page',
    name: 'pay4MgrPersonalPage',
    meta: {},
    children: [
      {
        path: 'personal-center-page',
        component: 'views/Personal/PersonalCenter/PersonalCenter',
        name: 'pay4MgrPersonalCenterPage',
        meta: {
          title: 'router.personalCenter',
          icon: 'ant-design:user-outlined' // TODO
        }
      }
    ]
  }
]
