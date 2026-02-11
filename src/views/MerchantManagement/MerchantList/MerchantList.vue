<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Dialog } from '@/components/Dialog'
import { Search } from '@/components/CustomSearch'
import { useI18n } from '@/hooks/web/useI18n'
import { useRouter } from 'vue-router'
import { Table, TableColumn } from '@/components/Table'
import {
  getMerchantListApi,
  addMerchantApi,
  editMerchantApi,
  deleteMerchantApi,
  internalFillingApi,
  updateMerchantStatusApi,
  clearLogTokenApi,
  getGoogleQrCodeApi,
  updateGoogleCodeApi,
  updateSerkeyApi,
  deductionAmountApi,
  getSerkeyApi
} from '@/api/merchantmanagement'
import { useTable } from '@/hooks/web/useTable'
import { MerchantListType } from '@/api/merchantmanagement/types'
import { ref, unref, reactive, computed, onMounted, h, readonly, watch } from 'vue'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { Breadcrumb } from '@/components/Breadcrumb'
import { FormSchema } from '@/components/Form'
import { Icon } from '@/components/Icon'
import Write from './components/Write.vue'
import { BaseButton } from '@/components/Button'
import {
  ElMessageBox,
  ElDropdownMenu,
  ElDropdown,
  ElDropdownItem,
  ElMessage,
  ElTooltip,
  ElSwitch,
  ElButton
} from 'element-plus'
import { useAppStore } from '@/store/modules/app'
import { hasPermi } from '@/components/Permission'
import SecretForm from './components/SecretForm'
import { getWalletManageList } from '@/api/channelmanagement'
import { CopyDocument, InfoFilled, Link } from '@element-plus/icons-vue'
import { useEnum } from '@/hooks/web/useEnum'
import { useCopyMerchantDialog } from './composables/useCopyMerchantDialog'
import CopyMerchantForm from './components/CopyMerchantForm'
import { copyToClipboard } from '@/utils'

const router = useRouter()
const ids = ref<string[]>([])
const mchDomain = ref('')
const currentRow = ref()
const merchantCategoryOptions = ref<Record<'label' | 'value' | 'country', string>[]>([])
const { countryOptions } = useEnum()
const walletTypeOptions = ref<Record<'label' | 'value' | 'country', string>[]>()
const currentCountry = ref('')
const currentCategory = ref('')

onMounted(() => {
  fetchWalletType()
})

const fetchWalletType = async () => {
  try {
    const res = (await getWalletManageList({})) as unknown as Record<string, CountryItem>

    if (!res?.success) return

    walletTypeOptions.value = Object.values(res.data).map((item) => ({
      label: item.name,
      value: item.uuid,
      country: item.country
    }))
  } catch (error) {
    console.error('Failed to fetch module codes:', error)
  }
}

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getMerchantListApi({
      pageIndex: unref(currentPage),
      pageSize: unref(pageSize),
      ...unref(searchParams)
    })
    const { mch_domain, mch_classify_datas } = res.data
    mchDomain.value = mch_domain ?? ''
    merchantCategoryOptions.value =
      mch_classify_datas?.map((item: any) => ({
        label: item.classify_name,
        value: item.uuid,
        country: item.country
      })) ?? []

    return {
      list: res.data.list.map((item) => ({
        ...item,
        payment_rate: (item.payment_rate * 100).toFixed(2),
        issued_money_rate: (item.issued_money_rate * 100).toFixed(2),
        recharge_money_rate: (item.recharge_money_rate * 100).toFixed(2)
      })),
      total: res.data.total
    }
  },
  fetchDelApi: async () => {
    const res = await deleteMerchantApi(unref(ids))
    return !!res.success
  }
})

const { loading, dataList, total, currentPage, pageSize } = tableState
const { getList, getElTableExpose, delList } = tableMethods

const searchParams = ref({})
const setSearchParams = (params: any) => {
  searchParams.value = params
  getList()
}

const dialogVisible = ref(false)
const qrVisible = ref(false)
const dialogTitle = ref('')
const actionType = ref('')
const isHidden = ref(true)
const writeSchema = ref()
const googleQRSrc = ref()

const { t } = useI18n()

const handleAmountChange = (value: number) => {
  const handling_fee = (value * (currentRow.value.recharge_money_rate || 0)) / 100
  currentRow.value = {
    ...currentRow.value,
    handling_fee,
    handling_amount: (value || 0) - (handling_fee || 0),
    cz_amount: value
  }
}

const handleRateChange = (value: number) => {
  const handling_fee = (value * (currentRow.value.cz_amount || 0)) / 100

  currentRow.value = {
    ...currentRow.value,
    handling_fee,
    handling_amount: (currentRow.value.cz_amount || 0) - (handling_fee || 0),
    recharge_money_rate: value
  }
}

const rateRowSchemas = reactive<CrudSchema[]>([
  {
    field: 'tunnel_name',
    label: '通道名称',
    width: 120
  },
  {
    field: 'code',
    label: '通道code',
    width: 120
  },

  {
    field: 'rate',
    label: t('channelManagement.ratePercentage') /* 费率% */,
    width: 100,
    formatter: (_: any, __: TableColumn, cellValue: number) => {
      return cellValue > 0 ? (cellValue * 100).toFixed(2) : 0
    }
  },
  {
    field: 'range',
    label: '区间',
    width: 140,
    table: {
      slots: {
        default: (data: any) => {
          const row = data.row
          const { min_amount, max_amount } = row
          if (!min_amount && !max_amount) return 0
          return `${Number((min_amount || 0).toFixed(2)).toLocaleString()} ~ ${Number((max_amount || 0).toFixed(2)).toLocaleString()}`
        }
      }
    }
  }
])

const rateVisible = ref(false)
const rateLoading = ref(false)
const rateDataList = ref([])
const { allSchemas: rateSchemas } = useCrudSchemas(rateRowSchemas)

