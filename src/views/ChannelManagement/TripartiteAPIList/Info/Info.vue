<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { ref, reactive } from 'vue'
import { Breadcrumb } from '@/components/Breadcrumb'
import {
  ElForm,
  ElFormItem,
  ElCol,
  ElInput,
  ElSelect,
  ElOption,
  ElButton,
  ElMessage,
  ElSwitch,
  ElTooltip
} from 'element-plus'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import qs from 'qs'
import {
  getTripartAPIInfo,
  updateTripartAPIInfo,
  getEncryptTypesApi
} from '@/api/channelmanagement'
import {
  paymentList,
  defalutBaseModelValue,
  defalutDynamicModelValue,
  defaultResModelValue,
  defaultHeaderModelValue,
  getDefaultFixedModelValue,
  getFormItemList,
  getProcessFixedModelValue
} from './common'
import type { FormInstance } from 'element-plus'

interface Option {
  label: string
  value: string
}

const route = useRoute()

const { t } = useI18n()

const payType = route.params.type as string

const currentRow = ref<any>({})
const encryptTypeOptions = ref<Option[]>([])

const fetchEncryptTypes = async () => {
  const res = await getEncryptTypesApi({})

  if (!res.success) return

  encryptTypeOptions.value = res.data?.map((item) => ({ label: item.name, value: item.code }))
}

const fetchTripartApiInfo = async () => {
  const res = await getTripartAPIInfo(route.params.muid)

  if (!res.success) return
  currentRow.value = res.data
  const {
    api_url,
    request_method,
    encrypt_type,
    is_null_value_encrypt,
    header_column,
    fields_col,
    add_fields,
    return_data
  } = res.data
  baseModelValue.value = {
    ...defalutBaseModelValue,
    api_url,
    request_method,
    encrypt_type,
    is_null_value_encrypt
  }
  headerModelValue.value = header_column?.length ? header_column : defaultHeaderModelValue
  fixedModelValue.value = fields_col?.length
    ? getProcessFixedModelValue(payType, fields_col)
    : getDefaultFixedModelValue(payType)
  dynamicModelValue.value = add_fields?.length ? add_fields : defalutDynamicModelValue
  resModelValue.value = {
    ...defaultResModelValue,
    ...return_data
  }
}

// 表单实例引用
const baseFormRef = ref<FormInstance>()

const baseModelValue = ref(defalutBaseModelValue)

const baseRules = {
  api_url: [{ required: true, message: '请输入', trigger: ['blur', 'change'] }],
  request_method: [{ required: true, message: '请选择', trigger: ['blur', 'change'] }],
  encrypt_type: [{ required: true, message: '请选择', trigger: ['blur', 'change'] }]
}

const headerFormRef = ref<FormInstance>()
const headerModelValue = ref(defaultHeaderModelValue)

const headerOperate = (index: number, id?: string) => {
  if (id) {
    if (headerModelValue.value.length === 1) return
    headerModelValue.value = headerModelValue.value.filter((l) => l.id !== id)
    return
  }
  headerModelValue.value.splice(index + 1, 0, {
    ...defaultHeaderModelValue[0],
    id: (Math.random() * 100000).toFixed(3)
  })
}

const fixedFormRef = ref<FormInstance>()
const fixedModelValue = ref([...paymentList])

const dynamicFormRef = ref<FormInstance>()
const dynamicModelValue = ref(defalutDynamicModelValue)
const dynamicOperate = (index: number, id?: string) => {
  if (id) {
    if (dynamicModelValue.value.length === 1) return
    dynamicModelValue.value = dynamicModelValue.value.filter((l) => l.id !== id)
    return
  }
  dynamicModelValue.value.splice(index + 1, 0, {
    ...defalutDynamicModelValue[0],
    id: (Math.random() * 100000).toFixed(3)
  })
}
const resFormRef = ref<FormInstance>()
const resModelValue = ref(defaultResModelValue)

onMounted(() => {
  fetchTripartApiInfo()
  fetchEncryptTypes()
})

