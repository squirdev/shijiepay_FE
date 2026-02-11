import { defineComponent, PropType, ref, reactive, watch } from 'vue'
import { Dialog } from '@/components/Dialog'
import { BaseButton } from '@/components/Button'
import { useI18n } from '@/hooks/web/useI18n'
import { batchDistributiontApi } from '@/api/paymentmanagement'
import {
  ElSteps,
  ElStep,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  FormInstance,
  ElMessageBox
} from 'element-plus'

interface Step1FormData {
  three_party_uuid: string
  data_text: string
  order_amount: string
}

const BatchReviewModal = defineComponent({
  name: 'BatchReviewModal',
  props: {
    visible: {
      type: Boolean as PropType<boolean>,
      required: true
    },
    ids: {
      type: Array as PropType<string[]>,
      required: true
    },
    saveCallback: {
      type: Function as PropType<() => void>,
      required: true
    }
  },
  emits: ['update:visible'],
  setup(props, { emit }) {
    const { t } = useI18n()

    const saveLoading = ref(false)
    const googleFormRef = ref<FormInstance>()
    const scientist_uuid = ref<string[]>([])

    const step2Model = reactive({
      google_code: ''
    })

    const resetState = () => {
      step2Model.google_code = ''
      googleFormRef.value?.resetFields()
    }

    watch(
      () => props.visible,
      (newVal) => {
        if (!newVal) {
          // 在对话框关闭时重置状态
          resetState()
        }
      }
    )

    watch(
      () => props.ids,
      (newVal) => {
        if (newVal) {
          scientist_uuid.value = props.ids
        }
      }
    )

    const closeDialog = () => {
      emit('update:visible', false)
    }

    const handleSubmit = async () => {
      const valid = await googleFormRef.value?.validate()
      if (!valid) return

      const newValues = {
        action: 'critical_science_core',
        select_uuids: scientist_uuid.value,
        google_code: step2Model.google_code
      }

      saveLoading.value = true
      try {
        const res = await batchDistributiontApi(newValues)
        if (res?.success) {
          ElMessage.success(t('common.successOperation'))
          props.saveCallback()
          closeDialog()
        } else {
          ElMessage.error(res.message ?? '操作失败')
        }
      } catch (error) {
        console.log(error)
      } finally {
        saveLoading.value = false
      }
    }

    return () => (
      <Dialog
        title="批量审核"
        modelValue={props.visible}
        onUpdate:modelValue={(val) => emit('update:visible', val)}
        onClosed={resetState} // 确保动画结束后重置
        v-slots={{
          footer: () => (
            <>
              <BaseButton type="primary" loading={saveLoading.value} onClick={handleSubmit}>
                提交
              </BaseButton>
              <BaseButton onClick={closeDialog}>{t('dialogDemo.close')}</BaseButton>
            </>
          )
        }}
      >
        <div class="mr-20px">
          <ElForm model={step2Model} ref={googleFormRef} labelWidth="100px" labelPosition="right">
            <ElFormItem
              label="Google码"
              prop="google_code"
              rules={{ required: true, message: '请输入Google码', trigger: ['blur', 'change'] }}
            >
              <ElInput v-model={step2Model.google_code} placeholder="请输入当前账户的Google码" />
            </ElFormItem>
          </ElForm>
        </div>
      </Dialog>
    )
  }
})

export default BatchReviewModal
