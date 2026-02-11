import { ElTimeline, ElTimelineItem } from 'element-plus'
import { defineComponent, PropType, watch, ref, onMounted } from 'vue'
import { Dialog } from '@/components/Dialog'
import { BaseButton } from '@/components/Button'
import { useI18n } from '@/hooks/web/useI18n'
import nodata from '@/assets/imgs/no_data.png'
import { fetchPayoutApi } from '@/api/paymentmanagement'

interface Info {
  text: string
  time: string
}

interface Row {
  uuid: string
  [key: string]: any
}

const OrderInfo = defineComponent({
  name: 'OrderInfo',
  props: {
    detailVisible: {
      type: Boolean as PropType<boolean>,
      required: true,
      default: false
    },
    row: {
      type: Object as PropType<Row>,
      required: true,
      default: () => ({ uuid: undefined })
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const { t } = useI18n()
    const loading = ref(true)
    const infoData = ref<Info[]>([])

    const closeDialog = () => {
      emit('update:modelValue', false)
    }

    const fetchInfo = async (uuid: string) => {
      if (!uuid) return
      const newValues = {
        action: 'orderProcess',
        data_uuid: uuid
      }
      try {
        const res = await fetchPayoutApi(newValues)

        if (!res.success) return
        infoData.value = res.data ?? []
      } catch (error) {
        console.log(error)
      } finally {
        loading.value = false
      }
    }

    // 只在 visible 变为 true 时请求
    watch(
      () => props.detailVisible,
      (newVal) => {
        if (newVal && props.row?.uuid) {
          fetchInfo(props.row.uuid)
        }

        if (!newVal) {
          infoData.value = []
        }
      }
    )

    return () => (
      <Dialog
        title="订单流程"
        modelValue={props.detailVisible}
        // @ts-ignore
        onUpdate:modelValue={(val) => emit('update:modelValue', val)}
        v-slots={{
          footer: () => <BaseButton onClick={closeDialog}>{t('dialogDemo.close')}</BaseButton>
        }}
      >
        <div v-loading={[loading.value]}>
          {!infoData.value.length && (
            <div style="text-align: center; padding: 40px; color: #999">
              <img src={nodata} style="width: 120px" />
              <p style="line-height: 30px">{t('common.noData')}</p>
            </div>
          )}
          {!!infoData.value.length && (
            <div class="pl-4px">
              <ElTimeline>
                {infoData.value.map((item, index) => (
                  <ElTimelineItem key={index} timestamp={item.time} type="primary">
                    {item.text}
                  </ElTimelineItem>
                ))}
              </ElTimeline>
            </div>
          )}
        </div>
      </Dialog>
    )
  }
})

export default OrderInfo
