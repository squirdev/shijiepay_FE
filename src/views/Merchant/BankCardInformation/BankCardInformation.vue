<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/CustomSearch'
import { useI18n } from '@/hooks/web/useI18n'
import { Table, TableColumn } from '@/components/Table'

import {
  getBankDatasApi,
  getBankCardsApi,
  addBankCardApi,
  editBankCardApi,
  deleteBankCardApi,
  merchantUserApi,
  bankCarkApi,
  getWalletManageList
} from '@/api/merchant'
import { useTable } from '@/hooks/web/useTable'
import { BankCardType } from '@/api/merchant/types'
import { ref, unref, reactive, computed, readonly, onMounted, watch } from 'vue'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { Breadcrumb } from '@/components/Breadcrumb'
import { useEventBus } from '@/hooks/event/useEventBus'
import { BaseButton } from '@/components/Button'
import { Dialog } from '@/components/Dialog'
import Write from './components/Write.vue'
import { FormSchema } from '@/components/Form'
import { ElMessage } from 'element-plus'
import { hasPermi } from '@/components/Permission'
import {
  formatToDate,
  formatToDateTime,
  isCurrentTimeAfterByMinutes,
  todayStart,
  tomorrowStart
} from '@/utils/dateUtil'

const ids = ref<string[]>([])
const searchRef = ref()



onMounted(async () => {
  const res = await getBankDatasApi()
  if (res) {
    bankTypes.value = res.data.map((item) => ({
      label: item.code,
      value: item.uuid
    }))
  }
  fetchWalletType()
})

const walletTypeOptions = ref<Record<'label' | 'value' | 'balance_amount', string>[]>()

const fetchWalletType = async () => {
  try {
    const res = (await getWalletManageList({})) as unknown as Record<string, CountryItem>

    if (!res?.success) return

    walletTypeOptions.value = res.data.map((item) => ({
      label: item.name,
      value: item.uuid,
      balance_amount: item.balance_amount
    }))
  } catch (error) {
    console.error('Failed to fetch module codes:', error)
  }
}

const bankCardOption = ref([])
watch(bankCardOption, (newOptions) => {
  const bankCardField = settlementSchema.find((schema) => schema.field === 'bankcard')
  if (bankCardField) {
    bankCardField.componentProps.options = newOptions
  }
})
const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getBankCardsApi({
      pageIndex: unref(currentPage),
      pageSize: unref(pageSize),
      ...unref(searchParams)
    })
    bankCardOption.value = res.data.list.map((item) => ({
      value: item.uuid,
      label: `${item.bank_code}-${item.account}-${item.account_username}`
    }))
    return {
      list: res.data.list,
      total: res.data.total
    }
  },
  fetchDelApi: async () => {
    const res = await deleteBankCardApi(unref(ids))
    return !!res.success
  }
})
const { loading, dataList, total, currentPage, pageSize } = tableState
const { getList, getElTableExpose, delList } = tableMethods

const searchParams = ref({
  create_time: `${todayStart}|${tomorrowStart}`
})
const setSearchParams = (params: any) => {
  if (params.create_time) {
    params.create_time = params.create_time.join('|')
  }
  searchParams.value = params
  getList()
}

useEventBus({
  name: 'getList',
  callback: (type: string) => {
    if (type === 'add') {
      currentPage.value = 1
    }
    getList()
  }
})

const { t } = useI18n()

const bankTypes = ref([])