const showRate = async (uuid: string) => {
  try {
    const { data } = await getSerkeyApi({
      action: 'getMchRate',
      data_uuid: uuid
    })

    rateDataList.value = data?.datas ?? []
  } catch (error) {
    console.log(error)
  } finally {
    rateVisible.value = true
  }
}

let fillingSchemas = reactive<FormSchema[]>([
  {
    field: 'merchant_id',
    label: t('merchantList.merchantID'),
    component: 'Input',
    componentProps: {
      readonly: true
    },
    colProps: {
      span: 24
    }
  },
  {
    field: 'merchant_name',
    label: t('merchantList.merchantName'),
    component: 'Input',
    componentProps: {
      readonly: true
    },
    colProps: {
      span: 24
    }
  },
  {
    field: 'wallet_type_uuid',
    label: '交易钱包类型',
    component: 'Select',
    componentProps: {
      placeholder: '请选择',
      options: walletTypeOptions,
      onChange: (val) => {
        const ret = currentRow.value?.wallet_datas?.find((l) => l.uuid === val)
        const write = unref(writeRef)
        write?.setValues({ balance_amount: ret?.balance_amount ?? 0 })
      }
    },
    colProps: {
      span: 24
    }
  },
  {
    field: 'balance_amount',
    label: '余额',
    component: 'Input',
    componentProps: {
      disabled: true
    },
    colProps: {
      span: 24
    }
  },
  {
    field: 'cz_amount',
    label: t('merchantList.rechargeAmount'),
    component: 'InputNumber',
    componentProps: {
      placeholder: t('merchantList.rechargeAmount'),
      onChange: handleAmountChange
    },
    colProps: {
      span: 24
    }
  },
  {
    field: 'recharge_money_rate',
    label: t('merchantList.internalRate'),
    component: 'InputNumber',
    componentProps: {
      placeholder: t('merchantList.internalRate'),
      onChange: handleRateChange,
      min: 0,
      max: 100
    },
    colProps: {
      span: 24
    }
  },
  {
    field: 'handling_fee',
    label: t('merchantList.handlingFee'),
    component: 'Input',
    componentProps: {
      placeholder: t('merchantList.handlingFee'),
      readonly: true
    },
    colProps: {
      span: 24
    }
  },
  {
    field: 'handling_amount',
    label: '实际充值金额',
    component: 'Input',
    componentProps: {
      placeholder: '实际充值金额',
      readonly: true
    },
    colProps: {
      span: 24
    }
  },
  {
    field: 'filling_note',
    label: t('merchantList.remark'),
    component: 'Input',
    componentProps: {
      placeholder: t('merchantList.remark')
    },
    colProps: {
      span: 24
    }
  }
])

let deductionSchemas = reactive<FormSchema[]>([
  {
    field: 'merchant_id',
    label: t('merchantList.merchantID'),
    component: 'Input',
    componentProps: {
      readonly: true
    },
    colProps: {
      span: 24
    }
  },
  {
    field: 'merchant_name',
    label: t('merchantList.merchantName'),
    component: 'Input',
    componentProps: {
      readonly: true
    },
    colProps: {
      span: 24
    }
  },
  {
    field: 'wallet_type_uuid',
    label: '交易钱包类型',
    component: 'Select',
    componentProps: {
      placeholder: '请选择',
      options: walletTypeOptions,
      onChange: (val) => {
        const ret = currentRow.value?.wallet_datas?.find((l) => l.uuid === val)
        const write = unref(writeRef)
        write?.setValues({ balance_amount: ret?.balance_amount ?? 0 })
      }
    },
    colProps: {
      span: 24
    }
  },
  {
    field: 'balance_amount',
    label: '余额',
    component: 'Input',
    componentProps: {
      disabled: true
    },
    colProps: {
      span: 24
    }
  },
  {
    field: 'kc_amount',
    label: t('merchantList.deductionAmount'),
    component: 'InputNumber',
    componentProps: {
      placeholder: t('merchantList.deductionAmount')
    },
    colProps: {
      span: 24
    }
  },
  {
    field: 'de_note',
    label: t('merchantList.remark'),
    component: 'Input',
    componentProps: {
      placeholder: t('merchantList.remark')
    },
    colProps: {
      span: 24
    }
  }
])

const isEditMode = computed(() => actionType.value === 'edit')

const filterMerchantCategoryOptions = computed(() => {
  if (!currentCountry.value) return merchantCategoryOptions.value
  return merchantCategoryOptions.value.filter((l) => l.country === currentCountry.value)
})

const {
  copyMerchantVisible,
  copyMerchantFormRef,
  currentRow: copyCurrentRow,
  saveLoading: copyLoading,
  opencopyMerchantDialog,
  closecopyMerchantDialog,
  savecopyMerchant
} = useCopyMerchantDialog({
  onSuccess: () => {
    currentPage.value = 1
    getList()
  }
})

