import { ElForm, ElFormItem, ElButton, FormInstance, ElMessage, ElInputNumber } from 'element-plus'
import { defineComponent, onMounted, PropType, ref } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'

import { useI18n } from '@/hooks/web/useI18n'

interface Row {
  uuid: string
  interval_datas: ValueItem[]
  [key: string]: any
}

interface ValueItem {
  id: string
  start_amount: number
  end_amount: number
  amount: number
}

interface Values {
  interval_datas: ValueItem[]
}

const FeeRangeForm = defineComponent({
  name: 'FeeRangeForm',
  props: {
    row: {
      type: Object as PropType<Row | undefined>,
      required: false,
      default: () => ({ uuid: undefined, interval_datas: [] })
    }
  },
  setup(props, { expose }) {
    const { t } = useI18n()
    const baseFormRef = ref<FormInstance>()

    const modelValue = ref<Values>({
      interval_datas: [
        { id: (Math.random() * 100000).toFixed(3), start_amount: 0, end_amount: 0, amount: 0 }
      ]
    })

    onMounted(() => {
      if (!props.row?.interval_datas) return
      const newDatas = props.row?.interval_datas?.map((item) => ({
        ...item,
        id: (Math.random() * 100000).toFixed(3)
      }))
      console.log(props.row, newDatas)
      modelValue.value = { interval_datas: newDatas ?? [] }
    })

    const submit = async () => {
      try {
        const valid = await baseFormRef.value?.validate()

        if (valid) {
          const newDatas = modelValue.value.interval_datas.map((item) => ({
            ...item,
            id: undefined
          }))
          return { interval_datas: newDatas }
        }
      } catch (error) {
        console.log(error)
      }
    }

    const headerOperate = (id?: string) => {
      if (id) {
        if (modelValue.value.interval_datas.length === 1) return
        modelValue.value.interval_datas = modelValue.value.interval_datas.filter((l) => l.id !== id)
        return
      }

      modelValue.value.interval_datas.push({
        id: (Math.random() * 100000).toFixed(3),
        start_amount: 0,
        end_amount: 0,
        amount: 0
      })
    }

    expose({
      submit
    })

    return () => (
      <ElForm model={modelValue} ref={baseFormRef} labelWidth="100px" labelPosition="right">
        {modelValue.value.interval_datas.map((item, index) => {
          return (
            <ElFormItem label={`金额区间${index + 1}`}>
              <div class="flex items-center">
                <ElInputNumber
                  placeholder="请输入区间起始金额"
                  controls-position="right"
                  modelValue={item.start_amount}
                  onUpdate:modelValue={(v) => (item['start_amount'] = v as number)}
                />
                <span class="mx-4px">~</span>
                <ElInputNumber
                  placeholder="请输入区间结束金额"
                  controls-position="right"
                  modelValue={item.end_amount}
                  onUpdate:modelValue={(v) => (item['end_amount'] = v as number)}
                />
                <ElInputNumber
                  placeholder="请输入费用金额"
                  controls-position="right"
                  class="ml-8px"
                  modelValue={item.amount}
                  onUpdate:modelValue={(v) => (item['amount'] = v as number)}
                />
                <ElButton class="ml-8px" icon={Delete} onClick={() => headerOperate(item.id)}>
                  删除
                </ElButton>
              </div>
            </ElFormItem>
          )
        })}
        <div class="ml-100px">
          <ElButton icon={Plus} style={{ width: '315px' }} onClick={() => headerOperate()}>
            添加
          </ElButton>
        </div>
      </ElForm>
    )
  }
})

export default FeeRangeForm
