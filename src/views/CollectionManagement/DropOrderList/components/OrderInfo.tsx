import { ElTimeline, ElTimelineItem } from 'element-plus'
import { defineComponent, PropType, watch, ref, onMounted } from 'vue'
import { Dialog } from '@/components/Dialog'
import { BaseButton } from '@/components/Button'
import { useI18n } from '@/hooks/web/useI18n'
import { collectionOrderApi } from '@/api/collectionmanagement'

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
      const res = await collectionOrderApi(newValues)

      if (!res.success) return
      infoData.value = res.datas
    }

    // onMounted(() => {
    //   fetchInfo(props.row.uuid)
    // })
    // console.log(3333, props)

    // 只在 visible 变为 true 时请求
    watch(
      () => props.detailVisible,
      (newVal) => {
        if (newVal && props.row?.uuid) {
          fetchInfo(props.row.uuid)
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
        <div class="pl-4px">
          <ElTimeline>
            {infoData.value.map((item, index) => (
              <ElTimelineItem key={index} timestamp={item.time} type="primary">
                {item.text}
              </ElTimelineItem>
            ))}
          </ElTimeline>
        </div>
      </Dialog>
    )
  }
})

export default OrderInfo
