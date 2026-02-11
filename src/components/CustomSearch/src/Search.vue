<script setup lang="tsx">
import { Form, FormSchema, FormSetProps } from '@/components/Form'
import { PropType, computed, unref, ref, watch, onMounted, useSlots } from 'vue'
import { propTypes } from '@/utils/propTypes'
import { useForm } from '@/hooks/web/useForm'
import { findIndex } from '@/utils'
import { cloneDeep, set } from 'lodash-es'
import { initModel } from '@/components/Form/src/helper'
import ActionButton from './components/ActionButton.vue'
import { SearchProps } from './types'
import { FormItemProp } from 'element-plus'
import { isObject, isEmptyVal } from '@/utils/is'
import { useI18n } from '@/hooks/web/useI18n'
// import { getProp } from 'element-plus/es/utils'

const { t } = useI18n()

const props = defineProps({
  // 生成Form的布局结构数组
  schema: {
    type: Array as PropType<FormSchema[]>,
    default: () => []
  },
  // 是否需要栅格布局
  isCol: propTypes.bool.def(false),
  // 表单label宽度
  labelWidth: propTypes.oneOfType([String, Number]).def('auto'),
  // 操作按钮风格位置
  layout: propTypes.string.validate((v: string) => ['inline', 'bottom'].includes(v)).def('inline'),
  // 底部按钮的对齐方式
  buttonPosition: propTypes.string
    .validate((v: string) => ['left', 'center', 'right'].includes(v))
    .def('center'),
  showSearch: propTypes.bool.def(true),
  showTotal: propTypes.bool.def(false),
  showExportData: propTypes.bool.def(false),
  showReset: propTypes.bool.def(true),
  showExpand: propTypes.bool.def(false),
  showAddAccount: propTypes.bool.def(false),
  showAddBankcard: propTypes.bool.def(false),
  showApplySettlement: propTypes.bool.def(false),
  showAddRole: propTypes.bool.def(false),
  showAdd: propTypes.bool.def(false),
  showExportOrderData: propTypes.bool.def(false),
  showAddChannel: propTypes.bool.def(false),
  showAddMerchant: propTypes.bool.def(false),
  showAddMerchantCategory: propTypes.bool.def(false),
  showOrderStatistics: propTypes.bool.def(false),
  expandField: propTypes.string.def(''),
  inline: propTypes.bool.def(true),
  removeNoValueItem: propTypes.bool.def(true),
  model: {
    type: Object as PropType<Recordable>,
    default: () => ({})
  },
  searchLoading: propTypes.bool.def(false),
  resetLoading: propTypes.bool.def(false),
  showBatchOpen: propTypes.bool.def(false),
  showBatchClose: propTypes.bool.def(false),
  showBatchRate: propTypes.bool.def(false),
  showBatchFee: propTypes.bool.def(false)
})

const emit = defineEmits([
  'search',
  'reset',
  'register',
  'validate',
  'add-account',
  'add-role',
  'add',
  'export-data',
  'export-order-data',
  'order-statistics',
  'add-bankcard',
  'apply-settlement',
  'add-channel',
  'add-merchant-category',
  'add-merchant',
  'total',
  'show-batch-open',
  'show-batch-close',
  'show-batch-rate',
  'show-batch-fee'
])

const slots = useSlots()

const visible = ref(true)

// 表单数据
const formModel = ref<Recordable>(props.model)

