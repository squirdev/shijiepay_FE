import { reactive } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import {
  ElSwitch,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElTooltip,
  ElButton
} from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'
import { BaseButton } from '@/components/Button'
import type { CrudSchema } from '@/hooks/web/useCrudSchemas'
import type { TableColumn } from '@/components/Table'
import { hasPermi } from '@/components/Permission'

/**
 * 表格列配置
 */
export const useTableColumns = (options: {
  countryOptions: any
  payModuleOptions: any
  filteredModuleOptions: any
  currentCountry: any
  handleStatusChange: (row: any, values: any) => void
  payoutStatusChange: (action: string, data_uuid: string) => void
  openDialog: (type: 'add' | 'edit', row?: any) => void
  handleUpdateBalance: (row: any) => void
  handleDelete: (row: any) => void
  showConfigModal: (row: any) => void
  showBankModal: (row: any) => void
  showSecretModal: (row: any) => void
  showInfoModal: (row: any) => void
  showCollectionTestModal: (row: any) => void
  showNegotiationTestModal: (row: any) => void
  showCopyConfigModal: (row: any) => void
  showRejectInfoModal: (row: any) => void
  showEditSettingsModal: (row: any) => void
}) => {
  const { t } = useI18n()

  const crudSchemas = reactive<CrudSchema[]>([
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
      field: 'name',
      label: t('channelManagement.tripartName') /* 三方名称 */,
      width: 140,
      search: {
        hidden: false
      },
      form: {
        component: 'Input',
        colProps: {
          span: 24
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
          options: options.countryOptions,
          onChange: (value: string) => {
            options.currentCountry.value = value
          }
        },
        colProps: {
          span: 24
        }
      },
      formatter: (_: any, __: TableColumn, cellValue: string) => {
        const name = options.countryOptions.value?.find((l) => l.value === cellValue)?.label
        return name ?? ''
      },
      detail: {
        span: 24
      }
    },
    {
      field: 'module_code',
      label: '模块',
      width: 120,
      search: {
        hidden: true
      },
      form: {
        component: 'Select',
        label: '模块',
        componentProps: {
          placeholder: t('common.selectText') /* 请选择 */,
          options: options.filteredModuleOptions
        },
        colProps: {
          span: 24
        }
      },
      formatter: (_: any, __: TableColumn, cellValue: string) => {
        const name = options.payModuleOptions.value?.find((l) => l.value === cellValue)?.label
        return name ?? ''
      },
      detail: {
        span: 24
      }
    },
    {
      field: 'mch_id',
      label: t('tripartiteList.upstreamID') /* 上游分配ID */,
      'min-width': 140,
      form: {
        component: 'Input',
        colProps: {
          span: 24
        }
      },
      search: { hidden: true },
      table: { hidden: true }
    },
    {
      field: 'mch_secretkey',
      label: t('tripartiteList.upstreamKey') /* 上游秘钥 */,
      form: {
        component: 'Input',
        colProps: {
          span: 24
        }
      },
      search: {
        hidden: true
      },
      table: {
        hidden: true
      }
    },
    {
      field: 'mch_secretkey2',
      label: '上游秘钥2',
      //
      form: {
        component: 'Input',
        colProps: {
          span: 24
        },
        formItemProps: {
          slots: {
            label: () => (
              <div class="flex text-12px items-center">
                <span class="leading-normal breack-all">上游秘钥2</span>
                <ElTooltip content="备用，当三方对接需要两个密钥的时候使用" placement="top">
                  <ElButton icon={InfoFilled} type="text" style={{ color: '#606266' }} />
                </ElTooltip>
              </div>
            )
          }
        }
      },
      search: {
        hidden: true
      },
      table: {
        hidden: true
      }
    },

    {
      field: 'mch_account',
      label: t('tripartiteList.upstreamAccount') /* 上游商户账户 */,
      form: {
        component: 'Input',
        colProps: {
          span: 24
        }
      },
      search: {
        hidden: true
      },
      table: {
        hidden: true
      }
    },
    {
      field: 'mch_password',
      label: t('tripartiteList.upstreamPassword') /* 上游商户密码 */,
      form: {
        component: 'Input',
        colProps: {
          span: 24
        }
      },
      search: {
        hidden: true
      },
      table: {
        hidden: true
      }
    },
    {
      field: 'mch_login_url',
      label: t('tripartiteList.upstreamLoginUrl') /* 上游商户登陆地址 */,
      form: {
        component: 'Input',
        colProps: {
          span: 24
        }
      },
      search: {
        hidden: true
      },
      table: {
        hidden: true
      }
    },
    {
      field: 'balance_amount',
      label: t('tableDemo.balance') /* 余额 */,
      table: {
        formatter: (_: any, __: TableColumn, cellValue: number) => {
          return cellValue ? Number(cellValue.toFixed(2)).toLocaleString() : 0
        }
      },
      form: {
        hidden: true
      },
      search: {
        hidden: true
      }
    },
    {
      field: 'payout_statu',
      label: t('tripartiteList.payout') /* 代付 */,
      'min-width': 70,
      search: {
        hidden: true
      },
      form: {
        hidden: true
      },
      table: {
        slots: {
          default: (data: any) => {
            const status = data.row.payout_statu
            return (
              <ElSwitch
                class="mx-4px"
                modelValue={status}
                onChange={(value: boolean) =>
                  options.handleStatusChange(data.row, { payout_statu: value })
                }
              />
            )
          }
        }
      }
    },
    {
      field: 'payment_statu',
      label: t('tripartiteList.payment') /* 代收 */,
      'min-width': 70,
      search: {
        hidden: true
      },
      form: {
        hidden: true
      },
      table: {
        slots: {
          default: (data: any) => {
            const status = data.row.payment_statu
            return (
              <ElSwitch
                class="mx-4px"
                modelValue={status}
                onChange={(value: boolean) =>
                  options.handleStatusChange(data.row, { payment_statu: value })
                }
              />
            )
          }
        }
      }
    },
    {
      field: 'payout_zdzf_statu',
      label: '接受转发',
      'min-width': 70,
      search: {
        hidden: true
      },
      form: {
        hidden: true
      },
      table: {
        slots: {
          default: (data: any) => {
            const { payout_zdzf_statu, uuid } = data.row
            return (
              <ElSwitch
                class="mx-4px"
                modelValue={payout_zdzf_statu}
                onChange={(value: boolean) =>
                  options.payoutStatusChange('update_payout_zdzf_statu', uuid)
                }
              />
            )
          }
        }
      }
    },
    {
      field: 'payout_zdzf_statu',
      label: '开启请求',
      'min-width': 70,
      search: {
        hidden: true
      },
      form: {
        hidden: true
      },
      table: {
        slots: {
          default: (data: any) => {
            const { payout_qqsfxd_statu, uuid } = data.row
            return (
              <ElSwitch
                class="mx-4px"
                modelValue={payout_qqsfxd_statu}
                onChange={(value: boolean) =>
                  options.payoutStatusChange('update_payout_qqsfxd_statu', uuid)
                }
              />
            )
          }
        }
      }
    },

    {
      field: 'payout_znjdqjdd_statu',
      label: '开启区间接单',
      'min-width': 70,
      search: {
        hidden: true
      },
      form: {
        hidden: true
      },
      table: {
        slots: {
          default: (data: any) => {
            const { payout_znjdqjdd_statu, uuid } = data.row
            return (
              <ElSwitch
                class="mx-4px"
                modelValue={payout_znjdqjdd_statu}
                onChange={(value: boolean) =>
                  options.payoutStatusChange('update_payout_znjdqjdd_statu', uuid)
                }
              />
            )
          }
        }
      }
    },
    {
      field: 'callback_ip',
      label: t('tripartiteList.callbackIP') /* 回调IP */,
      search: {
        hidden: true
      },
      form: {
        component: 'Input',
        componentProps: {
          type: 'textarea',
          placeholder: t('channelManagement.placeIpWhitelist') /* 回调IP白名单/一行一个 */,
          rows: 4
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
      field: 'time',
      label: t('paymentManagement.time') /* 时间 */,
      'min-width': 120,
      search: {
        hidden: true
      },
      form: {
        hidden: true
      },
      table: {
        hidden: true,
        slots: {
          default: (data: any) => {
            const { create_time, update_time } = data.row
            const newCreateTime = create_time?.includes(' ')
              ? create_time?.split(' ')?.[1]
              : create_time
            const newUpdateTime = update_time?.includes(' ')
              ? update_time?.split(' ')?.[1]
              : update_time

            return (
              <div class="flex flex-col items-center gap-[10px]">
                {create_time && (
                  <ElTooltip content="创建时间" placement="right">
                    <BaseButton>{create_time}</BaseButton>
                  </ElTooltip>
                )}
                {update_time && (
                  <ElTooltip content="最后修改时间" placement="right">
                    <BaseButton class="!m-0">{update_time}</BaseButton>
                  </ElTooltip>
                )}
              </div>
            )
          }
        }
      }
    },
    {
      field: 'payout_statu',
      label: t('tripartiteList.payout') /* 代付 */,
      search: {
        hidden: true
      },
      form: {
        component: 'Switch',
        colProps: {
          span: 24
        }
      },
      table: {
        hidden: true
      }
    },
    {
      field: 'payment_statu',
      label: t('tripartiteList.payment') /* 代收 */,
      search: {
        hidden: true
      },
      form: {
        component: 'Switch',
        colProps: {
          span: 24
        }
      },
      table: {
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
        }
      },
      table: {
        hidden: true
      }
    },
    {
      field: 'success_rate',
      label: (
        <div class="flex items-center justify-center">
          <span>成功率</span>
          <ElTooltip content="5分钟内代收成功率" placement="top">
            <ElButton icon={InfoFilled} type="text" style={{ color: '#606266' }} />
          </ElTooltip>
        </div>
      ),
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
      // fixed: 'right',
      'min-width': 210,
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
              <div style="display: flex; flex-wrap: wrap; justify-content: center; align-items: center; operate">
                {hasPermi('threePartyPaymentTdPz') && (
                  <>
                    <BaseButton
                      style={{ padding: '6px 5px !important' }}
                      type="text"
                      onClick={() => options.showConfigModal(row)}
                    >
                      {t('tripartiteList.collectionConfig') /* 代收通道配置 */}
                    </BaseButton>
                    <el-divider direction="vertical" class="w-[1px] h-[16px] bg-[#dfe6ec]" />
                  </>
                )}
                {hasPermi('threePartyPayountYThPz') && (
                  <>
                    <BaseButton
                      style={{ padding: '6px 5px !important' }}
                      type="text"
                      onClick={() => options.showBankModal(row)}
                    >
                      {t('tripartiteList.payoutBankConfig') /* 代付银行配置 */}
                    </BaseButton>
                    <el-divider direction="vertical" class="w-[1px] h-[16px] bg-[#dfe6ec]" />
                  </>
                )}

                {hasPermi('threePartyDfjdpz') && (
                  <>
                    <BaseButton
                      style={{ padding: '6px 5px !important' }}
                      type="text"
                      onClick={() => options.showEditSettingsModal(row)}
                    >
                      接单配置
                    </BaseButton>
                    <el-divider direction="vertical" class="w-[1px] h-[16px] bg-[#dfe6ec]" />
                  </>
                )}

                {hasPermi('threePartyUpdateBalance') && (
                  <>
                    <BaseButton
                      style={{ padding: '6px 5px !important' }}
                      type="text"
                      onClick={() => options.handleUpdateBalance(row)}
                    >
                      {t('channelManagement.updateBalance') /* 更新余额 */}
                    </BaseButton>
                    <el-divider direction="vertical" class="w-[1px] h-[16px] bg-[#dfe6ec]" />
                  </>
                )}

                <ElDropdown
                  trigger="click"
                  v-slots={{
                    default: () => {
                      return <BaseButton type="text">{t('workplace.more') /* 更多 */}</BaseButton>
                    },
                    dropdown: (scope) => {
                      return (
                        <ElDropdownMenu>
                          {hasPermi('threePartyEdit') && (
                            <ElDropdownItem onClick={() => options.openDialog('edit', row)}>
                              {t('exampleDemo.edit') /* 编辑 */}
                            </ElDropdownItem>
                          )}

                          {hasPermi('threePartyDel') && (
                            <ElDropdownItem
                              key={`del-${row.uuid}`}
                              onClick={() => options.handleDelete(row)}
                            >
                              {t('merchantList.delete') /* 删除 */}
                            </ElDropdownItem>
                          )}

                          {hasPermi('threePartyCatMy') && (
                            <ElDropdownItem
                              key={`viewSecret-${row.uuid}`}
                              onClick={() => options.showSecretModal(row)}
                            >
                              {t('tripartiteList.viewSecret') /* 查看密钥 */}
                            </ElDropdownItem>
                          )}

                          {hasPermi('threePartyDjxx') && (
                            <ElDropdownItem
                              key={`info-${row.uuid}`}
                              onClick={() => options.showInfoModal(row)}
                            >
                              {t('tripartiteList.viewDockingInfo') /* 查看对接信息 */}
                            </ElDropdownItem>
                          )}
                          {hasPermi('threePartyPaymentDsXdTest') && (
                            <ElDropdownItem
                              key={`test-${row.uuid}`}
                              onClick={() => options.showCollectionTestModal(row)}
                            >
                              {t('tripartiteList.collectionTest') /* 代收下单测试 */}
                            </ElDropdownItem>
                          )}

                          {hasPermi('threePartyPaymentDfXdTest') && (
                            <ElDropdownItem
                              key={`testpayment-${row.uuid}`}
                              onClick={() => options.showNegotiationTestModal(row)}
                            >
                              {t('tripartiteList.negotiationTest') /* 代付下单测试 */}
                            </ElDropdownItem>
                          )}
                          {/* TODO */}
                          <ElDropdownItem
                            key={`copyconfig-${row.uuid}`}
                            onClick={() => options.showCopyConfigModal(row)}
                          >
                            复制配置并新建
                          </ElDropdownItem>
                          {hasPermi('threePartyPzBhxx') && (
                            <ElDropdownItem
                              key={`configInfo-${row.uuid}`}
                              onClick={() => options.showRejectInfoModal(row)}
                            >
                              配置驳回信息
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

  return {
    crudSchemas
  }
}
