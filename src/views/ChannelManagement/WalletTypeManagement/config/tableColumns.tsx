import { h, type Ref } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { BaseButton } from '@/components/Button'
import type { CrudSchema } from '@/hooks/web/useCrudSchemas'
import { hasPermi } from '@/components/Permission'

/**
 * 表格列配置
 */
export const useTableColumns = (options: {
  countryOptions: Ref<any[]>
  onEdit: (row: any) => void
  onDelete?: (row: any) => void
}) => {
  const { t } = useI18n()

  const crudSchemas: CrudSchema[] = [
    {
      field: 'name',
      label: t('walletType.walletName') /* 钱包名称 */,
      width: '200px',
      search: {
        component: 'Input',
        componentProps: {
          placeholder: t('common.inputText') /* 请输入 */
        }
      },
      form: {
        component: 'Input',
        colProps: {
          span: 24
        },
        componentProps: {
          placeholder: t('walletType.walletName') /* 钱包名称 */
        }
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
          options: options.countryOptions
        }
      },
      form: {
        component: 'Select',
        label: t('AddMerchantForm.country') /* 国家 */,
        componentProps: {
          placeholder: t('AddMerchantForm.selectCountry') /* 选择国家 */,
          options: options.countryOptions
        },
        colProps: {
          span: 24
        }
      },
      formatter: (_: any, __: any, cellValue: string) => {
        const name = options.countryOptions.value?.find((l) => l.value === cellValue)?.label
        return name ?? ''
      },
      detail: {
        span: 24
      }
    },
    {
      field: 'code',
      label: t('walletType.walletCode') /* 钱包编码 */,
      search: {
        hidden: true
      },
      form: {
        component: 'Input',
        colProps: {
          span: 24
        },
        componentProps: {
          placeholder: t('walletType.walletCode') /* 钱包编码 */
        }
      }
    },
    {
      field: 'create_time',
      label: t('walletType.addTime') /* 添加时间 */,
      width: '200px',
      search: {
        hidden: true
      },
      form: {
        hidden: true
      }
    },
    {
      field: 'note',
      label: t('tableDemo.remark') /* 备注 */,
      search: {
        component: 'Input',
        componentProps: {
          placeholder: t('channelManagement.remark') /* 备注 */
        }
      },
      form: {
        component: 'Input',
        colProps: {
          span: 24
        },
        componentProps: {
          placeholder: t('channelManagement.remark') /* 备注 */
        }
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
                {hasPermi('WalletTypesEdit') && (
                  <BaseButton type="text" onClick={() => options.onEdit(row)}>
                    {t('exampleDemo.edit')}
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