const crudSchemas = reactive<CrudSchema[]>([
  {
    field: 'bank_uid',
    label: t('bankCardInfo.bankType'),
    search: {
      component: 'Select',
      componentProps: {
        placeholder: t('bankCardInfo.bankType'),
        options: bankTypes
      }
    },
    form: {
      component: 'RadioButton',
      componentProps: {
        options: bankTypes
      },
      colProps: {
        span: 24
      }
    },
    detail: {
      hidden: true
    },
    formatter: (row: any, __: TableColumn, cellValue: string) => {
      return row.bank_code
    }
  },
  {
    field: 'account',
    label: t('bankCardInfo.bankcardnumber'),
    search: {
      component: 'Input',
      componentProps: {
        placeholder: t('bankCardInfo.bankcardnumber')
      }
    },
    form: {
      component: 'Input',
      componentProps: {
        placeholder: t('bankCardInfo.bankcardnumber')
      },
      colProps: {
        span: 24
      }
    },
    detail: {
      span: 24
    }
  },
  {
    field: 'account_username',
    label: t('bankCardInfo.cardholder'),
    search: {
      component: 'Input',
      componentProps: {
        placeholder: t('bankCardInfo.cardholder')
      }
    },
    form: {
      component: 'Input',
      componentProps: {
        placeholder: t('bankCardInfo.cardholder')
      },
      colProps: {
        span: 24
      }
    },
    detail: {
      span: 24
    }
  },
  {
    field: 'create_time',
    label: t('bankCardInfo.addTime'),
    search: {
     component: 'DatePicker',
      componentProps: {
        type: 'datetimerange',
        placeholder: '创建时间',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
      }
    },
    form: {
      hidden: true
    },
    detail: {
      hidden: true
    }
  },
  {
    field: 'note',
    label: t('merchantList.remark'),
    search: {
      hidden: true,
      component: 'Input',
      componentProps: {
        placeholder: t('merchantList.remark')
      }
    },
    table: {
      show: false
    },
    form: {
      component: 'Input',
      colProps: {
        span: 24
      }
    }
  },
  {
    field: 'Operate',
    label: t('bankCardInfo.operate'),
    fixed: 'right',
    form: {
      hidden: true
    },
    detail: {
      hidden: true
    },
    search: {
      hidden: true
    },
    'min-width': 160,
    table: {
      slots: {
        default: (data: any) => {
          const row = data.row as BankCardType

          return (
            <div class="flex flex-wrap justify-center items-center">
              {hasPermi('merchantBankCardEdit') && (
                <>
                  <BaseButton type="text" onClick={() => action('edit', row)}>
                    {t('exampleDemo.edit')}
                  </BaseButton>
                  <el-divider direction="vertical" class="w-[1px] h-[16px] bg-[#dfe6ec]" />
                </>
              )}
              {hasPermi('merchantBankCardDel') && (
                <BaseButton type="text" onClick={() => delData(row)}>
                  {t('exampleDemo.del')}
                </BaseButton>
              )}
            </div>
          )
        }
      }
    }
  }
])

const settlementSchema = reactive<FormSchema[]>([
  {
    field: 'bankcard',
    label: t('bankCardInfo.bankcard'),
    component: 'Select',
    componentProps: {
      placeholder: t('bankCardInfo.selectBankcard'),
      options: bankCardOption.value
    },
    colProps: {
      span: 24
    }
  },
  {
    field: 'wallet_type_uuid',
    label: '交易钱包类型',

    component: 'Select',
    componentProps: {
      placeholder: '请选择',
      options: walletTypeOptions,
      onChange: (value) => onChangeWalletType(value)
    },
    colProps: {
      span: 24
    }
  },
  {
    field: 'availableBalance',
    label: t('bankCardInfo.availableBalance'),
    component: 'InputNumber',
    colProps: {
      span: 24
    },
    componentProps: {
      controlsPosition: 'right',
      placeholder: t('bankCardInfo.availableBalance'),
      readonly: true
    }
  },
  {
    field: 'amount',
    label: t('bankCardInfo.settlementAmount'),
    component: 'InputNumber',
    colProps: {
      span: 24
    },
    componentProps: {
      controlsPosition: 'right',
      placeholder: t('bankCardInfo.settlementAmount'),
      onChange: (value: number) => {
        settlementAmount.value = value
        currentRow.value = {
          ...currentRow.value,
          afterBalance: currentRow.value.availableBalance - value
        }
      }
    }
  },

  {
    field: 'afterBalance',
    label: t('bankCardInfo.afterBalance'),
    component: 'InputNumber',
    colProps: {
      span: 24
    },
    componentProps: {
      controlsPosition: 'right',
      placeholder: t('bankCardInfo.afterBalance'),
      readonly: true
    }
  }
])

// @ts-ignore
const { allSchemas } = useCrudSchemas(crudSchemas)

const addBankcardDialogVisible = ref(false)
const applySettlementDialogVisible = ref(false)
const dialogTitle = ref('')

const currentRow = ref<BankCardType>()
const actionType = ref('')

const settlementAmount = ref(0)

const onShowApplySettlement = async () => {
  dialogTitle.value = t('bankCardInfo.applySettlement')
  const res = await merchantUserApi({ action: 'getMchInfo' })
  if (!res.success) return
  currentRow.value = { ...res.data, availableBalance: 0 }
  applySettlementDialogVisible.value = true
  actionType.value = ''
}

const onChangeWalletType = (type: string) => {
  currentRow.value = {
    ...currentRow.value,
    availableBalance: walletTypeOptions.value?.find((l) => l.value === type)?.balance_amount ?? 0
  }
}

const delLoading = ref(false)

const delData = async (row?: BankCardType) => {
  const elTableExpose = await getElTableExpose()
  ids.value = row
    ? [row.uuid]
    : elTableExpose?.getSelectionRows().map((v: BankCardType) => v.uuid) || []
  delLoading.value = true

  await delList(unref(ids).length).finally(() => {
    delLoading.value = false
  })
}

const action = (type: string, row?: BankCardType) => {
  dialogTitle.value = t(type === 'edit' ? 'exampleDemo.edit' : 'exampleDemo.detail')
  actionType.value = type
  currentRow.value = row
  // currentRow.value = { ...row, department: unref(treeEl)?.getCurrentNode() || {} }
  addBankcardDialogVisible.value = true
}

