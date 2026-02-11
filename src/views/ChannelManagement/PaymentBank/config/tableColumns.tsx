import { h, type Ref } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { ElSwitch } from 'element-plus'
import { BaseButton } from '@/components/Button'
import { Decimal } from 'decimal.js'
import type { CrudSchema } from '@/hooks/web/useCrudSchemas'
import type { PaymentChannelType } from '@/api/channelmanagement/types'
import type { BankOption } from '../types'
import { hasPermi } from '@/components/Permission'

/**
 * 表格列配置
 */
export const useTableColumns = (options: {
  currentCountry: Ref<string>
  countryOptions: Ref<BankOption[]>
  walletTypeOptions: Ref<BankOption[]>
  filteredWalletTypeOptions: Ref<BankOption[]>
  onEdit: (row: PaymentChannelType) => void
  onRangeConfig: (row: PaymentChannelType) => void
  onStatusChange: (status: boolean, uuid: string) => void
}) => {
  const { t } = useI18n()

  const crudSchemas: CrudSchema[] = [
    {
      field: 'selection',
      width: 50,
      search: {
        hidden: true
      },
      form: {
        hidden: true
      },
      table: {
        type: 'selection'
      }
    },
    {
      field: 'merchant_name',
      label: t('merchantList.merchantName') /* 商户名称 */,
      search: {
        component: 'Input',
        componentProps: {
          placeholder: t('merchantList.merchantName') /* 商户名称 */
        }
      },
      form: {
        hidden: true
      }
    },
    {
      field: 'merchant_id',
      label: t('merchantList.merchantID') /* 商户ID */,
      search: {
        component: 'Input',
        label: t('merchantList.merchantID') /* 商户ID */,
        componentProps: {
          placeholder: t('merchantList.merchantID') /* 商户ID */
        }
      },
      form: {
        hidden: true
      },
      detail: {
        span: 24
      }
    },
    {
      field: 'bank_code',
      label: t('paymentBank.bankCode') /* 银行code */,
      form: {
        hidden: true
      },
      table: {
        hidden: true
      }
    },
    {
      field: 'country',
      label: t('AddMerchantForm.country') /* 国家 */,
      width: 120,
      search: {
        component: 'Select',
        label: t('AddMerchantForm.country') /* 国家 */,
        componentProps: {
          placeholder: t('AddMerchantForm.selectCountry') /* 选择国家 */,
          options: options.countryOptions,
          onChange: (value: string) => {
            options.currentCountry.value = value
          }
        }
      },
      form: { hidden: true },
      detail: {
        span: 24
      }
    },
    {
      field: 'bank_name',
      label: t('paymentBank.bankName') /* 银行名称 */,
      width: '300px',
      search: {
        hidden: true
      },
      form: {
        hidden: true
      }
    },
    {
      field: 'bank_code',
      label: t('paymentBank.bankCode') /* 银行code */,
      'min-width': 80,
      form: {
        hidden: true
      },
      search: { hidden: true }
    },
    {
      field: 'wallet_type_uuid',
      label: t('channelManagement.walletType') /* 交易钱包类型 */,
      search: {
        component: 'Select',
        componentProps: {
          placeholder: t('common.selectText') /* 请选择 */,
          options: options.filteredWalletTypeOptions
        }
      },
      form: {
        hidden: true
      },
      formatter: (_: any, __: any, cellValue: string) => {
        const name = options.walletTypeOptions.value?.find((l) => l.value === cellValue)?.label
        return name ?? ''
      }
    },
    {
      field: 'statu',
      label: t('tableDemo.state') /* 状态 */,
      'min-width': 80,
      search: {
        component: 'Select',
        componentProps: {
          placeholder: t('common.selectText') /* 请选择 */,
          options: [
            {
              label: t('searchDemo.open') /* 开启 */,
              value: true
            },
            {
              label: t('searchDemo.disable') /* 禁用 */,
              value: false
            }
          ],
          class: 'select-state'
        }
      },
      form: {
        hidden: true
      },
      table: {
        slots: {
          default: (data: any) => {
            const { statu, uuid } = data.row
            return h(ElSwitch, {
              class: 'mx-4px',
              modelValue: statu,
              onChange: (value: boolean) => options.onStatusChange(value, uuid)
            })
          }
        }
      }
    },
    {
      field: 'rate',
      label: t('paymentBank.rate') /* 费率 */,
      width: 120,
      search: {
        hidden: true
      },
      form: {
        component: 'InputNumber',
        colProps: {
          span: 24
        },
        componentProps: {
          placeholder: t('common.inputText') /* 请输入 */,
          min: 0,
          max: 100
        }
      },
      table: {
        formatter: (_: any, __: any, cellValue: number) => {
          return cellValue ? new Decimal(cellValue || 0).mul(100).toString() : 0
        }
      }
    },
    {
      field: 'interval_datas',
      label: t('paymentBank.intervalFee') /* 单笔区间费用 */,
      width: 240,
      search: {
        hidden: true
      },
      form: {
        hidden: true
      },
      table: {
        slots: {
          default: (data: any) => {
            const row = data.row
            return row?.interval_datas?.map((item: any, index: number) =>
              h('div', { key: `${data.uuid}-${index}` }, [
                t('paymentBank.interval') /* 区间 */,
                ': ',
                Number((item.start_amount || 0).toFixed(2)).toLocaleString(),
                ' ~ ',
                Number((item.end_amount || 0).toFixed(2)).toLocaleString(),
                ' ',
                t('paymentBank.fee') /* 费用 */,
                ': ',
                Number((item.amount || 0).toFixed(2)).toLocaleString()
              ])
            )
          }
        }
      }
    },
    {
      field: 'create_time',
      label: t('tableDemo.creationTime') /* 创建时间 */,
      width: '200px',
      search: {
        hidden: true
      },
      form: {
        hidden: true
      }
    },
    {
      field: 'update_time',
      label: t('paymentBank.updateTime') /* 最近修改时间 */,
      width: '200px',
      search: {
        hidden: true
      },
      form: {
        hidden: true
      }
    },
    {
      field: 'operate',
      label: t('tableDemo.operate') /* 操作 */,
      fixed: 'right',
      'min-width': 140,
      search: {
        hidden: true
      },
      form: {
        hidden: true
      },
      table: {
        slots: {
          default: (data: any) => {
            const row = data.row as PaymentChannelType
            return (
              <div style="display: flex; flex-wrap: wrap; justify-content: center; align-items: center;">
                {hasPermi('mchPayoutBankDeit') && (
                  <>
                    <BaseButton type="text" onClick={() => options.onEdit(row)}>
                      {t('exampleDemo.edit')}
                    </BaseButton>
                    <el-divider direction="vertical" class="w-[1px] h-[16px] bg-[#dfe6ec]" />
                  </>
                )}

                {hasPermi('mchPayoutBankFyqjpz') && (
                  <BaseButton type="text" onClick={() => options.onRangeConfig(row)}>
                    {t('paymentBank.rangeConfig')}
                  </BaseButton>
                )}
              </div>
            )
          }
        }
      }
    }
  ]

  return {
    crudSchemas
  }
}
