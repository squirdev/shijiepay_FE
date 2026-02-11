import { defineComponent, PropType, watch, ref, reactive } from 'vue'
import { Dialog } from '@/components/Dialog'
import { BaseButton } from '@/components/Button'
import { useI18n } from '@/hooks/web/useI18n'
import { Table } from '@/components/Table'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { createTripartApi, getWalletManageList } from '@/api/channelmanagement'
import nodata from '@/assets/imgs/no_data.png'
import { Decimal } from 'decimal.js'
import { ElInput, ElMessage, ElSelect, ElOption, ElSwitch, ElTooltip, ElButton } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'

interface Info {
  uuid: string
  name: string
  bank_code: string
  statu: boolean
  three_party_bank_code: string
}

interface Row {
  uuid: string
  [key: string]: any
}

interface Option {
  label: string
  value: string
  country?: string
}

interface ConfigItem {
  tunnel_name: string
  tunnel_uuid: string
  rate: string
  statu: string
  mapping_param: string
  amount_max: number
  amount_min: number
  wallet_type_uuid: string
  daily_limit_count: number
}
interface TestInfo {
  order_id: string
  mch_datas: Option[]
  countryTunnelDatas: Record<'tunnel_name' | 'tunnel_uuid', string>[]
}

const CollectionkConfig = defineComponent({
  name: 'CollectionkConfig',
  props: {
    visible: {
      type: Boolean as PropType<boolean>,
      required: true,
      default: false
    },
    row: {
      type: Object as PropType<Row>,
      required: true,
      default: () => ({ uuid: undefined })
    },
    saveCallback: {
      type: Function as PropType<Function>,
      required: true
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const { t } = useI18n()
    const loading = ref(true)
    const saveLoading = ref(false)
    const dataList = ref<ConfigItem[]>([])
    const walletTypeOptions = ref<Option[]>([])

    const fetchInfo = async (uuid: string) => {
      if (!uuid) return
      const newValues = {
        action: 'getCountryTunnelDatas',
        data_uuid: uuid
      }

      try {
        loading.value = true

        const res = await Promise.all([getWalletManageList({}), createTripartApi(newValues)])

        walletTypeOptions.value =
          Object.values(res[0]?.data)
            ?.map((item: any) => ({
              label: item.name,
              value: item.uuid,
              country: item.country
            }))
            ?.filter((l) => l.country === props.row.country) ?? []

        dataList.value =
          res[1]?.data?.countryTunnelDatas?.map((item) => ({
            ...item,
            rate: Decimal(item.rate ?? 0)
              .mul(100)
              .toNumber()
          })) ?? []
      } catch (error) {
        console.log(error)
      } finally {
        loading.value = false
      }
    }

    // 只在 visible 变为 true 时请求
    watch(
      () => props.visible,
      (newVal) => {
        if (newVal && props.row?.uuid) {
          fetchInfo(props.row.uuid)
        }
      }
    )

    const configRowSchemas = reactive<CrudSchema[]>([
      {
        field: 'tunnel_name',
        label: t('channelManagement.name') /* 名称 */,
        width: 120
      },
      {
        field: 'code',
        label: t('channelManagement.systemChannelCode') /* 系统通道编码 */,
        width: 120
      },
      {
        field: 'statu',
        label: t('merchantList.state'),
        width: 80,
        table: {
          slots: {
            default: (data: any) => {
              return <ElSwitch class="mx-4px" v-model={data.row.statu} />
            }
          }
        }
      },
      {
        field: 'rate',
        label: '三方费率' /* TODO 费率% */,
        width: 120,
        table: {
          slots: {
            default: (data: any) => {
              return <ElInput v-model={data.row.rate} type="number" />
            }
          }
        }
      },
      {
        field: 'mapping_param',
        label: t('channelManagement.mappingThirdPartyCode') /* 映射三方编码 */,
        width: 120,
        table: {
          slots: {
            default: (data: any) => {
              return <ElInput v-model={data.row.mapping_param} />
            }
          }
        }
      },

      {
        field: 'wallet_type_uuid',
        label: '交易钱包' /* TODO*/,
        width: 140,
        table: {
          slots: {
            default: (data: any) => {
              return (
                <ElSelect v-model={data.row.wallet_type_uuid}>
                  {walletTypeOptions.value?.map((item) => (
                    <ElOption key={item.value} value={item.value} label={item.label} />
                  ))}
                </ElSelect>
              )
            }
          }
        }
      },
      {
        field: 'amount_min',
        label: '收款最小' /* TODO*/,
        width: 140,
        table: {
          slots: {
            default: (data: any) => {
              return <ElInput v-model={data.row.amount_min} type="number" />
            }
          }
        }
      },
      {
        field: 'amount_max',
        label: '收款最大' /* TODO*/,
        width: 140,
        table: {
          slots: {
            default: (data: any) => {
              return <ElInput v-model={data.row.amount_max} type="number" />
            }
          }
        }
      },
      {
        field: 'daily_limit_count',
        label: '单日限制笔数' /* TODO*/,
        width: 140,
        table: {
          slots: {
            default: (data: any) => {
              return <ElInput v-model={data.row.daily_limit_count} type="number" />
            },
            header: () => (
              <div class="flex text-12px items-center">
                <span class="w-[80px] leading-normal breack-all">单日限制笔数</span>
                <ElTooltip content="为0时候不限制" placement="top">
                  <ElButton icon={InfoFilled} type="text" style={{ color: '#606266' }} />
                </ElTooltip>
              </div>
            )
          }
        }
      }
    ])

    const { allSchemas } = useCrudSchemas(configRowSchemas)

    const closeDialog = () => {
      emit('update:modelValue', false)
    }

    const saveDialog = async () => {
      for (const item of dataList.value) {
        if (
          !(+item.amount_min === 0 && +item.amount_max === 0) &&
          +item.amount_min >= +item.amount_max
        ) {
          ElMessage.error(`${item.tunnel_name}最小收款金额不能大于等于最大收款金额!`)
          return
        }
      }

      const newValues = {
        action: 'updateCountryTunnelDatas',
        data_uuid: props.row.uuid,
        countryTunnelDatas: dataList.value.map((l) => ({
          tunnel_uuid: l.tunnel_uuid,
          rate: new Decimal(l.rate || 0).dividedBy(100).toNumber(),
          statu: l.statu,
          mapping_param: l.mapping_param,
          amount_max: +l.amount_max,
          amount_min: +l.amount_min,
          wallet_type_uuid: l.wallet_type_uuid,
          daily_limit_count: l.daily_limit_count
        }))
      }

      try {
        saveLoading.value = true
        const res = await createTripartApi(newValues)

        if (res.success) {
          ElMessage.success(t('common.successOperation'))
          props.saveCallback()
        } else {
          ElMessage.error(res?.message || t('common.failedOperation'))
        }
      } catch (error) {
        console.log(error)
      } finally {
        saveLoading.value = false
      }
    }

    return () => (
      <Dialog
        title="代收通道配置"
        modelValue={props.visible}
        // @ts-ignore
        width="1200"
        onUpdate:modelValue={(val) => emit('update:modelValue', val)}
        v-slots={{
          footer: () => (
            <>
              <BaseButton type="primary" onClick={saveDialog}>
                {t('exampleDemo.save')}
              </BaseButton>
              <BaseButton onClick={closeDialog}>{t('dialogDemo.close')}</BaseButton>
            </>
          )
        }}
      >
        <div class="pl-4px">
          <Table
            columns={allSchemas.tableColumns}
            data={dataList.value}
            loading={loading.value}
            v-slots={{
              empty: () => (
                <div style="text-align: center; padding: 40px; color: #999">
                  <img src={nodata} style="width: 120px" />
                  <p style="line-height: 30px">{t('common.noData')}</p>
                </div>
              )
            }}
          ></Table>
        </div>
      </Dialog>
    )
  }
})

export default CollectionkConfig