const crudSchemas = reactive<CrudSchema[]>([
  {
    field: 'merchant_id',
    label: t('merchantList.merchantID'),
    width: 140,
    search: {
      component: 'Input',
      label: t('merchantList.merchantID'),
      componentProps: {
        placeholder: t('merchantList.merchantID')
      }
    },
    form: {
      hidden: true
    },
    detail: {
      span: 24
    },
    table: {
      fixed: 'left'
    }
  },
  {
    field: 'account',
    label: t('merchantList.merchantAccount'),
    width: 140,
    search: {
      component: 'Input',
      componentProps: {
        placeholder: t('merchantList.merchantAccount')
      }
    },
    form: {
      component: 'Input',
      colProps: {
        span: 24
      },
      componentProps: {
        placeholder: t('AddMerchantForm.account')
      }
    },
    table: {
      fixed: 'left'
    }
  },
  {
    field: 'merchant_name',
    label: t('merchantList.merchantName'),
    width: 140,
    search: {
      component: 'Input',
      componentProps: {
        placeholder: t('merchantList.merchantName')
      }
    },
    form: {
      component: 'Input',
      colProps: {
        span: 24
      },
      componentProps: {
        placeholder: t('AddMerchantForm.merchantName')
      }
    }
  },
  {
    field: 'country',
    label: t('AddMerchantForm.country'),
    width: 120,
    search: {
      component: 'Select',
      label: t('AddMerchantForm.country'),
      componentProps: {
        placeholder: t('AddMerchantForm.selectCountry'),
        options: countryOptions,
        onChange: (value) => {
          currentCountry.value = value
        }
      }
    },
    form: {
      component: 'Select',
      colProps: {
        span: 24
      },
      componentProps: {
        disabled: isEditMode,
        placeholder: t('AddMerchantForm.selectCountry'),
        options: countryOptions,
        onChange: (value) => {
          currentCountry.value = value
          const write = unref(writeRef)
          write?.setValues({ merchant_classify_uuid: '' })
        }
      }
    },
    formatter: (_: any, __: TableColumn, cellValue: string) => {
      const name = countryOptions.value.find((l) => l.value === cellValue)?.label
      return name ?? ''
    },
    detail: {
      span: 24
    }
  },
  {
    field: 'merchant_classify_name',
    label: '分类名称',
    width: 120,
    form: { hidden: true },
    search: { hidden: true },
    formatter: (row: any, __: TableColumn, cellValue: string) => {
      const name = merchantCategoryOptions.value.find(
        (l) => l.value === row['merchant_classify_uuid']
      )?.label
      return name ?? ''
    }
  },
  {
    field: 'merchant_classify_uuid',
    hidden: true,
    label: t('AddMerchantForm.merchantCategory'),
    search: {
      component: 'Select',
      componentProps: {
        placeholder: t('AddMerchantForm.selectCategory'),
        options: merchantCategoryOptions,
        onChange: (value) => {
          currentCategory.value = value
        }
      }
    },
    form: {
      component: 'Select',
      colProps: {
        span: 24
      },
      componentProps: {
        placeholder: t('AddMerchantForm.selectCategory'),
        options: filterMerchantCategoryOptions,
        onChange: (value) => {
          currentCategory.value = value
          if (currentRow.value) return
          const selectCountry =
            merchantCategoryOptions.value?.find((l) => l.value === value)?.country ?? ''
          currentCountry.value = selectCountry

          const write = unref(writeRef)
          write?.setValues({ country: selectCountry })
        }
      }
    },
    detail: {
      span: 24
    }
  },
  {
    field: 'amount_sum',
    label: '总余额',
    width: 140,
    form: {
      hidden: true
    },
    search: { hidden: true },
    table: {
      slots: {
        default: (data: any) => {
          const wallet_datas = data.row?.wallet_datas ?? []
          const sum = wallet_datas.reduce((ret, curr) => ret + curr.balance_amount * 1, 0)
          const content = (
            <ul>
              {wallet_datas.map((item, index) => (
                <li key={`${item.name}-${index}`}>
                  <div>
                    {item.name}余额: {Number(item.balance_amount.toFixed(2)).toLocaleString()}
                  </div>
                  <div>
                    {item.name}冻结余额: {Number(item.freeze_amount.toFixed(2)).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )
          return (
            <ElTooltip
              placement="top"
              v-slots={{
                content: () => content
              }}
            >
              <div class="cursor-pointer">{Number(sum.toFixed(2)).toLocaleString()}</div>
            </ElTooltip>
          )
        }
      }
    }
  },
  {
    field: 'secret_key',
    label: t('merchantList.secretKey'),
    'min-width': 40,
    search: {
      hidden: true
    },
    table: {
      hidden: true,
      slots: {
        default: (data: any) => {
          return (
            <div class="cursor-pointer" onClick={() => showSecretModal(data.row)}>
              <Icon icon="vi-ant-design:security-scan-outlined"></Icon>
            </div>
          )
        }
      }
    },
    form: {
      hidden: true
    }
  },
  {
    field: 'password',
    label: t('AddMerchantForm.password'),
    search: { hidden: true },
    hidden: true,
    form: {
      component: 'InputPassword',
      colProps: { span: 24 },
      componentProps: {
        placeholder: t('AddMerchantForm.password'),
        showPassword: true
      },
      hidden: isEditMode.value // Use .value to get the boolean
    }
  },
  {
    field: 'confirm_password',
    label: t('AddMerchantForm.confirmPassword'),
    hidden: true,
    search: {
      hidden: true
    },
    form: {
      component: 'InputPassword',
      colProps: { span: 24 },
      componentProps: {
        placeholder: t('AddMerchantForm.confirmPassword'),
        showPassword: true
      },
      hidden: isEditMode.value // Use .value to get the boolean
    }
  },
  {
    field: 'payment_rate',
    label: t('AddMerchantForm.paymentInterest'),
    hidden: true,
    search: {
      hidden: true
    },
    form: {
      hidden: true
    }
  },
  {
    field: 'issued_money_rate',
    label: t('AddMerchantForm.issuanceInterest'),
    hidden: true,
    search: {
      hidden: true
    },
    form: {
      component: 'InputNumber',
      colProps: {
        span: 24
      },
      componentProps: {
        placeholder: t('AddMerchantForm.issuanceInterest'),
        controlsPosition: 'right',
        min: 0,
        max: 100
      }
    }
  },
  {
    field: 'recharge_money_rate',
    label: t('AddMerchantForm.internalRecharge'),
    hidden: true,
    search: {
      hidden: true
    },
    form: {
      component: 'InputNumber',
      colProps: {
        span: 24
      },
      componentProps: {
        placeholder: t('AddMerchantForm.internalRecharge'),
        controlsPosition: 'right',
        min: 0,
        max: 100
      }
    }
  },
  {
    field: 'paybehalf_min_money',
    label: t('AddMerchantForm.minimumPayment'),
    search: {
      hidden: true
    },
    form: {
      component: 'InputNumber',
      colProps: {
        span: 24
      },
      componentProps: {
        placeholder: t('AddMerchantForm.minimumPayment'),
        controlsPosition: 'right'
      }
    },
    hidden: true
  },
  {
    field: 'paybehalf_max_money',
    label: t('AddMerchantForm.maximumPayment'),
    search: {
      hidden: true
    },
    form: {
      component: 'InputNumber',
      colProps: {
        span: 24
      },
      componentProps: {
        placeholder: t('AddMerchantForm.maximumPayment'),
        controlsPosition: 'right'
      }
    },
    hidden: true
  },
  {
    field: 'statu',
    label: t('merchantList.accountStatus'),
    'min-width': 80,
    form: {
      hidden: true
    },
    search: {
      component: 'Select',
      componentProps: {
        placeholder: t('merchantList.accountStatus'),
        options: [
          { label: t('merchantList.active'), value: true },
          { label: t('merchantList.inactive'), value: false }
        ]
      }
    },
    formatter: (row: Recordable, __: TableColumn, cellValue: boolean) => {
      return h(ElSwitch, {
        class: 'mx-4px',
        modelValue: row.statu,
        onChange: (value: boolean) => updateStatus(row)
      })
    }
  },
  {
    field: 'current_login_ip',
    label: t('merchantList.loginAddress'),
    'min-width': 60,
    search: {
      hidden: true
    },
    form: {
      hidden: true
    },
    table: {
      'show-overflow-tooltip': false,
      slots: {
        default: (data: any) => {
          const row = data.row

          const hasHttp = /^https?:\/\//.test(mchDomain.value)
          const href = `${!hasHttp ? 'https://' : ''}${mchDomain.value ?? ''}/pay4Mch/mchLogin`

          return (
            <ElTooltip placement="top" content={href}>
              <div class="cursor-pointer" onClick={() => copyToClipboard(href, '登录地址')}>
                <Icon icon="vi-ant-design:link-outlined"></Icon>
              </div>
            </ElTooltip>
          )
        }
      }
    }
  },

  {
    field: 'note',
    label: t('merchantList.remark'),
    search: {
      component: 'Input',
      componentProps: {
        placeholder: t('merchantList.remark')
      }
    },
    table: {
      show: false
    },
    form: {
      component: 'Input',
      colProps: {
        span: 24
      }
    }
  },
  {
    field: 'telegram_group_id',
    label: '飞机群id',
    search: {
      hidden: true
    },
    form: {
      hidden: true
    },
    table: { hidden: true }
  },
  {
    field: 'create_time',
    label: t('merchantList.registerTime'),
    search: {
      hidden: true
    },
    form: {
      hidden: true
    }
  },
  {
    field: 'ip_whitelist',
    label: t('AddMerchantForm.apiIpWhitelist'),
    hidden: true,
    search: {
      hidden: true
    },
    form: {
      component: 'Input',
      colProps: {
        span: 24
      },
      componentProps: {
        type: 'textarea',
        placeholder: t('AddMerchantForm.apiIpWhitelist'),
        rows: 4
      }
    }
  },
  {
    field: 'login_ip_whitelist',
    label: t('AddMerchantForm.loginIpWhitelist'),
    hidden: true,
    search: {
      hidden: true
    },
    form: {
      component: 'Input',
      colProps: {
        span: 24
      },
      componentProps: {
        type: 'textarea',
        placeholder: t('AddMerchantForm.loginIpWhitelist'),
        rows: 4
      }
    }
  },
  {
    field: 'telegram_group_id',
    label: '飞机群id',
    search: {
      hidden: true,
      component: 'Input',
      componentProps: {
        placeholder: '请输入'
      }
    },
    form: {
      component: 'Input',
      colProps: {
        span: 24
      },
      componentProps: {
        placeholder: '请输入'
      }
    },
    table: { hidden: true }
  },
  {
    field: 'telegram_balance_group_id',
    label: '余额查询飞机群ID',
    search: {
      hidden: true
    },
    form: {
      component: 'Input',
      colProps: {
        span: 24
      }
    },
    table: { hidden: true }
  },
  {
    field: 'tg_group_review_user',
    // label: "商户飞机群审核人员",
    hidden: true,
    search: {
      hidden: true
    },
    form: {
      component: 'Input',
      formItemProps: {
        slots: {
          label: () => (
            <div class="flex text-14px items-center">
              <span>商户飞机群审核人员</span>

              <ElTooltip content="输入飞机账户名，一行一个" placement="top">
                <ElButton icon={InfoFilled} type="text" style={{ color: '#606266' }} />
              </ElTooltip>
            </div>
          )
        }
      },
      colProps: {
        span: 24
      },
      componentProps: {
        type: 'textarea',
        placeholder: '请输入',
        rows: 4
      }
    }
  },
  {
    field: 'payout_verification_amount',
    label: '代付审核金额限制',
    search: {
      hidden: true
    },
    form: {
      component: 'Input',
      componentProps: {
        type: 'number',
        placeholder: '请输入'
      },
      formItemProps: {
        slots: {
          label: () => (
            <div class="flex text-12px items-center">
              <span class="leading-normal breack-all">代付审核金额限制</span>
              <ElTooltip content="为0则默认不开启" placement="top">
                <ElButton icon={InfoFilled} type="text" style={{ color: '#606266' }} />
              </ElTooltip>
            </div>
          )
        }
      },
      colProps: {
        span: 24
      }
    },
    table: {
      hidden: true
    }
  },
    {
    field: 'balance_reminder',
    label: '余额提醒阈值',
    search: {
      hidden: true
    },
    form: {
      component: 'Input',
      componentProps: {
        type: 'number',
        placeholder: '请输入'
      },
      // formItemProps: {
      //   slots: {
      //     label: () => (
      //       <div class="flex text-12px items-center">
      //         <span class="leading-normal breack-all">代付审核金额限制</span>
      //         <ElTooltip content="为0则默认不开启" placement="top">
      //           <ElButton icon={InfoFilled} type="text" style={{ color: '#606266' }} />
      //         </ElTooltip>
      //       </div>
      //     )
      //   }
      // },
      colProps: {
        span: 24
      }
    },
    table: {
      hidden: true
    }
  },
  {
    field: 'collect_money_switch',
    label: t('AddMerchantForm.collectionFunctionSwitch'),
    hidden: true,
    search: {
      hidden: true
    },
    form: {
      component: 'Switch',
      colProps: {
        span: 24
      }
    }
  },
  {
    field: 'paybehalf_switch',
    label: t('AddMerchantForm.paymentFunctionSwitch'),
    hidden: true,
    search: {
      hidden: true
    },
    form: {
      component: 'Switch',
      colProps: {
        span: 24
      }
    }
  },
  {
    field: 'is_test',
    label: '测试模式开关',
    hidden: true,
    search: {
      hidden: true
    },
    form: {
      component: 'Switch',
      colProps: {
        span: 24
      }
    }
  },
  {
    field: 'is_test_account',
    // label: '设置为测试账户',
    hidden: true,
    search: {
      hidden: true
    },
    form: {
      component: 'Switch',
      formItemProps: {
        slots: {
          label: () => (
            <div class="flex text-14px items-center">
              <span>设置为测试账户</span>

              <ElTooltip content="代收下单测试中显示该商户" placement="top">
                <ElButton icon={InfoFilled} type="text" style={{ color: '#606266' }} />
              </ElTooltip>
            </div>
          )
        }
      },
      colProps: {
        span: 24
      }
    }
  },
  {
    field: 'use_independent_domain',
    label: '使用独立子域名',
    hidden: true,
    search: {
      hidden: true
    },
    form: {
      component: 'Switch',
      colProps: {
        span: 24
      }
    }
  },

  {
    field: 'Operate',
    label: t('merchantList.operate'),
    // fixed: 'right',
    search: {
      hidden: true
    },
    form: {
      hidden: true
    },
    'min-width': 140,

    table: {
      slots: {
        default: (data: any) => {
          const row = data.row as MerchantListType
          return (
            <div style="display: flex; flex-wrap: wrap; justify-content: center; align-items: center;">
              {/* 商户金额调整权限 */}
              {hasPermi('merchantCharge') && (
                <>
                  <BaseButton type="text" onClick={() => action('filling', row)}>
                    {t('merchantList.internalFilling')}
                  </BaseButton>
                  <el-divider direction="vertical" class="w-[1px] h-[16px] bg-[#dfe6ec]" />
                </>
              )}

              {/* 商户金额调整权限 */}
              {hasPermi('merchantDeduction') && (
                <>
                  <BaseButton type="text" onClick={() => action('deduction', row)}>
                    扣费
                  </BaseButton>
                  <el-divider direction="vertical" class="w-[1px] h-[16px] bg-[#dfe6ec]" />
                </>
              )}

              {/* 商户信息 编辑 */}
              {hasPermi('merchantEdit') && (
                <>
                  <BaseButton
                    type="text"
                    style="margin-left: 0"
                    onClick={() => action('edit', row)}
                  >
                    {t('exampleDemo.edit')}
                  </BaseButton>
                  <el-divider direction="vertical" class="w-[1px] h-[16px] bg-[#dfe6ec]" />
                </>
              )}

              <ElDropdown
                trigger="click"
                v-slots={{
                  default: () => {
                    return <BaseButton type="text">{t('workplace.more')}</BaseButton>
                  },
                  dropdown: () => {
                    return (
                      <ElDropdownMenu>
                        {hasPermi('merchantCashflow') && (
                          <ElDropdownItem key={'cashFlow'} onClick={() => goToFundFlow(row.uuid)}>
                            {t('merchantList.cashFlow')}
                          </ElDropdownItem>
                        )}
                        {hasPermi('merchantCatReat') && (
                          <ElDropdownItem key={'rate'} onClick={() => showRate(row.uuid)}>
                            查看费率
                          </ElDropdownItem>
                        )}

                        {hasPermi('merchantClearLoginToken') && (
                          <ElDropdownItem
                            key={'clearLoginToken'}
                            onClick={() => clearLoginToken(row)}
                          >
                            {t('merchantList.clearLoginToken')}
                          </ElDropdownItem>
                        )}
                        {hasPermi('merchantCatGoogleCode') && (
                          <ElDropdownItem
                            key={'viewGoogleCode'}
                            onClick={() => getGoogleQrCode(row)}
                          >
                            {t('merchantList.viewGoogleCode')}
                          </ElDropdownItem>
                        )}
                        {hasPermi('merchantUpdateGoogleCode') && (
                          <ElDropdownItem
                            key={'updateGoogleCode'}
                            onClick={() => updateGoogleCode(row)}
                          >
                            {t('merchantList.updateGoogleCode')}
                          </ElDropdownItem>
                        )}
                        {hasPermi('merchantUpdateSecretKey') && (
                          <ElDropdownItem key={'updateKey'} onClick={() => updateSerkey(row)}>
                            {t('merchantList.updateKey')}
                          </ElDropdownItem>
                        )}

                        {hasPermi('merchantUpdatePwd') && (
                          <ElDropdownItem
                            key={'changePassword'}
                            onClick={() => changePassword(row)}
                          >
                            {t('common.changePassword')}
                          </ElDropdownItem>
                        )}
                        {hasPermi('merchantDel') && (
                          <ElDropdownItem key={'delete'} onClick={() => delData(row)}>
                            {t('merchantList.delete')}
                          </ElDropdownItem>
                        )}
                        <ElDropdownItem key={'create'} onClick={() => opencopyMerchantDialog(row)}>
                          复制并新建商户
                        </ElDropdownItem>
                        {hasPermi('MerchantSubManage') && (
                          <ElDropdownItem key={'account'} onClick={() => goToSubAccount(row.uuid)}>
                            子账户列表
                          </ElDropdownItem>
                        )}

                        {hasPermi('MerchantRole') && (
                          <ElDropdownItem key={'accountRole'} onClick={() => goToSubRole(row.uuid)}>
                            子账户角色管理
                          </ElDropdownItem>
                        )}

                        {hasPermi('merchantQcdlError') && (
                          <ElDropdownItem key={'QcdlError'} onClick={() => clearError(row)}>
                            清除登录错误限制
                          </ElDropdownItem>
                        )}
                      </ElDropdownMenu>
                    )
                  }
                }}
              ></ElDropdown>
            </div>
          )
        }
      }
    }
  }
])
const appStore = useAppStore()
const delData = async (row?: MerchantListType) => {
  const elTableExpose = await getElTableExpose()
  ids.value = row
    ? [row.uuid]
    : elTableExpose?.getSelectionRows().map((v: MerchantListType) => v.uuid) || []

  await delList(unref(ids).length)
}

const clearLoginToken = async (row?: MerchantListType) => {
  ElMessageBox.confirm(t('merchantList.confirmOperation'), t('common.delWarning'), {
    confirmButtonText: t('common.delOk'),
    cancelButtonText: t('common.delCancel'),
    type: 'warning'
  }).then(async () => {
    // appStore.pageLoading = true
    const res = await clearLogTokenApi([row?.uuid]).finally(() => {
      // appStore.pageLoading = false
    })
    if (res?.success) {
      ElMessage.success(t('common.successOperation'))
    } else {
      ElMessage.error(res.message)
    }
  })
}

const clearError = async (row?: MerchantListType) => {
  ElMessageBox.confirm(t('merchantList.confirmOperation'), t('common.delWarning'), {
    confirmButtonText: t('common.delOk'),
    cancelButtonText: t('common.delCancel'),
    type: 'warning'
  }).then(async () => {
    const res = await getSerkeyApi({
      action: 'ClearLoginErrorLimit',
      data_uuid: row?.uuid
    }).finally(() => {})
    if (res?.success) {
      ElMessage.success(t('common.successOperation'))
    } else {
      ElMessage.error(res.message)
    }
  })
}

const updateStatus = async (row?: MerchantListType) => {
  if (!hasPermi('merchantUpdateStatu')) {
    ElMessage.error('暂无权限!')
    return
  }
  ElMessageBox.confirm(t('merchantList.confirmOperation'), t('common.delWarning'), {
    confirmButtonText: t('common.delOk'),
    cancelButtonText: t('common.delCancel'),
    type: 'warning'
  }).then(async () => {
    // appStore.pageLoading = true
    const res = await updateMerchantStatusApi([row?.uuid]).finally(() => {
      // appStore.pageLoading = false
    })
    if (res?.success) {
      ElMessage.success(t('common.successOperation'))
    } else {
      ElMessage.error(res.message)
      return
    }
    getList()
  })
}
const getGoogleQrCode = async (row?: MerchantListType) => {
  // appStore.pageLoading = true
  const res = await getGoogleQrCodeApi([row?.uuid])
  googleQRSrc.value = res.data.generate_qrcode
  qrVisible.value = true
  // appStore.pageLoading = false
}

const updateGoogleCode = async (row?: MerchantListType) => {
  ElMessageBox.confirm(t('merchantList.confirmOperation'), t('common.delWarning'), {
    confirmButtonText: t('common.delOk'),
    cancelButtonText: t('common.delCancel'),
    type: 'warning'
  }).then(async () => {
    // appStore.pageLoading = true
    const res = await updateGoogleCodeApi([row?.uuid]).finally(() => {
      // appStore.pageLoading = false
    })
    if (res?.success) {
      ElMessage.success(t('common.successOperation'))
    } else {
      ElMessage.error(res.message)
      return
    }
    getList()
  })
}

const updateSerkey = async (row?: MerchantListType) => {
  ElMessageBox.confirm(t('merchantList.confirmOperation'), t('common.delWarning'), {
    confirmButtonText: t('common.delOk'),
    cancelButtonText: t('common.delCancel'),
    type: 'warning'
  }).then(async () => {
    const res = await updateSerkeyApi([row?.uuid]).finally(() => {
      appStore.pageLoading = false
    })
    if (res?.success) {
      ElMessage.success(t('common.successOperation'))
    } else {
      ElMessage.error(res.message)
      return
    }
    getList()
  })
}

const goToFundFlow = (muid) => {
  router.push(`/merchantmanagement/merchantlist/fundflow/${muid}`)
}

const goToSubAccount = (muid) => {
  router.push(`/merchantmanagement/merchantlist/merchantSubList/${muid}`)
}

const goToSubRole = (muid) => {
  router.push(`/merchantmanagement/merchantlist/merchantRoleList/${muid}`)
}

const action = (type: string, row?: MerchantListType) => {
  if (type === 'edit') {
    currentCountry.value = row?.country ?? ''
    currentCategory.value = row?.merchant_classify_uuid ?? ''
    dialogTitle.value = t('exampleDemo.edit')
    writeSchema.value = allSchemas.formSchema
  } else if (type === 'add') {
    currentCountry.value = ''
    currentCategory.value = ''
    dialogTitle.value = t('exampleDemo.edit')
    writeSchema.value = allSchemas.formSchema
  } else if (type === 'filling') {
    dialogTitle.value = t('merchantList.internalFilling')
    fillingSchemas = fillingSchemas.map((item) => {
      if (item.field === 'wallet_type_uuid') {
        const componentProps = { ...item.componentProps }
        if (row?.country) {
          componentProps.options = walletTypeOptions.value?.filter(
            (l) => l.country === row?.country
          )
        }
        return { ...item, componentProps }
      } else {
        return item
      }
    })
    writeSchema.value = fillingSchemas
  } else {
    dialogTitle.value = t('merchantList.deductionAmount')

    deductionSchemas = deductionSchemas.map((item) => {
      if (item.field === 'wallet_type_uuid') {
        const componentProps = { ...item.componentProps }
        if (row?.country) {
          componentProps.options = walletTypeOptions.value?.filter(
            (l) => l.country === row?.country
          )
        }
        return { ...item, componentProps }
      } else {
        return item
      }
    })

    writeSchema.value = deductionSchemas
  }
  actionType.value = type
  currentRow.value = row === undefined ? undefined : { ...row, password: '' }
  dialogVisible.value = true
  isHidden.value = !!row
  console.log(isEditMode.value)
}

const writeRef = ref<ComponentRef<typeof Write>>()

const saveLoading = ref(false)

const internalFilling = async () => {
  const write = unref(writeRef)
  const formData = await write?.submit()
  if (formData) {
    delete formData.balance_amount
    saveLoading.value = true
    try {
      const res = await internalFillingApi({ ...formData, note: formData?.filling_note })

      if (res?.success) {
        ElMessage.success(t('common.successOperation'))
      } else {
        ElMessage.error(res.message)
        return
      }
      dialogVisible.value = false
      getList()
    } catch (error) {
      console.log(error)
    } finally {
      saveLoading.value = false
    }
  }
}

const deductionAmount = async () => {
  const write = unref(writeRef)
  const formData = await write?.submit()

  const { kc_amount, de_note, wallet_type_uuid } = formData as Record<string, string>
  const newValue = {
    data_uuid: currentRow.value.uuid,
    kc_amount,
    note: de_note,
    wallet_type_uuid
  }

  if (formData) {
    saveLoading.value = true
    try {
      const res = await deductionAmountApi(newValue)
      if (!res.message) {
        ElMessage.success(t('common.successOperation'))
        dialogVisible.value = false
        getList()
      } else {
        ElMessage(t('common.failedOperation'))
      }
    } catch (error) {
      console.log(error)
    } finally {
      saveLoading.value = false
    }
  }
}

const submitChangePassword = async () => {
  const write = unref(writeRef)
  const formData = await write?.submit()

  if (!formData) return
  const newValues = {
    action: 'updatePwd',
    data_uuid: currentRow.value.uuid,
    password: formData.password,
    google_key: formData.google_code
  }

  try {
    saveLoading.value = true
    const res = await getSerkeyApi(newValues)

    if (res?.success) {
      dialogVisible.value = false
      ElMessage.success(t('common.successOperation'))
    } else {
      ElMessage.error(res.message)
      return
    }

    getList()
  } catch (error) {
    console.log(error)
  } finally {
    saveLoading.value = false
  }
}

const addCollectionChannel = async () => {
  const write = unref(writeRef)
  const formData = await write?.submit()
  if (formData) {
    saveLoading.value = true
    formData.collect_money_switch = formData.collect_money_switch ? '1' : ''
    formData.paybehalf_switch = formData.paybehalf_switch ? '1' : ''
    try {
      const res = await addMerchantApi(formData)

      if (res?.success) {
        ElMessage.success(t('common.successOperation'))
      } else {
        ElMessage.error(res.message)
        return
      }

      currentPage.value = 1
      getList()
      dialogVisible.value = false
    } catch (error) {
      console.log(error)
    } finally {
      saveLoading.value = false
    }
  }
}

const editCollectionChannel = async () => {
  const write = unref(writeRef)
  const formData = await write?.submit()
  if (formData) {
    saveLoading.value = true
    formData.collect_money_switch = formData.collect_money_switch ? '1' : ''
    formData.paybehalf_switch = formData.paybehalf_switch ? '1' : ''
    try {
      const res = await editMerchantApi(formData)
      if (res?.success) {
        ElMessage.success(t('common.successOperation'))
        dialogVisible.value = false
      } else {
        ElMessage.error(res.message)
        return
      }

      getList()
    } catch (error) {
      console.log(error)
    } finally {
      saveLoading.value = false
    }
  }
}

// @ts-ignore
const { allSchemas } = useCrudSchemas(crudSchemas)

const changePasswordSchemas = reactive<FormSchema[]>([
  {
    field: 'password',
    label: t('AddMerchantForm.password'),
    component: 'InputPassword',
    componentProps: {
      placeholder: t('AddMerchantForm.password'),
      showPassword: true
    },
    colProps: {
      span: 24
    }
  },
  {
    field: 'confirm_password',
    label: t('AddMerchantForm.confirmPassword'),
    component: 'InputPassword',
    componentProps: {
      placeholder: t('AddMerchantForm.confirmPassword'),
      showPassword: true
    },
    colProps: {
      span: 24
    }
  },
  {
    field: 'google_code',
    label: t('AddMerchantForm.googleCode'),
    component: 'Input',
    componentProps: {
      placeholder: t('AddMerchantForm.googleCode')
    },
    formItemProps: {
      slots: {
        label: () => (
          <div class="flex text-12px items-center">
            <span class="leading-normal breack-all">{t('AddMerchantForm.googleCode')}</span>
            <ElTooltip content="输入当前登录账户的google码" placement="top">
              <ElButton icon={InfoFilled} type="text" style={{ color: '#606266' }} />
            </ElTooltip>
          </div>
        )
      }
    },

    colProps: {
      span: 24
    }
  }
])

const changePassword = (row?: MerchantListType) => {
  dialogTitle.value = t('common.changePassword')
  writeSchema.value = changePasswordSchemas
  actionType.value = 'changePassword'
  currentRow.value = { ...row, password: '' }
  dialogVisible.value = true
}

const secretVisible = ref(false)
const secretFormRef = ref()
const showSecretModal = (row) => {
  if (!hasPermi('merchantCatSecretKey')) {
    ElMessage.error('暂无权限!')
    return
  }
  secretVisible.value = true
  currentRow.value = row
}

const updateSecret = async () => {
  const secretForm = unref(secretFormRef)
  const formData = await secretForm?.submit()
  if (!formData) return

  const newValues = {
    action: 'get_secret_key',
    data_uuid: currentRow.value.uuid,
    ...formData
  }

  try {
    const res = await getSerkeyApi(newValues)

    if (res?.success) {
      ElMessage.success(t('common.successOperation'))
      secretVisible.value = false
      ElMessageBox.alert(res.data.secret_key ?? '', '秘钥', {
        confirmButtonText: '确定'
      })
    } else {
      ElMessage.error(res.message)
      return
    }

    getList()
  } catch (error) {
    console.log(error)
  }
}
</script>

<template>
  <div>
    <ContentWrap class="search-section">
      <div class="log-search">
        <Search
          :schema="allSchemas.searchSchema"
          :show-add-merchant="hasPermi('merchantAdd')"
          @search="setSearchParams"
          @reset="setSearchParams"
          @add-merchant="action('add', undefined)"
        />
      </div>
    </ContentWrap>
    <ContentWrap :style="{ minHeight: '700px' }">
      <Table
        v-model:pageSize="pageSize"
        v-model:currentPage="currentPage"
        :columns="allSchemas.tableColumns"
        :data="dataList"
        :loading="loading"
        :pagination="{
          total: total
        }"
        @register="tableRegister"
      >
        <template #empty>
          <div style="text-align: center; padding: 40px; color: #999">
            <img src="@/assets/imgs/no_data.png" style="width: 120px" />
            <p style="line-height: 30px">{{ t('common.noData') }}</p>
          </div>
        </template>
      </Table>
    </ContentWrap>
    <Dialog v-model="qrVisible" :title="t('merchantList.googleQRCode')">
      <div class="flex justify-center items-center">
        <img :src="googleQRSrc" />
      </div>
      <template #footer>
        <BaseButton @click="qrVisible = false">{{ t('dialogDemo.close') }}</BaseButton>
      </template>
    </Dialog>
    <Dialog v-model="dialogVisible" :title="dialogTitle">
      <Write
        ref="writeRef"
        :form-schema="writeSchema"
        :current-row="currentRow"
        :is-edit="isEditMode"
      />
      <template #footer>
        <BaseButton
          v-if="actionType === 'edit'"
          type="primary"
          :loading="saveLoading"
          @click="editCollectionChannel"
        >
          {{ t('exampleDemo.save') }}
        </BaseButton>
        <BaseButton
          v-if="actionType === 'add'"
          type="primary"
          :loading="saveLoading"
          @click="addCollectionChannel"
        >
          {{ t('exampleDemo.save') }}
        </BaseButton>
        <BaseButton
          v-if="actionType === 'filling'"
          type="primary"
          :loading="saveLoading"
          @click="internalFilling"
        >
          {{ t('common.ok') }}
        </BaseButton>
        <BaseButton
          v-if="actionType === 'deduction'"
          type="primary"
          :loading="saveLoading"
          @click="deductionAmount"
        >
          {{ t('common.ok') }}
        </BaseButton>
        <BaseButton
          v-if="actionType === 'changePassword'"
          type="primary"
          :loading="saveLoading"
          @click="submitChangePassword"
        >
          {{ t('common.ok') }}
        </BaseButton>
        <BaseButton @click="dialogVisible = false">{{ t('dialogDemo.close') }}</BaseButton>
      </template>
    </Dialog>

    <Dialog v-model="secretVisible" title="查看商户秘钥" :max-height="200">
      <div class="mr-20px">
        <SecretForm ref="secretFormRef" />
      </div>
      <template #footer>
        <BaseButton type="primary" :loading="saveLoading" @click="updateSecret"> 提交 </BaseButton>

        <BaseButton @click="secretVisible = false">{{ t('dialogDemo.close') }}</BaseButton>
      </template>
    </Dialog>

    <Dialog v-model="rateVisible" title="查看商户费率" width="720px">
      <div class="mr-20px">
        <Table
          :columns="rateSchemas.tableColumns"
          :data="rateDataList"
          :style="{ height: '100%', margin: '10px' }"
          :loading="rateLoading"
        >
          <template #empty>
            <div style="text-align: center; padding: 40px; color: #999">
              <img src="@/assets/imgs/no_data.png" style="width: 120px" />
              <p style="line-height: 30px">{{ t('common.noData') }}</p>
            </div>
          </template>
        </Table>
      </div>
      <template #footer>
        <BaseButton @click="rateVisible = false">{{ t('dialogDemo.close') }}</BaseButton>
      </template>
    </Dialog>

    <Dialog v-model="copyMerchantVisible" title="复制并新建商户">
      <div class="mr-20px">
        <CopyMerchantForm ref="copyMerchantFormRef" :row="copyCurrentRow" />
      </div>
      <template #footer>
        <BaseButton type="primary" :loading="copyLoading" @click="savecopyMerchant">
          {{ t('exampleDemo.save') }}
        </BaseButton>
        <BaseButton @click="copyMerchantVisible = false">{{ t('dialogDemo.close') }}</BaseButton>
      </template>
    </Dialog>
  </div>
</template>
