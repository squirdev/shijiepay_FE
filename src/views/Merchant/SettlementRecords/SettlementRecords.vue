<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import Search from '@/components/CustomSearch/src/Search.vue'
import { Dialog } from '@/components/Dialog'
import { useI18n } from '@/hooks/web/useI18n'
import { Table, TableColumn } from '@/components/Table'
import { getSettlementApi, getWalletManageList } from '@/api/merchant'
import { useTable } from '@/hooks/web/useTable'
import { ref, unref, reactive, onMounted } from 'vue'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { Breadcrumb } from '@/components/Breadcrumb'
import { useEventBus } from '@/hooks/event/useEventBus'
import { formatToDate, todayStart, tomorrowStart } from '@/utils/dateUtil'
import { ElTag } from 'element-plus'

const ids = ref<string[]>([])
const { t } = useI18n()

const settleStatuOptons = [
  { label: '待审核', value: 'review' },
  { label: t('settlement.success'), value: 'success' },
  { label: t('settlement.rejected'), value: 'reject' }
]

const walletTypeOptions = ref<Record<'label' | 'value', string>[]>()

onMounted(() => {
  fetchWalletType()
})
const fetchWalletType = async () => {
  try {
    const res = (await getWalletManageList({})) as unknown as Record<string, CountryItem>

    if (!res?.success) return

    walletTypeOptions.value = Object.values(res.data).map((item) => ({
      label: item.name,
      value: item.uuid
    }))
  } catch (error) {
    console.error('Failed to fetch module codes:', error)
  }
}

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getSettlementApi({
      pageIndex: unref(currentPage),
      pageSize: unref(pageSize),
      ...unref(searchParams)
    })
    return {
      list: res.data.list,
      total: res.data.total
    }
  }
})
const { loading, dataList, total, currentPage, pageSize } = tableState
const { getList, getElTableExpose, delList } = tableMethods

const currentDate = formatToDate(new Date())
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

// Dummy pagination variables

const crudSchemas = reactive<CrudSchema[]>([
  {
    field: 'bank_code',
    label: t('formDemo.receivingbank'),
    search: {
      hidden: true
    }
  },
  {
    field: 'bankcard_account',
    label: t('formDemo.receivingbandcardnumber'),
    search: {
      hidden: true
    }
  },
  {
    field: 'payee_username',
    label: t('bankCardInfo.cardholder'),
    search: {
      hidden: true
    }
  },
  {
    field: 'wallet_type_uuid',
    label: '交易钱包类型',
    search: {
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: walletTypeOptions
      }
    },
    colProps: {
      span: 24
    },
    formatter: (_: any, __: TableColumn, cellValue: string) => {
      const name = walletTypeOptions.value?.find((l) => l.value === cellValue)?.label
      return name ?? ''
    }
  },
  {
    field: 'statu',
    label: t('settlement.status'),
    search: {
      component: 'Select',
      componentProps: {
        placeholder: t('settlement.status'),
        options: settleStatuOptons
      }
    },
    formatter: (_: any, __: TableColumn, cellValue: string) => {
      const name = settleStatuOptons.find((l) => l.value === cellValue)?.label
      if (cellValue === 'success') {
        return <ElTag type="success">{name}</ElTag>
      } else if (cellValue === 'rejected') {
        return <ElTag type="danger">{name}</ElTag>
      } else {
        return <ElTag type="primary">{name}</ElTag>
      }
    }
  },
  {
    field: 'amount',
    label: t('settlement.amount'),
    search: {
      component: 'Input',
      componentProps: {
        placeholder: t('formDemo.amount')
      }
    },
    formatter: (_: any, __: TableColumn, cellValue: number) => {
      return cellValue ? Number(cellValue.toFixed(2)).toLocaleString() : 0
    }
  },
  {
    field: 'create_time',
    label: t('settlement.applicationTime'),
    search: {
      component: 'DatePicker',
      componentProps: {
        type: 'datetimerange',
        placeholder: t('settlement.applicationTime'),
        valueFormat: 'YYYY-MM-DD HH:mm:ss'
      }
    },
    form: {
      hidden: true
    }
  }
])

// @ts-ignore
const { allSchemas } = useCrudSchemas(crudSchemas)

const dialogVisible = ref(false)
const dialogTitle = ref('')

const currentRow = ref<null>(null)
const actionType = ref('')
</script>

<template>
  <div>
    <ContentWrap class="search-section">
      <div class="log-search">
        <!-- <p style="min-width: 50px; padding-top: 8px">{{ t('common.search') }} :</p> -->
        <Search
          :model="{ create_time: [todayStart, tomorrowStart] }"
          :schema="allSchemas.searchSchema"
          @search="setSearchParams"
          @reset="setSearchParams"
        />
      </div>
      <!-- <div class="mb-10px">
      <BaseButton type="primary" @click="AddAction">{{ t('exampleDemo.add') }}</BaseButton>
      <BaseButton :loading="delLoading" type="danger" @click="delData(null)">
        {{ t('exampleDemo.del') }}
      </BaseButton>
    </div> -->
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

    <Dialog v-model="dialogVisible" :title="dialogTitle">
      <Write
        v-if="actionType !== 'detail'"
        ref="writeRef"
        :form-schema="allSchemas.formSchema"
        :current-row="currentRow"
      />

      <Detail
        v-if="actionType === 'detail'"
        :detail-schema="allSchemas.detailSchema"
        :current-row="currentRow"
      />
    </Dialog>
  </div>
</template>