const saveConfig = async () => {
  try {
    // 同时校验所有表单
    const [baseValid, headerValid, fixedValid, dynamicValid, resValid] = await Promise.all([
      baseFormRef.value?.validate(),
      headerFormRef.value?.validate(),
      fixedFormRef.value?.validate(),
      dynamicFormRef.value?.validate(),
      resFormRef.value?.validate()
    ])

    // 如果所有表单都校验通过
    if (baseValid && headerValid && fixedValid && dynamicValid && resValid) {
      const apiFieldArray = fixedModelValue.value.filter((l) => !!l.api_field.trim())

      if (!apiFieldArray.length) {
        ElMessage.error('请配置固定参数')
        return
      }

      const values = {
        action: 'updateApiConfig',
        data_uuid: currentRow.value.uuid,
        api_url: baseModelValue.value.api_url,
        encrypt_type: baseModelValue.value.encrypt_type,
        request_method: baseModelValue.value.request_method,
        is_null_value_encrypt: baseModelValue.value.is_null_value_encrypt,
        header_column: headerModelValue.value
          .filter((l) => l.field && l.value)
          .map((l) => ({ field: l.field, value: l.value })),
        fields_col: fixedModelValue.value.map((l) => ({
          sys_fields: l.sys_fields,
          api_field: l.api_field,
          field_type: l.field_type,
          is_encrypt: l.is_encrypt,
          value: l.value
        })),
        add_fields: dynamicModelValue.value
          .filter((l) => l.key && l.field_type && l.value)
          .map((l) => ({
            key: l.key,
            field_type: l.field_type,
            is_encrypt: l.is_encrypt,
            value: l.value
          })),
        return_data: {
          get_statu_field: resModelValue.value.get_statu_field,
          success_value: resModelValue.value.success_value,
          fail_value: resModelValue.value.fail_value,
          msg_field: resModelValue.value.msg_field,
          pay_url: payType === 'payment' ? resModelValue.value.pay_url : undefined,
          balance_amount_field:
            payType === 'get_balance' ? resModelValue.value?.balance_amount_field : undefined
        }
      }

      const res = await updateTripartAPIInfo(route.params.muid, values)
      console.log(res)
      if (res?.success) {
        ElMessage.success(t('common.successOperation'))
        fetchTripartApiInfo()
      } else {
        ElMessage.error(res.message)
        return
      }
    }
  } catch (error) {
    console.error('表单校验失败:', error)
  }
}

const testConfig = async () => {
  try {
    const values = {
      action: 'testAPi',
      data_uuid: currentRow.value.uuid
    }

    const res = await updateTripartAPIInfo(route.params.muid, values)
    console.log(res)
    if (res?.success) {
      ElMessage.success(t('common.successOperation'))
      // fetchTripartApiInfo()
    } else {
      ElMessage.error(res.message)
      return
    }
  } catch (error) {
    console.error(error)
  }
}
</script>

