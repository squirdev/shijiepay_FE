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
import CreateForm from './CreateForm'

interface Option {
  label: string
  value: string
}

interface Step1FormData {
  three_party_uuid: string
  data_text: string
  order_amount: string
}

const BatchCreateModal = defineComponent({
  name: 'BatchCreateModal',
  props: {
    visible: {
      type: Boolean as PropType<boolean>,
      required: true
    },
    threePartyOptions: {
      type: Array as PropType<Option[]>,
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
    const activeStep = ref(0)
    const saveLoading = ref(false)
    const createFormRef = ref()
    const googleFormRef = ref<FormInstance>()

    const step1Data = ref<Step1FormData | null>(null)
    const step2Model = reactive({
      google_code: ''
    })

    const resetState = () => {
      activeStep.value = 0
      step1Data.value = null
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

    const closeDialog = () => {
      emit('update:visible', false)
    }

    const handleNext = async () => {
      const formData = await createFormRef.value?.submit()
      if (formData) {
        step1Data.value = formData
        activeStep.value = 1
      }
    }

    const handlePrev = () => {
      activeStep.value = 0
    }

    const handleSubmit = async () => {
      const valid = await googleFormRef.value?.validate()
      if (!valid) return

      if (!step1Data.value) {
        ElMessage.error('表单数据异常，请返回上一步重试')
        return
      }

      const verifyValues = {
        action: 'reqAddVerify',
        google_code: step2Model.google_code
      }

      const newValues = {
        action: 'addBatchDistributionData',
        token: '',
        ...step1Data.value
      }

      saveLoading.value = true
      try {
        const verifyRet = await batchDistributiontApi(verifyValues)

        if (!verifyRet.success) {
          ElMessage.error(verifyRet.message)
          return
        }

        newValues.token = verifyRet.data.token

        const res = await batchDistributiontApi(newValues)
        if (res?.success) {
          ElMessage.success(t('common.successOperation'))
          props.saveCallback()
          closeDialog()
        } else {
          ElMessageBox.alert(res.message ?? '操作失败', '提示', {
            confirmButtonText: '确定'
          })
        }
      } catch (error) {
        console.log(error)
      } finally {
        saveLoading.value = false
      }
    }

    return () => (
      <Dialog
        title="批量添加下发"
        modelValue={props.visible}
        onUpdate:modelValue={(val) => emit('update:visible', val)}
        onClosed={resetState} // 确保动画结束后重置
        v-slots={{
          footer: () => (
            <>
              {activeStep.value === 0 && (
                <>
                  <BaseButton type="primary" onClick={handleNext}>
                    下一步
                  </BaseButton>
                  <BaseButton onClick={closeDialog}>{t('dialogDemo.close')}</BaseButton>
                </>
              )}
              {activeStep.value === 1 && (
                <>
                  <BaseButton onClick={handlePrev}>上一步</BaseButton>
                  <BaseButton type="primary" loading={saveLoading.value} onClick={handleSubmit}>
                    提交
                  </BaseButton>
                  <BaseButton onClick={closeDialog}>{t('dialogDemo.close')}</BaseButton>
                </>
              )}
            </>
          )
        }}
      >
        <ElSteps
          active={activeStep.value}
          finish-status="success"
          simple
          style="margin-bottom: 20px;"
        >
          <ElStep title="填写表单" />
          <ElStep title="添加Google码" />
        </ElSteps>

        <div class="mr-20px">
          <div v-show={activeStep.value === 0}>
            <CreateForm ref={createFormRef} threePartyOptions={props.threePartyOptions} />
          </div>
          <div v-show={activeStep.value === 1}>
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
        </div>
      </Dialog>
    )
  }
})

export default BatchCreateModal