const newSchema = computed(() => {
  const propsComputed = unref(getProps)
  let schema: FormSchema[] = cloneDeep(propsComputed.schema)
  if (propsComputed.showExpand && propsComputed.expandField && !unref(visible)) {
    const index = findIndex(schema, (v: FormSchema) => v.field === propsComputed.expandField)
    schema.map((v, i) => {
      if (i >= index) {
        v.hidden = true
      } else {
        v.hidden = false
      }
      return v
    })
  }
  if (propsComputed.layout === 'inline') {
    schema = schema.concat([
      {
        field: 'action',
        formItemProps: {
          labelWidth: '0px',
          slots: {
            default: () => {
              return (
                <div class="inline-flex">
                  <ActionButton
                    showSearch={propsComputed.showSearch}
                    showReset={propsComputed.showReset}
                    showExpand={propsComputed.showExpand}
                    showTotal={propsComputed.showTotal}
                    showAdd={propsComputed.showAdd}
                    showAddAccount={propsComputed.showAddAccount}
                    showAddBankcard={propsComputed.showAddBankcard}
                    showApplySettlement={propsComputed.showApplySettlement}
                    showAddRole={propsComputed.showAddRole}
                    showExportOrderData={propsComputed.showExportOrderData}
                    showExportData={propsComputed.showExportData}
                    showOrderStatistics={propsComputed.showOrderStatistics}
                    showAddChannel={propsComputed.showAddChannel}
                    showAddMerchant={propsComputed.showAddMerchant}
                    showAddMerchantCategory={propsComputed.showAddMerchantCategory}
                    searchLoading={propsComputed.searchLoading}
                    resetLoading={propsComputed.resetLoading}
                    visible={visible.value}
                    onExpand={setVisible}
                    onReset={reset}
                    onSearch={search}
                    onExport-order-data={onExportOrderData}
                    onExport-data={onExportData}
                    onOrder-statistics={onOrderStatistics}
                    onAdd-account={onAddAccount}
                    onAdd-role={onAddRole}
                    onAdd={onAdd}
                    onAdd-bankcard={onAddBankcard}
                    onApply-settlement={onApplySettlement}
                    onAdd-channel={onAddChannel}
                    onAdd-merchant-category={onAddMerchantCategory}
                    onAdd-merchant={onAddMerchant}
                    onTotal={onTotal}
                    showBatchFee={propsComputed.showBatchFee}
                    showBatchRate={propsComputed.showBatchRate}
                    onShow-batch-fee={onShowBatchFee}
                    onShow-batch-rate={onShowBatchRate}
                    showBatchOpen={propsComputed.showBatchOpen}
                    showBatchClose={propsComputed.showBatchClose}
                    onShow-batch-open={onShowBatchOpen}
                    onShow-batch-close={onShowBatchClose}
                  />
                  {slots?.moreBtn?.()}
                </div>
              )
            },
            label: () => {
              return <span>&nbsp;</span>
            }
          }
        }
      }
    ])
  }
  return schema
})

const { formRegister, formMethods } = useForm()
const { getElFormExpose, getFormData, getFormExpose } = formMethods

// useSearch传入的props
const outsideProps = ref<SearchProps>({})

const mergeProps = ref<SearchProps>({})

const getProps = computed(() => {
  const propsObj = { ...props }
  Object.assign(propsObj, unref(mergeProps))
  return propsObj
})

const setProps = (props: SearchProps = {}) => {
  mergeProps.value = Object.assign(unref(mergeProps), props)
  // @ts-ignore
  outsideProps.value = props
}

const schemaRef = ref<FormSchema[]>([])

// 监听表单结构化数组，重新生成formModel
watch(
  () => unref(newSchema),
  async (schema = []) => {
    formModel.value = initModel(schema, unref(formModel))
    schemaRef.value = schema
  },
  {
    immediate: true,
    deep: true
  }
)

const filterModel = async () => {
  const model = await getFormData()
  if (unref(getProps).removeNoValueItem) {
    // 使用reduce过滤空值，并返回一个新对象
    return Object.keys(model).reduce((prev, next) => {
      const value = model[next]
      if (!isEmptyVal(value)) {
        if (isObject(value)) {
          if (Object.keys(value).length > 0) {
            prev[next] = value
          }
        } else {
          prev[next] = value
        }
      }
      return prev
    }, {})
  }
  return model
}

const search = async () => {
  const elFormExpose = await getElFormExpose()
  await elFormExpose?.validate(async (isValid) => {
    if (isValid) {
      const model = await filterModel()
      emit('search', model)
    }
  })
}

const reset = async () => {
  const elFormExpose = await getElFormExpose()
  elFormExpose?.resetFields()
  const model = await filterModel()
  emit('reset', model)
}

const onExportOrderData = async () => {
  emit('export-order-data')
}

const onOrderStatistics = async () => {
  emit('order-statistics')
}

const onAddAccount = async () => {
  emit('add-account')
}

const onAddRole = async () => {
  emit('add-role')
}

const onAdd = async () => {
  emit('add')
}

const onAddBankcard = async () => {
  emit('add-bankcard')
}

const onAddChannel = async () => {
  emit('add-channel')
}

const onAddMerchant = async () => {
  emit('add-merchant')
}

const onTotal = async () => {
  emit('total')
}

const onExportData = async () => {
  emit('export-data')
}

const onApplySettlement = async () => {
  emit('apply-settlement')
}

const onAddMerchantCategory = async () => {
  emit('add-merchant-category')
}

