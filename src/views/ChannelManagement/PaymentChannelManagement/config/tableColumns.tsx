import { h, type Ref } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { ElSwitch } from 'element-plus'
import { BaseButton } from '@/components/Button'
import type { CrudSchema } from '@/hooks/web/useCrudSchemas'
import type { TunnelType } from '@/api/channelmanagement/types'
import { hasPermi } from '@/components/Permission'

/**
 * 表格列配置
 */
export const useTableColumns = (options: {
  countryOptions: Ref<any[]>
  onEdit: (row: TunnelType) => void
  onDelete: (row: TunnelType) => void
  onStatusChange: (row: TunnelType) => void
  showConfigModal: (row: TunnelType) => void
}) => {
  const { t } = useI18n()

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
          options: options.countryOptions
        }
      },
      form: {
        component: 'Select',
        colProps: {
          span: 24
        },
        componentProps: {
          placeholder: t('AddMerchantForm.selectCountry') /* 选择国家 */,
          options: options.countryOptions
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
      field: 'tunnel_name',
      label: t('tableDemo.channelName') /* 渠道名称 */,
      'min-width': '160px',
      form: {
        component: 'Input',
        colProps: {
          span: 24
        },
        componentProps: {
          placeholder: t('tableDemo.channelName') /* 渠道名称 */
        }
      }
    },
    {
      field: 'code',
      label: t('tableDemo.channelCode') /* 渠道编码 */,
      'min-width': '160px',
      form: {
        component: 'Input',
        colProps: {
          span: 24
        },
        componentProps: {
          placeholder: t('tableDemo.channelCode') /* 渠道编码 */
        }
      }
    },
    {
      field: 'tunnel_statu',
      label: t('tableDemo.channelStatus') /* 渠道状态 */,
      search: {
        hidden: true
      },
      form: { hidden: true },
      'min-width': '160px',
      slots: {
        default: (data: any) => {
          const status = data.row.tunnel_statu
          return h(ElSwitch, {
            class: 'mx-4px',
            modelValue: status,
            onChange: () => options.onStatusChange(data.row)
          })
        }
      }
    },
    {
      field: 'note',
      label: t('merchantList.remark') /* 备注 */,
      'min-width': 160,
      search: {
        hidden: false
      },
      table: {
        show: false
      },
      form: {
        component: 'Input',
        colProps: {
          span: 24
        },
        componentProps: {
          placeholder: t('merchantList.remark') /* 备注 */
        }
      }
    },
    {
      field: 'operate',
      label: t('tableDemo.operate') /* 操作 */,
      fixed: 'right',
      'min-width': 160,
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
                {hasPermi('tunnleManageEdit') && (
                  <>
                    <BaseButton type="text" onClick={() => options.onEdit(row)}>
                      {t('exampleDemo.edit') /* 编辑 */}
                    </BaseButton>
                    <el-divider direction="vertical" class="w-[1px] h-[16px] bg-[#dfe6ec]" />
                  </>
                )}
                {hasPermi('tunnleManageDel') && (
                  <>
                    <BaseButton type="text" onClick={() => options.onDelete(row)}>
                      {t('merchantList.delete') /* 删除 */}
                    </BaseButton>
                    <el-divider direction="vertical" class="w-[1px] h-[16px] bg-[#dfe6ec]" />
                  </>
                )}
                {hasPermi('tunnleManageQzPz') && (
                  <BaseButton type="text" onClick={() => options.showConfigModal(row)}>
                    权重配置 {/** TODO 翻译 */}
                  </BaseButton>
                )}
              </div>
            )
            return h(
              'div',
              {
                style:
                  'display: flex; flex-wrap: wrap; justify-content: center; align-items: center'
              },
              [
                h(
                  BaseButton,
                  {
                    type: 'text',
                    onClick: () => options.onEdit(row)
                  },
                  () => t('exampleDemo.edit') /* 编辑 */
                ),
                h('el-divider', {
                  direction: 'vertical',
                  class: 'w-[1px] h-[16px] bg-[#dfe6ec]'
                }),
                h(
                  BaseButton,
                  {
                    type: 'text',
                    onClick: () => options.onDelete(row)
                  },
                  () => t('merchantList.delete') /* 删除 */
                )
              ]
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
