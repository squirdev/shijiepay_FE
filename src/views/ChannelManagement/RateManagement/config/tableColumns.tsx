import { computed, watch, ref, type Ref } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { BaseButton } from '@/components/Button'
import { Decimal } from 'decimal.js'
import type { CrudSchema } from '@/hooks/web/useCrudSchemas'
import type { TunnelType } from '@/api/channelmanagement/types'
import { hasPermi } from '@/components/Permission'

interface Option {
  label: string
  value: string
  country?: string
}
/**
 * 表格列配置
 */
export const useTableColumns = (options: {
  countryOptions: Ref<Option[]>
  tunnelDatas: Ref<Option[]>
  currentRow: Ref<Record<string, any>>
  onEdit: (row: TunnelType) => void
  onDelete: (row: TunnelType) => void
}) => {
  const { t } = useI18n()
  const currentCountry = ref('')
  const searchCountry = ref('')

  watch(options.currentRow!, () => {
    currentCountry.value = options.currentRow.value?.country ?? ''
  })

  const filterSearchTunnelOptions = computed(() => {
    if (!searchCountry.value) return []
    return options.tunnelDatas.value.filter((l) => l.country === searchCountry.value)
  })

  const filterTunnelDatasOptions = computed(() => {
    if (!currentCountry.value) return []
    return options.tunnelDatas.value.filter((l) => l.country === currentCountry.value)
  })

  const crudSchemas: CrudSchema[] = [
    {
      field: 'country',
      label: t('AddMerchantForm.country') /* 国家 */,
      'min-width': 120,
      search: {
        component: 'Select',
        label: t('AddMerchantForm.country') /* 国家 */,
        componentProps: {
          placeholder: t('AddMerchantForm.selectCountry') /* 选择国家 */,
          options: options.countryOptions,
          onChange: (value) => {
            searchCountry.value = value
          }
        }
      },
      form: {
        component: 'Select',
        colProps: {
          span: 24
        },
        componentProps: {
          placeholder: t('AddMerchantForm.selectCountry') /* 选择国家 */,
          options: options.countryOptions,
          onChange: (value) => {
            currentCountry.value = value
          }
        }
      },
      formatter: (_: any, __: any, cellValue: string) => {
        const name = options.countryOptions.value.find((l) => l.value === cellValue)?.label
        return name ?? ''
      },
      detail: {
        span: 24
      }
    },
    {
      field: 'tunnel_uuid',
      label: '通道',
      search: {
        component: 'Select',
        componentProps: {
          placeholder: '选择通道',
          options: filterSearchTunnelOptions
        }
      },
      form: {
        component: 'Select',
        colProps: {
          span: 24
        },
        componentProps: {
          placeholder: '选择通道',
          options: filterTunnelDatasOptions
        }
      },
      formatter: (_: any, __: any, cellValue: string) => {
        const name = options.tunnelDatas.value.find((l) => l.value === cellValue)?.label
        return name ?? ''
      }
    },
    {
      field: 'name',
      label: '名称',
      form: {
        component: 'Input',
        colProps: {
          span: 24
        },
        componentProps: {
          placeholder: '请输入名称'
        }
      }
    },

    {
      field: 'rate',
      label: '费率 %',
      search: {
        hidden: true
      },
      table: {
        show: false
      },
      form: {
        component: 'InputNumber',
        colProps: {
          span: 24
        },
        componentProps: {
          min: 0,
          max: 100,
          placeholder: '请输入费率'
        }
      },
      formatter: (_: any, __: any, cellValue: string) => {
        return new Decimal(cellValue || 0).mul(100).toNumber()
      }
    },
    {
      field: 'operate',
      label: t('tableDemo.operate') /* 操作 */,
      fixed: 'right',
      search: {
        hidden: true
      },
      form: {
        hidden: true
      },
      table: {
        slots: {
          default: (data: any) => {
            const row = data.row as TunnelType
            return (
              <div style="display: flex; flex-wrap: wrap; justify-content: center; align-items: center;">
                {hasPermi('tunnelRateEdit') && (
                  <>
                    <BaseButton type="text" onClick={() => options.onEdit(row)}>
                      {t('exampleDemo.edit') /* 编辑 */}
                    </BaseButton>
                    <el-divider direction="vertical" class="w-[1px] h-[16px] bg-[#dfe6ec]" />
                  </>
                )}
                {hasPermi('tunnelRateDel') && (
                  <BaseButton type="text" onClick={() => options.onDelete(row)}>
                    {t('merchantList.delete') /* 删除 */}
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
