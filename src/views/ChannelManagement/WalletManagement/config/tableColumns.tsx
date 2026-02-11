import { h, type Ref } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { BaseButton } from '@/components/Button'
import { Decimal } from 'decimal.js'
import type { CrudSchema } from '@/hooks/web/useCrudSchemas'
import type { WalletOption } from '../types'
import { hasPermi } from '@/components/Permission'

/**
 * 表格列配置
 */
export const useTableColumns = (options: {
  currentCountry: Ref<string>
  countryOptions: Ref<any[]>
  filteredWalletTypeOptions: Ref<WalletOption[]>
  onEdit: (row: any) => void
  onRangeConfig: (row: any) => void
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
      formatter: (_: any, __: any, cellValue: string) => {
        const name = options.countryOptions.value?.find((l) => l.value === cellValue)?.label
        return name ?? ''
      },
      detail: {
        span: 24
      }
    },
    {
      field: 'wallet_type_uuid',
      label: t('walletManagement.walletType') /* 钱包类型 */,
      width: '200px',
      search: {
        component: 'Select',
        componentProps: {
          placeholder: t('common.selectText') /* 请选择 */,
          options: options.filteredWalletTypeOptions
        }
      },
      form: { hidden: true },
      table: { hidden: true }
    },
    {
      field: 'wallet_name',
      label: t('walletManagement.walletType') /* 钱包类型 */,
      width: '200px',
      search: {
        hidden: true
      },
      form: { hidden: true }
    },

    {
      field: 'bank_name',
      label: t('paymentBank.bankName') /* 银行名称 */,
      width: '300px',
      search: {
        component: 'Input',
        componentProps: {
          placeholder: t('common.inputText') /* 请输入 */
        }
      },
      form: {
        hidden: true
      }
    },
    {
      field: 'bank_code',
      label: t('paymentBank.bankCode') /* 银行code */,
      search: {
        component: 'Input',
        componentProps: {
          placeholder: t('common.inputText') /* 请输入 */
        }
      },
      form: {
        hidden: true
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
      label: t('walletManagement.intervalFee') /* 区间费用 */,
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
      field: 'operate',
      label: t('tableDemo.operate') /* 操作 */,
      fixed: 'right',
      'min-width': 120,
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
            return (
              <div style="display: flex; flex-wrap: wrap; justify-content: center; align-items: center;">
                {hasPermi('walletEdit') && (
                  <>
                    <BaseButton type="text" onClick={() => options.onEdit(row)}>
                      {t('exampleDemo.edit')}
                    </BaseButton>

                    <el-divider direction="vertical" class="w-[1px] h-[16px] bg-[#dfe6ec]" />
                  </>
                )}

                {hasPermi('walletXgqjfy') && (
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