const onShowBatchOpen = () => {
  emit('show-batch-open')
}

const onShowBatchClose = () => {
  emit('show-batch-close')
}

const onShowBatchRate = () => {
  emit('show-batch-rate')
}
const onShowBatchFee = () => {
  emit('show-batch-fee')
}

const bottomButtonStyle = computed(() => {
  return {
    textAlign: unref(getProps).buttonPosition as unknown as 'left' | 'center' | 'right'
  }
})

const setVisible = async () => {
  visible.value = !unref(visible)
}

const setSchema = (schemaProps: FormSetProps[]) => {
  const { schema } = unref(getProps)
  for (const v of schema) {
    for (const item of schemaProps) {
      if (v.field === item.field) {
        set(v, item.path, item.value)
      }
    }
  }
}

// 对表单赋值
const setValues = async (data: Recordable = {}) => {
  formModel.value = Object.assign(props.model, unref(formModel), data)
  const formExpose = await getFormExpose()
  formExpose?.setValues(data)
}

const delSchema = (field: string) => {
  const { schema } = unref(getProps)

  const index = findIndex(schema, (v: FormSchema) => v.field === field)
  if (index > -1) {
    schema.splice(index, 1)
  }
}

const addSchema = (formSchema: FormSchema, index?: number) => {
  const { schema } = unref(getProps)
  if (index !== void 0) {
    schema.splice(index, 0, formSchema)
    return
  }
  schema.push(formSchema)
}

const defaultExpose = {
  getElFormExpose,
  setProps,
  setSchema,
  setValues,
  delSchema,
  addSchema,
  getFormData
}

onMounted(() => {
  emit('register', defaultExpose)
})

defineExpose(defaultExpose)

const onFormValidate = (prop: FormItemProp, isValid: boolean, message: string) => {
  emit('validate', prop, isValid, message)
}
</script>

<template>
  <div class="flex items-center mb-[16px] text-[14px] text-[#000] font-bold">
    <span class="w-[4px] h-[16px] bg-[#429df7] mr-[10px] rounded-full"></span>
    {{ t('common.searchBar') }}
  </div>
  <Form
    :model="formModel"
    :is-custom="false"
    :label-width="getProps.labelWidth"
    hide-required-asterisk
    :inline="getProps.inline"
    :is-col="getProps.isCol"
    :schema="schemaRef"
    @register="formRegister"
    @validate="onFormValidate"
  />

  <template v-if="layout === 'bottom'">
    <div :style="bottomButtonStyle">
      <ActionButton
        :show-reset="getProps.showReset"
        :show-search="getProps.showSearch"
        :show-expand="getProps.showExpand"
        :show-total="getProps.showTotal"
        :show-export-data="getProps.showExportData"
        :show-add-account="getProps.showAddAccount"
        :show-add-bankcard="getProps.showAddBankcard"
        :show-apply-settlement="getProps.showApplySettlement"
        :show-add-role="getProps.showAddRole"
        :show-add="getProps.showAdd"
        :show-add-channel="getProps.showAddChannel"
        :show-add-merchant="getProps.showAddMerchant"
        :show-add-merchant-category="getProps.showAddMerchantCategory"
        :show-export-order-data="getProps.showExportOrderData"
        :show-order-statistics="getProps.showOrderStatistics"
        :search-loading="getProps.searchLoading"
        :reset-loading="getProps.resetLoading"
        :visible="visible"
        :show-batch-open="getProps.showBatchOpen"
        :show-batch-close="getProps.showBatchClose"
        :show-batch-rate="getProps.showBatchRate"
        :show-batch-fee="getProps.showBatchFee"
        @expand="setVisible"
        @reset="reset"
        @search="search"
        @export-order-data="onExportOrderData"
        @order-statistics="onOrderStatistics"
        @add-account="onAddAccount"
        @add-role="onAddRole"
        @add="onAdd"
        @add-bankcard="onAddBankcard"
        @add-channel="onAddChannel"
        @apply-settlement="onApplySettlement"
        @add-merchant-category="onAddMerchantCategory"
        @add-merchant="onAddMerchant"
        @total="onTotal"
        @export-data="onExportData"
        @show-batch-open="onShowBatchOpen"
        @show-batch-close="onShowBatchClose"
        @show-batch-rate="onShowBatchRate"
        @show-batch-fee="onShowBatchFee"
      />
      <slot name="moreBtn"></slot>
    </div>
  </template>
</template>
