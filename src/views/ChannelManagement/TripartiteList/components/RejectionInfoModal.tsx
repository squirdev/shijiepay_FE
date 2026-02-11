import { defineComponent, PropType, ref, watch } from 'vue'
import { Dialog } from '@/components/Dialog'
import { BaseButton } from '@/components/Button'
import { useI18n } from '@/hooks/web/useI18n'
import { ElInput, ElForm, ElFormItem, FormInstance, ElMessage } from 'element-plus'
import { createTripartApi } from '@/api/channelmanagement'

interface Row {
  uuid: string
  [key: string]: any
}

const RejectionInfoModal = defineComponent({
  name: 'RejectionInfoModal',
  props: {
    visible: {
      type: Boolean as PropType<boolean>,
      required: true,
      default: false
    },
    isBatch: {
      type: Boolean as PropType<boolean>,
      required: true,
      default: false
    },
    selectedIds: {
      type: Array as PropType<string[]>,
      required: true
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
    const saveLoading = ref(false)
    const baseFormRef = ref<FormInstance>()

    const modelValue = ref({
      set_rejection_information: ''
    })

    // 只在 visible 变为 true 时请求
    watch(
      () => props.visible,
      (newVal) => {
        if (newVal && props.row?.set_rejection_information) {
          modelValue.value.set_rejection_information = props.row?.set_rejection_information
        }
      }
    )

    const closeDialog = () => {
      emit('update:modelValue', false)
      modelValue.value.set_rejection_information = '' // Clear the field on close
    }

    const saveDialog = async () => {
      const formValid = await baseFormRef.value?.validate()
      if (!formValid) return

      let newValues = {
        action: 'update_set_rejection_information',
        data_uuid: props.row.uuid,
        set_rejection_information: modelValue.value.set_rejection_information
      }

      if (props.isBatch) {
        newValues = {
          action: 'batch_update_set_rejection_information',
          // @ts-ignore
          select_uuids: props.selectedIds,
          set_rejection_information: modelValue.value.set_rejection_information
        }
      }

      saveLoading.value = true
      try {
        const res = await createTripartApi(newValues)
        if (res.success) {
          ElMessage.success(t('common.successOperation'))
          props.saveCallback()
          closeDialog()
        } else {
          ElMessage.error(res?.message || t('common.failedOperation'))
        }
      } catch (error) {
        console.error('Failed to save rejection information:', error)
        ElMessage.error(t('common.failedOperation'))
      } finally {
        saveLoading.value = false
      }
    }

    return () => (
      <Dialog
        title={props.isBatch ? '批量修改驳回信息' : t('channelManagement.setRejectionInformation')}
        modelValue={props.visible}
        onUpdate:modelValue={(val) => emit('update:modelValue', val)}
        v-slots={{
          footer: () => (
            <>
              <BaseButton type="primary" loading={saveLoading.value} onClick={saveDialog}>
                {t('exampleDemo.save')}
              </BaseButton>
              <BaseButton onClick={closeDialog}>{t('dialogDemo.close')}</BaseButton>
            </>
          )
        }}
      >
        <div class="pl-4px">
          <div class="text-[#999] text-[13px] mb-[10px]">示例：三方返回信息=自动驳回信息</div>
          <ElForm model={modelValue} ref={baseFormRef} labelWidth="80px" labelPosition="right">
            <ElFormItem
              label={t('channelManagement.rejectionInformation')}
              prop="set_rejection_information"
              rules={[
                {
                  required: true,
                  message: t('common.inputText'),
                  trigger: ['blur', 'change']
                }
              ]}
            >
              <ElInput
                v-model={modelValue.value.set_rejection_information}
                type="textarea"
                rows={16}
                placeholder={t('common.inputText')}
              />
            </ElFormItem>
          </ElForm>
        </div>
      </Dialog>
    )
  }
})

export default RejectionInfoModal