<template>
  <ElRow style="display: flex; align-items: stretch" class="config-container">
    <ElCol :span="24" :style="{ paddingLeft: '10px' }">
      <ContentWrap class="detail-div" title="基础配置">
        <div class="pl-16px w-[60%]">
          <ElForm
            :model="baseModelValue"
            ref="baseFormRef"
            labelWidth="160px"
            labelPosition="right"
            :rules="baseRules"
          >
            <ElFormItem label="请求模式" prop="request_method">
              <ElSelect v-model="baseModelValue.request_method">
                <ElOption value="get" label="GET" />
                <ElOption value="post" label="POST" />
              </ElSelect>
            </ElFormItem>
            <ElFormItem label="URL" prop="api_url">
              <ElInput placeholder="请输入" v-model="baseModelValue.api_url" />
            </ElFormItem>
            <ElFormItem label="签名加密方式" prop="encrypt_type">
              <ElSelect v-model="baseModelValue.encrypt_type">
                <ElOption
                  v-for="item in encryptTypeOptions"
                  :key="item.value"
                  :value="item.value"
                  :label="item.label"
                />
              </ElSelect>
            </ElFormItem>

            <ElFormItem label="空值是否参与签名" prop="is_null_value_encrypt" required>
              <ElSwitch v-model="baseModelValue.is_null_value_encrypt" />
            </ElFormItem>
          </ElForm>
        </div>
      </ContentWrap>
      <ContentWrap class="detail-div" title="请求头">
        <div class="pl-36px">
          <ElForm
            :inline="true"
            :model="headerModelValue"
            ref="headerFormRef"
            labelWidth="110px"
            labelPosition="right"
          >
            <div v-for="(item, index) in headerModelValue" :key="item.id">
              <ElFormItem label="字段" :prop="`${index}.field`">
                <ElInput placeholder="请输入" v-model="headerModelValue[index]['field']" />
              </ElFormItem>
              <ElFormItem label="值" :prop="`${index}.value`">
                <ElInput placeholder="请输入" v-model="headerModelValue[index]['value']" />
              </ElFormItem>
              <ElFormItem>
                <ElButton @click="headerOperate(index)">添加</ElButton>
                <ElButton @click="headerOperate(index, item.id)">删除</ElButton>
              </ElFormItem>
            </div>
          </ElForm>
        </div>
      </ContentWrap>

      <ContentWrap class="detail-div" title="固定参数配置">
        <div class="pl-36px">
          <ElForm
            :inline="true"
            :model="fixedModelValue"
            ref="fixedFormRef"
            labelWidth="80px"
            labelPosition="right"
          >
            <div v-for="(item, index) in fixedModelValue" :key="item.id">
              <ElFormItem :label="'固定参数'" :prop="`${index}.api_field`">
                <ElInput
                  v-model="fixedModelValue[index].api_field"
                  placeholder="请输入"
                  class="w-240px"
                >
                  <template #prepend>
                    <ElTooltip v-if="item.label.length >= 6" :content="item.label" placement="top">
                      <div class="w-80px truncate">{{ item.label }}</div>
                    </ElTooltip>
                    <div v-if="item.label.length < 6" class="w-80px truncate">{{ item.label }}</div>
                  </template>
                </ElInput>
              </ElFormItem>
              <ElFormItem label="参数类型" :prop="`${index}.field_type`">
                <ElSelect
                  v-model="fixedModelValue[index].field_type"
                  :style="{ width: '100px' }"
                  placeholder="请选择"
                >
                  <ElOption value="int">int</ElOption>
                  <ElOption value="string">string</ElOption>
                  <ElOption value="float">float</ElOption>
                </ElSelect>
              </ElFormItem>
              <ElFormItem label="参与签名" :prop="`${index}.is_encrypt`">
                <ElSwitch v-model="fixedModelValue[index].is_encrypt" />
              </ElFormItem>
              <ElFormItem label="参数值" :prop="`${index}.value`">
                <ElInput v-model="fixedModelValue[index].value" placeholder="请输入" />
              </ElFormItem>
            </div>
          </ElForm>
        </div>
      </ContentWrap>

      <ContentWrap class="detail-div" title="动态参数配置">
        <div class="pl-36px">
          <ElForm
            :inline="true"
            :model="dynamicModelValue"
            ref="dynamicFormRef"
            labelWidth="80px"
            labelPosition="right"
          >
            <div v-for="(item, index) in dynamicModelValue" :key="item.id">
              <ElFormItem label="参数名" :prop="`${index}.sys_fields`">
                <ElInput
                  v-model="dynamicModelValue[index]['key']"
                  placeholder="请输入"
                  class="w-240px"
                />
              </ElFormItem>
              <ElFormItem label="参数类型" :prop="`${index}.field_type`">
                <ElSelect
                  v-model="dynamicModelValue[index]['field_type']"
                  :style="{ width: '100px' }"
                >
                  <ElOption value="int">int</ElOption>
                  <ElOption value="string">string</ElOption>
                  <ElOption value="float">float</ElOption>
                </ElSelect>
              </ElFormItem>
              <ElFormItem label="参与签名" :prop="`${index}.is_encrypt`">
                <ElSwitch v-model="dynamicModelValue[index].is_encrypt" />
              </ElFormItem>
              <ElFormItem label="参数值" :prop="`${index}.value`">
                <ElInput v-model="dynamicModelValue[index]['value']" placeholder="请输入" />
              </ElFormItem>
              <ElFormItem>
                <ElButton @click="dynamicOperate(index)">添加</ElButton>
                <ElButton @click="dynamicOperate(index, item.id)">删除</ElButton>
              </ElFormItem>
            </div>
          </ElForm>
        </div>
      </ContentWrap>

      <ContentWrap class="detail-div" title="响应信息处理配置">
        <div class="pl-16px w-[60%]">
          <ElForm :model="resModelValue" ref="resFormRef" labelWidth="180px" labelPosition="right">
            <ElFormItem
              v-for="item in getFormItemList(payType)"
              :key="item.prop"
              :label="item.label"
              :prop="item.prop"
              :rules="{ required: true, message: '请输入', trigger: ['blur', 'change'] }"
            >
              <ElInput placeholder="请输入" v-model="resModelValue[item.prop]" />
            </ElFormItem>
          </ElForm>
          <div class="pl-180px mb-20px mt-30px">
            <ElButton type="primary" :style="{ width: '110px' }" @click="saveConfig">保存</ElButton>
            <ElButton class="" :style="{ width: '110px' }" @click="testConfig">发起测试</ElButton>
          </div>
        </div>
      </ContentWrap>
    </ElCol>
  </ElRow>
</template>

<style lang="css">
.detail-div > .el-card__body {
  padding: 24px 0 0;
  border-top: 1px solid var(--el-border-color) !important;
}
.detail-div .el-form-item {
  margin-bottom: 24px !important;
}
.config-container .el-form--inline .el-form-item {
  margin-right: 0 !important;
}
</style>
