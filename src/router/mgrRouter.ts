export const adminRouterList: AppRouteRecordRaw[] = [
  // {
  //   path: '/',
  //   component: Layout,
  //   redirect: '/home',
  //   name: 'Root',
  //   meta: {
  //     hidden: true
  //   }
  // },
  {
    path: '/',
    component: '#',
    redirect: '/home',
    name: 'Pay4MgrRoot',
    meta: {
      hidden: true
    }
  },
  {
    path: '/home',
    component: '#',
    redirect: '/Home/Home',
    name: 'Home',
    meta: {
      // "code": "INDEX_TOTAL_NUMBER_SHOW",
      // "name": "主页",
    },
    children: [
      {
        path: 'Home',
        component: 'views/Home/Home',
        name: 'HomeDemo',
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
    path: '/channelmanagement',
    component: '#',
    redirect: '/channelmanagement/paymentchannelmanagement',
    name: 'ChannelManagement',
    meta: {
      title: 'router.channelmanagement',
      icon: 'ant-design:merge-outlined',
      alwaysShow: true
    },
    children: [
      {
        path: 'tripartitelist',
        component: 'views/ChannelManagement/TripartiteList/TripartiteList',
        name: 'TripartiteList',
        meta: {
          title: 'router.tripartitelist',
          pagePermission: [
            {
              code: 'threePartyManage',
              name: '三方列表'
            }
          ].map((l) => l.code),
          permission: [
            { code: 'threePartyAdd', name: '三方添加' },
            { code: 'threePartyEdit', name: '三方编辑' },
            { code: 'threePartyDel', name: '三方删除' },
            { code: 'threePartyUpdateBalance', name: '三方更新余额' },
            { code: 'threePartyDsDfKz', name: '三方代收代付开关' },
            { code: 'threePartyPayountYThPz', name: '三方代付银行配置' },
            { code: 'threePartyPaymentTdPz', name: '三方代收通道配置' },
            { code: 'threePartyPaymentDsXdTest', name: '三方代收下单测试' },
            { code: 'threePartyPaymentDfXdTest', name: '三方代付下单测试' },
            { code: 'threePartyCatMy', name: '三方查看对接密钥' },
            { code: 'threePartyPzBhxx', name: '配置驳回信息' },
            { code: 'threePartyDfCallbacksPz', name: '代付回调配置' },
            { code: 'threePartyDsCallbacksPz', name: '代收回调配置' },
            { code: 'threePartyDfjdpz', name: '代付接单配置' },
            { code: 'threePartyDjxx', name: '查看对接信息' },
            { code: 'threePartyPayoutzdzfstatu', name: '代付失败自动转发' },
            { code: 'threePartyPayoutqqsfxdstatu', name: '请求三方下单' },
            { code: 'threePartyPayoutznjdqjddstatu', name: '只能接收接单区间的订单' }
          ].map((l) => l.code)
        }
      },
      {
        path: 'paymentchannelmanagement',
        component: 'views/ChannelManagement/PaymentChannelManagement/PaymentChannelManagement',
        name: 'PaymentChannelManagement',
        meta: {
          title: 'router.paymentchannelmanagement',
          pagePermission: [
            {
              code: 'tunnleManage',
              name: '收款通道管理'
            }
          ].map((l) => l.code),
          permission: [
            { code: 'tunnleManageKg', name: '通道状态开关' },
            { code: 'tunnleManageAdd', name: '通道添加' },
            { code: 'tunnleManageEdit', name: '通道编辑' },
            { code: 'tunnleManageDel', name: '通道删除' },
            { code: 'tunnleManageQzPz', name: '通道权重配置' }
          ].map((l) => l.code)
        }
      },
      {
        path: 'rateManagement',
        component: 'views/ChannelManagement/RateManagement/RateManagement',
        name: 'RateManagement',
        meta: {
          title: 'router.rateManagement',
          pagePermission: [
            {
              code: 'tunnelRateManage',
              name: '通道费率设置'
            }
          ].map((l) => l.code),
          permission: [
            { code: 'tunnelRateAdd', name: '添加' },
            { code: 'tunnelRateEdit', name: '编辑' },
            { code: 'tunnelRateDel', name: '删除' }
          ].map((l) => l.code)
        }
      },
      {
        path: 'tripartiteAPIlist',
        component: 'views/ChannelManagement/TripartiteAPIList/TripartiteAPIList',
        name: 'TripartiteAPIList',
        meta: {
          hidden: true,
          title: 'router.tripartiteAPIlist',
          pagePermission: [
            {
              code: 'threePartyApiManage',
              name: '三方API列表'
            }
          ].map((l) => l.code)
        },
        children: [
          {
            path: 'Info/:muid/:type',
            component: 'views/ChannelManagement/TripartiteAPIList/Info/Info',
            name: 'APIInfo',
            meta: {
              title: 'router.apiInfo',
              hidden: true
            }
          }
        ]
      },

      {
        path: 'paymentbank',
        component: 'views/ChannelManagement/PaymentBank/PaymentBank',
        name: 'PaymentBank',
        meta: {
          title: '商户代付银行',
          pagePermission: ['mchPayoutBankManage'],
          permission: [
            { code: 'mchPayoutBankPlXgfl', name: '批量修改费率' },
            { code: 'mchPayoutBankDeit', name: '编辑' },
            { code: 'mchPayoutBankStatu', name: '状态调整' },
            { code: 'mchPayoutBankFyqjpz', name: '区间费用配置' }
          ].map((l) => l.code)
        }
      },
      {
        path: 'walletmanagement',
        component: 'views/ChannelManagement/WalletManagement/WalletManagement',
        name: 'WalletManagement',
        meta: {
          title: '商户钱包配置',
          pagePermission: ['walletManage'],
          permission: [
            { code: 'walletEdit', name: '编辑' },
            { code: 'walletPlXgfl', name: '批量修改费率' },
            { code: 'walletXgqjfy', name: '修改区间费用' }
          ].map((l) => l.code)
        }
      },
      {
        path: 'wallettypemanagement',
        component: 'views/ChannelManagement/WalletTypeManagement/WalletTypeManagement',
        name: 'WalletTypeManagement',
        meta: {
          title: '商户钱包类型',
          pagePermission: ['WalletTypes'],
          permission: [
            { code: 'WalletTypesAdd', name: '添加' },
            { code: 'WalletTypesEdit', name: '编辑' },
            { code: 'WalletTypesDel', name: '删除' }
          ].map((l) => l.code)
        }
      },
      {
        path: 'paymentconfiguration',
        component: 'views/PaymentManagement/PaymentConfiguration/PaymentConfiguration',
        name: 'PaymentConfiguration',
        meta: {
          title: 'router.paymentconfiguration',
          pagePermission: [
            {
              code: 'PayoutConfig',
              name: '代付配置'
            }
          ].map((l) => l.code)
        }
      }
    ]
  },
  {
    path: '/merchantmanagement',
    component: '#',
    redirect: '/merchantmanagement/merchantlist',
    name: 'MerchantManagement',
    meta: {
      title: 'router.merchantmanagement',
      icon: 'ant-design:shop-outlined',
      alwaysShow: true
    },
    children: [
      {
        path: 'merchantclassification',
        component: 'views/MerchantManagement/MerchantClassification/MerchantClassification',
        name: 'MerchantClassification',
        meta: {
          title: 'router.merchantclassification',
          pagePermission: [
            {
              code: 'merchantClassify',
              name: '商户分类管理权限'
            }
          ].map((l) => l.code),
          permission: [
            { code: 'merchantClassifyAdd', name: '添加分类' },
            { code: 'merchantClassifyDel', name: '删除分类' },
            { code: 'merchantClassifyEdit', name: '编辑分类' },
            { code: 'merchantClassifyUpdateStatu', name: '更新状态' },
            { code: 'merchantClassifyTdInfo', name: '编辑通道数据' }
          ].map((l) => l.code)
        },
        children: [
          {
            path: 'channelInfo/:muid',
            component: 'views/MerchantManagement/MerchantClassification/ChannelInfo/ChannelInfo',
            name: 'ChannelInfo',
            meta: {
              title: 'router.channelInfo',
              hidden: true
            }
          }
        ]
      },
      {
        path: 'merchantlist',
        component: 'views/MerchantManagement/MerchantList/MerchantList',
        name: 'MerchantList',
        meta: {
          title: 'router.merchantlist',
          pagePermission: [{ code: 'MerchantListManage', name: '商户列表' }].map((l) => l.code),
          permission: [
            { code: 'merchantAdd', name: '添加' },
            { code: 'merchantEdit', name: '编辑' },
            { code: 'merchantUpdateStatu', name: '状态更新' },
            { code: 'merchantCharge', name: '内充' },
            { code: 'merchantDeduction', name: '扣费' },
            { code: 'merchantCashflow', name: '资金流水' },
            { code: 'merchantCashflowExport', name: '资金流水导出' },
            { code: 'merchantCatReat', name: '查看费率' },
            { code: 'merchantClearLoginToken', name: '清除登录Token' },
            { code: 'merchantCatGoogleCode', name: '查看google码' },
            { code: 'merchantUpdateGoogleCode', name: '更新google码' },
            { code: 'merchantUpdateSecretKey', name: '更新密钥' },
            { code: 'merchantUpdatePwd', name: '修改密码' },
            { code: 'merchantDel', name: '删除' },
            { code: 'merchantCatSecretKey', name: '查看密钥' },
            { code: 'MerchantSubManage', name: '子账号' },
            { code: 'MerchantRole', name: '商户子账户角色' },
            { code: 'merchantQcdlError', name: '清除登录错误限制' }
          ].map((l) => l.code)
        },
        children: [
          {
            path: 'fundflow/:muid',
            component: 'views/MerchantManagement/MerchantList/Fundflow/Fundflow',
            name: 'Fundflow',
            meta: {
              title: 'router.fundflow',
              hidden: true,
              permission: [{ code: 'merchantCashflowExport', name: '导出' }].map((l) => l.code)
            }
          },
          {
            path: 'merchantSubList/:muid',
            component: 'views/MerchantManagement/MerchantList/SubAccount/SubAccount',
            name: 'SubAccount',
            meta: {
              title: '子账户列表',
              hidden: true
            }
          },
          {
            path: 'merchantRoleList/:muid',
            component:
              'views/MerchantManagement/MerchantList/SubAccountRoleList/SubAccountRoleList',
            name: 'SubAccountRole',
            meta: {
              title: '子账户角色管理',
              hidden: true
            }
          },

          {
            path: 'Info/:muid',
            component: 'views/MerchantManagement/MerchantList/Detail/Detail',
            name: 'Detail',
            meta: {
              title: 'router.merchantDetails',
              hidden: true
            }
          }
        ]
      },
      {
        path: 'merchantlog',
        component: 'views/MerchantManagement/MerchantLog/MerchantLog',
        name: 'MerchantLog',
        meta: {
          title: 'router.merchantlog',
          pagePermission: [
            {
              code: 'MerchantLog',
              name: '商户日志'
            }
          ].map((l) => l.code)
        }
      },
      {
        path: 'internallist',
        component: 'views/MerchantManagement/InternalList/InternalList',
        name: 'InternalList',
        meta: {
          title: 'router.internallist',
          pagePermission: [
            {
              code: 'rechargeMoneyListManage',
              name: '内充列表权限'
            }
          ].map((l) => l.code),
          permission: [{ code: 'rechargeMoneyTotal', name: '统计' }].map((l) => l.code)
        }
      },
      {
        path: 'reduceMoney',
        component: 'views/MerchantManagement/DeductionList/DeductionList',
        name: 'Deduction List',
        meta: {
          title: 'router.deductionlist',
          pagePermission: [
            {
              code: 'reduceMoneyListManage',
              name: '扣除列表权限'
            }
          ].map((l) => l.code),
          permission: [{ code: 'reduceMoneyTotal', name: '统计' }].map((l) => l.code)
        }
      },
      {
        path: 'withdrawList',
        component: 'views/MerchantManagement/WithdrawApplication/WithdrawApplication',
        name: 'Withdrawal Application',
        meta: {
          title: '下发申请',
          pagePermission: [
            {
              code: 'withdrawManage',
              name: '提现列表权限'
            }
          ].map((l) => l.code),
          permission: [
            { code: 'withdrawTotal', name: '统计' },
            { code: 'withdrawExport', name: '导出数据' },
            { code: 'withdrawSuccess', name: '通过申请' },
            { code: 'withdrawReject', name: '拒绝申请' },
            { code: 'withdrawUpdateNote', name: '更新备注' }
          ].map((l) => l.code)
        }
      }
    ]
  },
  {
    path: '/ordermanagement',
    component: '#',
    redirect: '/ordermanagement/collectionOrderlist',
    name: 'OrderManagement',
    meta: {
      title: '订单管理',
      icon: 'ant-design:money-collect-outlined',
      alwaysShow: true
    },
    children: [
      {
        path: 'collectionOrderlist',
        component: 'views/CollectionManagement/OrderList/OrderList',
        name: 'OrderList',
        meta: {
          title: '代收列表',
          pagePermission: [
            {
              code: 'collectionOrderList',
              name: '代收订单列表'
            }
          ].map((l) => l.code),
          permission: [
            { code: 'paymentTotal', name: '代收统计' },
            { code: 'paymentExportData', name: '代收导出数据' },
            { code: 'paymentQzrk', name: '强制入款' },
            { code: 'paymentOrderProcess', name: '详细' },
            { code: 'paymentQueryOrder', name: '查询订单' },
            { code: 'paymentZzrk', name: '设置入款' },
            { code: 'paymentOrderCallback', name: '订单回调' },
            { code: 'paymentUpdateNote', name: '更新备注' },
            { code: 'paymentCallbackLog', name: '回调记录' }
          ].map((l) => l.code)
        }
      },
      {
        path: 'droporderlist',
        component: 'views/CollectionManagement/DropOrderList/DropOrderList',
        name: 'DropOrderList',
        meta: {
          title: 'router.droporderlist',
          pagePermission: [
            {
              code: 'loseOrderManage',
              name: '调单列表'
            }
          ].map((l) => l.code),
          permission: [
            { code: 'loseOrderUpdateNote', name: '更新备注' },
            { code: 'loseOrderClzt', name: '更新处理状态' },
            { code: 'loseOrderCallbackOrder', name: '回调订单' },
            { code: 'loseOrderForceIsPay', name: '强制入款' }
          ].map((l) => l.code)
        }
      },
      {
        path: 'callbacklog',
        component: 'views/CollectionManagement/CallbackRecord/CallbackRecord',
        name: 'callbacklog',
        meta: {
          title: '代收回调',
          pagePermission: [
            {
              code: 'payCallbackLog',
              name: '回调日志'
            }
          ].map((l) => l.code)
        }
      },
      {
        path: 'paymentorder',
        component: 'views/PaymentManagement/PaymentOrder/PaymentOrder',
        name: 'PaymentOrder',
        meta: {
          title: '代付列表',
          pagePermission: [
            {
              code: 'payoutOrderList',
              name: '代付订单列表'
            }
          ].map((l) => l.code),
          permission: [
            {
              code: 'payoutCreateOrder',
              name: '批量创建订单权限'
            },
            { code: 'payoutExportData', name: '导出订单数据' },
            { code: 'payoutCatCallbackLog', name: '回调记录' },
            { code: 'payoutTotal', name: '统计' },
            { code: 'payoutPlzfsf', name: '批量转发其他三方' },
            { code: 'payoutReject', name: '驳回订单' },
            { code: 'payoutOrderProcess', name: '订单流程' },
            { code: 'payoutOrderCallback', name: '回调订单' },
            { code: 'payoutOrderPassing', name: '通过' },
            { code: 'payoutSfcreateOrder', name: '请求三方下单' },
            { code: 'payoutSfCallbackLog', name: '三方回调记录' },
            { code: 'payoutQueryOrder', name: '订单查询' },
            { code: 'payoutUpdateNote', name: '更新备注' },
            { code: 'payoutGfkjt', name: '获取三方支付图' }
          ].map((l) => l.code)
        }
      },
      {
        path: 'callbackrecord',
        component: 'views/PaymentManagement/CallbackRecord/CallbackRecord',
        name: 'CallbackRecord',
        meta: {
          title: '代付回调',
          pagePermission: [
            {
              code: 'payoutCallbackLog',
              name: '代付回调日志'
            }
          ].map((l) => l.code)
        }
      },
      {
        path: 'batchdistributiontripartite',
        component:
          'views/PaymentManagement/BatchDistributionTripartite/BatchDistributionTripartite',
        name: 'BatchDistributionTripartite',
        meta: {
          title: '批量下发三方',
          pagePermission: [
            {
              code: 'batchDistribution',
              name: '批量下发三方'
            }
          ].map((l) => l.code),
          permission: [
            { code: 'batchDistributionAdd', name: '添加' },
            { code: 'batchDistributionTotal', name: '数据统计' },
            { code: 'batchDistributionReview', name: '批量审核' },
            { code: 'batchDistributionUpdateNote', name: '更新备注' },
            { code: 'batchDistributionOrderProcess', name: '请求三方下单' },
            { code: 'batchDistributionSfxd', name: '请求三方下单' },
            { code: 'batchDistributionJlgl', name: '积累归零' },
            { code: 'batchDistributionExportData', name: '导出' }
          ].map((l) => l.code)
        }
      }
    ]
  },

  {
    path: '/financialmanagement',
    component: '#',
    redirect: '/financialmanagement/',
    name: 'FinancialManagement',
    meta: {
      title: '数据统计',
      icon: 'tdesign:chart-area-filled',
      alwaysShow: true
    },
    children: [
      {
        path: 'merchantreport',
        component: 'views/FinancialManagement/MerchantReport/MerchantReport',
        name: 'MerchantReport',
        meta: {
          title: 'router.merchantreport',
          pagePermission: [
            {
              code: 'merchantForm',
              name: '商户报表'
            }
          ].map((l) => l.code),
          permission: [{ code: 'merchantFormExportData', name: '商户报表导出数据' }].map(
            (l) => l.code
          )
        }
      },
      {
        path: 'channelreport',
        component: 'views/FinancialManagement/ChannelReport/ChannelReport',
        name: 'ChannelReport',
        meta: {
          title: '三方报表',
          pagePermission: [
            {
              code: 'threePartyForm',
              name: '三方报表'
            }
          ].map((l) => l.code)
        }
      },
      {
        path: 'merchantdatastatistics',
        component: 'views/FinancialManagement/MerchantDataStatistics/MerchantDataStatistics',
        name: 'MerchantDataStatistics',
        meta: {
          title: '商户数据统计',
          pagePermission: [
            {
              code: 'mchDataStatistics',
              name: '商户数据统计'
            }
          ].map((l) => l.code)
        }
      },
      {
        path: 'tripartitestatisticslist',
        component: 'views/FinancialManagement/TripartiteStatisticsList/TripartiteStatisticsList',
        name: 'TripartiteStatisticsList',
        meta: {
          title: '三方数据统计',
          pagePermission: [
            {
              code: 'threePartyDataStatistics',
              name: '三方数据统计'
            }
          ].map((l) => l.code)
        }
      }
    ]
  },
  {
    path: '/securitymonitoring',
    component: '#',
    redirect: '/securitymonitoring/abnormalorder',
    name: 'SecurityMonitoring',
    meta: {
      title: 'router.securitymonitoring',
      icon: 'ant-design:safety-certificate-outlined',
      alwaysShow: true
    },
    children: [
      {
        path: 'abnormalordermonitoring',
        component: 'views/SecurityMonitoring/AbnormalOrderMonitoring/AbnormalOrderMonitoring',
        name: 'AbnormalOrderMonitoring',
        meta: {
          title: 'router.abnormalordermonitoring',
          pagePermission: [
            {
              code: 'orderMonitor',
              name: '安全监控'
            }
          ].map((l) => l.code)
        }
      },
      {
        path: 'paymentorderdetection',
        component: 'views/SecurityMonitoring/PaymentOrderDetection/PaymentOrderDetection',
        name: 'PaymentOrderDetection',
        meta: {
          title: 'router.paymentorderdetection',
          pagePermission: [
            {
              code: 'payoutOrderCheck',
              name: '代付订单检测权限'
            }
          ].map((l) => l.code)
        }
      }
    ]
  },
  {
    path: '/systemmanagement',
    component: '#',
    redirect: '/systemmanagement/userlist',
    name: 'SystemManagement',
    meta: {
      title: 'router.systemmanagement',
      icon: 'solar:settings-outline',
      alwaysShow: true
    },
    children: [
      {
        path: 'userlist',
        component: 'views/SystemManagement/UserList/UserList',
        name: 'UserList',
        meta: {
          title: 'router.userlist',
          pagePermission: [
            {
              code: 'adminUserManage',
              name: '用户列表'
            }
          ].map((l) => l.code),
          permission: [
            { code: 'adminUserAdd', name: '添加' },
            { code: 'adminUserEdit', name: '编辑' },
            { code: 'adminUserDel', name: '删除' },
            { code: 'adminUserCatGoogleCode', name: '查看用户Google码' },
            { code: 'adminUserupdateGoogleCode', name: '更新用户Google码' },
            { code: 'adminUserUpdateStatu', name: '更新状态' },
            { code: 'adminUserUpdatePwd', name: '修改密码' },
            { code: 'adminUserClearLoginLimit', name: '清除登录Token' }
          ].map((l) => l.code)
        }
      },
      {
        path: 'listofroles',
        component: 'views/SystemManagement/ListOfRoles/ListOfRoles',
        name: 'ListOfRoles',
        meta: {
          title: 'router.listofroles',
          pagePermission: [
            {
              code: 'roleMange',
              name: '角色列表'
            }
          ].map((l) => l.code)
        }
      },
      {
        path: 'operationlog',
        component: 'views/SystemManagement/Log/Log',
        name: 'Log',
        meta: {
          title: 'router.operationlog',
          pagePermission: [
            {
              code: 'systemLogMange',
              name: '操作日志'
            }
          ].map((l) => l.code)
        }
      },
      {
        path: 'systemconfiguration',
        component: 'views/SystemManagement/Configuration/Configuration',
        name: 'Configuration',
        meta: {
          title: 'router.systemconfiguration',
          pagePermission: [
            {
              code: 'systemConfig',
              name: '系统配置'
            }
          ].map((l) => l.code)
        }
      },
      // {
      //   path: 'IDNcallbacktest',
      //   component: 'views/SystemManagement/IDNCallbackTest/IDNCallbackTest',
      //   name: 'IDNCallbackTest',
      //   meta: {
      //     title: 'router.IDNCallbackTest'
      //   }
      // },
      {
        path: 'exportfiles',
        component: 'views/SystemManagement/ExportFiles/ExportFiles',
        name: 'ExportFiles',
        meta: {
          title: 'router.exportFiles',
          pagePermission: [
            {
              code: 'ExportFilesManage',
              name: '系统导出文件'
            }
          ].map((l) => l.code)
        }
      },
      {
        path: 'browserList',
        component: 'views/SystemManagement/BrowserList/BrowserList',
        name: 'BrowserList',
        meta: {
          title: 'router.browserList',
          pagePermission: [
            {
              code: 'mgrBrowserList',
              name: '浏览器列表'
            }
          ].map((l) => l.code),
          permission: [{ code: 'mgrBrowserListEdit', name: '编辑' }].map((l) => l.code)
        }
      }
    ]
  },
  {
    path: '/APIlogs',
    component: '#',
    redirect: '/APILogs/',
    name: 'APILogs',
    meta: {
      title: 'router.APIlogs',
      icon: 'icon-park-outline:api',
      alwaysShow: true
    },
    children: [
      {
        path: 'systemAPIlog',
        component: 'views/APILogs/SystemAPILog/SystemAPILog',
        name: 'SystemAPILog',
        meta: {
          title: 'router.systemAPIlog',
          pagePermission: [
            {
              code: 'apiLogManage',
              name: '系统API日志'
            }
          ].map((l) => l.code)
        }
      },
      {
        path: 'channelAPIlog',
        component: 'views/APILogs/ChannelAPILog/ChannelAPILog',
        name: 'ChannelAPILog',
        meta: {
          title: 'router.channelAPIlog',
          pagePermission: [
            {
              code: 'channelApiManage',
              name: '通道API日志'
            }
          ].map((l) => l.code)
        }
      }
    ]
  },

  {
    path: '/external-link',
    // component: '#',
    name: 'ExternalLink',
    meta: {
      title: 'router.accessguide',
      icon: 'ant-design:file-text-outlined',
      alwaysShow: true
    },
    children: [
      {
        path: '/doc/PH',
        component: '#',
        redirect: '/doc/PH',
        name: 'PH',
        meta: {
          title: '接入文档',
          pagePermission: [
            {
              code: 'phDoc',
              name: '文档'
            }
          ].map((l) => l.code)
          // icon: 'icon-park-outline:api',
          // alwaysShow: true
        }
      }
    ]
  }
]
