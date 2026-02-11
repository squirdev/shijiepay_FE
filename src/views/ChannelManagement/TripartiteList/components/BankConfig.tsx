import { defineComponent, PropType, watch, ref, reactive } from 'vue'
import { Dialog } from '@/components/Dialog'
import { BaseButton } from '@/components/Button'
import { useI18n } from '@/hooks/web/useI18n'
import { Table } from '@/components/Table'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { createTripartApi } from '@/api/channelmanagement'
import nodata from '@/assets/imgs/no_data.png'
import { ElButton, ElInput, ElMessage, ElSelect, ElSwitch, ElTooltip } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'

interface Info {
  uuid: string
  name: string
  bank_code: string
  statu: boolean
  three_party_bank_code: string
  amount_min: number
  amount_max: number
}

interface Row {
  uuid: string
  [key: string]: any
}

const BankConfig = defineComponent({
  name: 'BankConfig',
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

    const fetchInfo = async (uuid: string) => {
      if (!uuid) return
      const newValues = {
        action: 'getBankDatas',
        data_uuid: uuid
      }
      try {
        loading.value = true
        const res = await createTripartApi(newValues)

        if (!res.success) return
        dataList.value = res.data
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

    const crudSchemas = reactive<CrudSchema[]>([
      {
        field: 'name',
        label: '银行名称'
      },
      {
        field: 'bank_code',
        label: '银行code',
        width: 140
      },
      {
        field: 'statu',
        label: '开启状态',
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
        field: 'three_party_bank_code',
        label: '三方银行code',
        width: 140,
        table: {
          slots: {
            default: (data: any) => {
              const { three_party_bank_code, uuid } = data.row
              return (
                <ElInput
                  key={`three_party_bank_code_${uuid}`}
                  modelValue={three_party_bank_code}
                  onUpdate:modelValue={(v) => {
                    data.row.three_party_bank_code = v
                  }}
                />
              )
            }
          }
        }
      },
      {
        field: 'amount_min',
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
              const { amount_min, uuid } = data.row
              return (
                <ElInput
                  type="number"
                  key={`amount_min_${uuid}`}
                  modelValue={amount_min}
                  onUpdate:modelValue={(v) => {
                    data.row.amount_min = v
                  }}
                />
              )
            }
          }
        }
      },
      {
        field: 'amount_max',
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
              const { amount_max, uuid } = data.row
              return (
                <ElInput
                  type="number"
                  key={`amount_max_${uuid}`}
                  modelValue={amount_max}
                  onUpdate:modelValue={(v) => {
                    data.row.amount_max = v
                  }}
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
        action: 'updateThreePartyBankcode',
        data_uuid: props.row.uuid,
        bank_datas: dataList.value.map((item) => ({
          uuid: item.uuid,
          statu: item.statu,
          three_party_bank_code: item.three_party_bank_code,
          amount_min: item.amount_min,
          amount_max: item.amount_max
        }))
      }

      for (const item of dataList.value) {
        if (
          !(+item.amount_min === 0 && +item.amount_max === 0) &&
          +item.amount_min >= +item.amount_max
        ) {
          ElMessage.error(`${item.name}接单最小值不能大于等于接单最大值!`)
          return
        }
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

export default BankConfig
