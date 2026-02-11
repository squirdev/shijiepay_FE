import { defineComponent, PropType, watch, ref, reactive } from 'vue'
import { Dialog } from '@/components/Dialog'
import { BaseButton } from '@/components/Button'
import { useI18n } from '@/hooks/web/useI18n'
import { Table } from '@/components/Table'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import nodata from '@/assets/imgs/no_data.png'
import { ElButton, ElInput, ElMessage, ElSelect, ElSwitch, ElTooltip } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'
import { merchantClassificationApi } from '@/api/merchantmanagement'

interface Info {
  uuid: string
  name: string
  bank_code: string
  statu: boolean
  three_party_bank_code: string
  min_amount: number
  max_amount: number
}

interface Row {
  uuid: string
  mt_datas: any[]
  [key: string]: any
}

const ChannelConfig = defineComponent({
  name: 'ChannelConfig',
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
    const loading = ref(false)
    const saveLoading = ref(false)
    const dataList = ref<Info[]>([])
    const options = ref([])

    const fetchInfo = async (uuid: string) => {
      if (!uuid) return
      const newValues = {
        action: 'get_tunnel_rate_datas',
        data_uuid: uuid
      }
      try {
        loading.value = true
        const res = await merchantClassificationApi(newValues)

        if (!res.success) return
        options.value = res.data?.map((item) => ({
          label: item.name,
          value: item.uuid,
          tunnel_uuid: item.tunnel_uuid
        }))
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
          dataList.value = props.row?.mt_datas ?? []
          fetchInfo(props.row.uuid)
        }
      }
    )

    const crudSchemas = reactive<CrudSchema[]>([
      {
        field: 'tunnel_name',
        label: '通道名称'
      },
      {
        field: 'code',
        label: '通道code',
        width: 140
      },
      {
        field: 'statu',
        label: (
          <div class="flex items-center justify-center">
            <span>通道状态</span>
            <ElTooltip content="开启通道，必须选择费率" placement="top">
              <ElButton icon={InfoFilled} type="text" style={{ color: '#606266' }} />
            </ElTooltip>
          </div>
        ),
        width: 100,
        table: {
          slots: {
            default: (data: any) => {
              const status = data.row.statu
              return (
                <ElSwitch
                  class="mx-4px"
                  modelValue={status}
                  onChange={(value: boolean) => {
                    data.row.statu = value
                  }}
                />
              )
            }
          }
        }
      },
      {
        field: 'min_amount',
        label: (
          <div class="flex items-center justify-center">
            <span>接单最小</span>
            <ElTooltip content="不填写不限制" placement="top">
              <ElButton icon={InfoFilled} type="text" style={{ color: '#606266' }} />
            </ElTooltip>
          </div>
        ),
        width: 140,
        table: {
          slots: {
            default: (data: any) => {
              const { min_amount, uuid } = data.row
              return (
                <ElInput
                  type="number"
                  key={`amount_min_${uuid}`}
                  modelValue={min_amount}
                  onUpdate:modelValue={(v) => {
                    data.row.min_amount = v
                  }}
                />
              )
            }
          }
        }
      },
      {
        field: 'max_amount',
        label: (
          <div class="flex items-center justify-center">
            <span>接单最大</span>
            <ElTooltip content="不填写不限制" placement="top">
              <ElButton icon={InfoFilled} type="text" style={{ color: '#606266' }} />
            </ElTooltip>
          </div>
        ),
        width: 140,

        table: {
          slots: {
            default: (data: any) => {
              const { max_amount, uuid } = data.row
              return (
                <ElInput
                  type="number"
                  key={`amount_max_${uuid}`}
                  modelValue={max_amount}
                  onUpdate:modelValue={(v) => {
                    data.row.max_amount = v
                  }}
                />
              )
            }
          }
        }
      },
      {
        field: 'tunnel_rate_uuid',
        label: '费率',
        width: 120,
        table: {
          slots: {
            default: (data: any) => {
              const currentOptions =
                options.value.filter((l) => data.row?.tunnel_uuid === l.tunnel_uuid) ?? []

              return (
                <ElSelect
                  modelValue={data.row.tunnel_rate_uuid || ''}
                  onUpdate:modelValue={(val) => {
                    data.row.tunnel_rate_uuid = val
                  }}
                  options={currentOptions}
                />
              )
            }
          }
        }
      }
    ])

    const { allSchemas } = useCrudSchemas(crudSchemas)

    const closeDialog = () => {
      emit('update:modelValue', false)
    }

    const saveDialog = async () => {
      const newValues = {
        action: 'editClassifyTdInfo',
        data_uuid: props.row.uuid,
        datas: dataList.value.map((item) => ({
          mt_uuid: item.mt_uuid,
          statu: item.statu,
          tunnel_rate_uuid: item.tunnel_rate_uuid,
          min_amount: item.min_amount,
          max_amount: item.max_amount
        }))
      }

      for (const item of dataList.value) {
        if (
          !(+item.min_amount === 0 && +item.max_amount === 0) &&
          +item.min_amount >= +item.max_amount
        ) {
          ElMessage.error(`${item.name}接单最小值不能大于等于接单最大值!`)
          return
        }
      }

      try {
        saveLoading.value = true
        const res = await merchantClassificationApi(newValues)

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
        title="代付银行配置"
        modelValue={props.visible}
        // @ts-ignore
        width="900"
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

export default ChannelConfig