const addBankCard = async () => {
  const write = unref(writeRef)
  const formData = await write?.submit()
  if (formData) {
    saveLoading.value = true
    try {
      console.log('bank', formData)
      const res = await addBankCardApi(formData)
      if (res) {
        currentPage.value = 1
        getList()
        addBankcardDialogVisible.value = false
      }
    } catch (error) {
      console.log(error)
    } finally {
      saveLoading.value = false
    }
  }
}

const editBankCard = async () => {
  const write = unref(writeRef)
  const formData = await write?.submit()
  if (formData) {
    saveLoading.value = true
    try {
      console.log('bank', formData)
      const res = await editBankCardApi(formData)
      if (res) {
        currentPage.value = 1
        getList()
      }
    } catch (error) {
      console.log(error)
    } finally {
      saveLoading.value = false
      addBankcardDialogVisible.value = false
    }
  }
}

const writeRef = ref<ComponentRef<typeof Write>>()

const saveLoading = ref(false)

const save = async () => {
  const write = unref(writeRef)
  const formData = await write?.submit()
  if (formData) {
    const newValue = {
      action: 'withdrawal',
      wallet_type_uuid: formData.wallet_type_uuid,
      bankcard_uuid: formData.bankcard,
      amount: formData.amount
    }

    if (formData.amount > formData.availableBalance) {
      ElMessage.error('结算金额不可大于可用余额')
      return
    }

    try {
      saveLoading.value = true
      const res = await bankCarkApi(newValue)
      if (res?.success) {
        ElMessage.success(t('common.successOperation'))
      } else {
        ElMessage.error(res.message)
        return
      }
      applySettlementDialogVisible.value = false
      currentPage.value = 1
      getList()
      fetchWalletType()
    } catch (error) {
      console.log(error)
    } finally {
      saveLoading.value = false
    }
  }
}
</script>

<template>
  <div>
    <ContentWrap class="search-section">
      <div class="log-search">
        <!-- <p style="min-width: 50px; padding-top: 8px">{{ t('common.search') }} :</p> -->
        <Search
        :model="{
            create_time: [todayStart, tomorrowStart]
          }"
          :schema="allSchemas.searchSchema"
          :show-add-bankcard="hasPermi('merchantBankCardAdd')"
          show-apply-settlement
          @add-bankcard="action('add', undefined)"
          @apply-settlement="onShowApplySettlement"
          @search="setSearchParams"
          @reset="setSearchParams"
        />
      </div>
    </ContentWrap>
    <ContentWrap :style="{ minHeight: '700px' }">
      <Table
        v-model:pageSize="pageSize"
        v-model:currentPage="currentPage"
        :columns="allSchemas.tableColumns"
        :data="dataList"
        :loading="loading"
        :pagination="{
          total: total
        }"
        @register="tableRegister"
      >
        <template #empty>
          <div style="text-align: center; padding: 40px; color: #999">
            <img src="@/assets/imgs/no_data.png" style="width: 120px" />
            <p style="line-height: 30px">{{ t('common.noData') }}</p>
          </div>
        </template>
      </Table>
    </ContentWrap>

    <Dialog v-model="addBankcardDialogVisible" :title="dialogTitle">
      <Write
        v-if="actionType !== 'detail'"
        ref="writeRef"
        :isEdit="true"
        :form-schema="allSchemas.formSchema"
        :current-row="currentRow"
      />

      <template #footer>
        <BaseButton
          v-if="actionType === 'edit'"
          type="primary"
          :loading="saveLoading"
          @click="editBankCard"
        >
          {{ t('exampleDemo.save') }}
        </BaseButton>
        <BaseButton
          v-if="actionType === 'add'"
          type="primary"
          :loading="saveLoading"
          @click="addBankCard"
        >
          {{ t('exampleDemo.save') }}
        </BaseButton>
        <BaseButton @click="addBankcardDialogVisible = false">{{
          t('dialogDemo.close')
        }}</BaseButton>
      </template>
    </Dialog>
    <Dialog v-model="applySettlementDialogVisible" :title="dialogTitle">
      <Write
        ref="writeRef"
        :form-schema="settlementSchema"
        :current-row="currentRow"
        :isEdit="false"
      />
      <template #footer>
        <BaseButton type="primary" :loading="saveLoading" @click="save">
          {{ t('exampleDemo.save') }}
        </BaseButton>
        <BaseButton @click="applySettlementDialogVisible = false">
          {{ t('dialogDemo.close') }}
        </BaseButton>
      </template>
    </Dialog>
  </div>
</template>
<style lang="css" scoped>
:deep(.el-radio-button__inner) {
  padding: 10px 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
  transition: all 0.3s ease;
}

:deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-radius: 5px;
}

:deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 5px;
}

:deep(.el-radio-group) {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
  transition: all 0.3s ease;
  gap: 10px;
}
</style>
