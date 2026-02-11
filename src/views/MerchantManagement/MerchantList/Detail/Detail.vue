<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { Table, TableColumn } from '@/components/Table'
import {
  getMerchantDetailApi,
  updateChannelStatusApi,
  updateChannelInfoApi
} from '@/api/merchantmanagement'
import { useCrudSchemas, CrudSchema } from '@/hooks/web/useCrudSchemas'
import { Breadcrumb } from '@/components/Breadcrumb'
import { ref, reactive, onMounted, h } from 'vue'
import { useRoute } from 'vue-router'
import { ElCol, ElTag, ElInput, ElRow, ElIcon, ElSwitch, ElMessage } from 'element-plus'
import { BaseButton } from '@/components/Button'
import type { MerchantListType } from '@/api/merchantmanagement/types'

const { t } = useI18n()
const route = useRoute()

const dataList = ref<MerchantListType[]>([])
const bankDataList = ref([])
const bankLoading = ref(false)
const channelLoading = ref(false)
const editId = ref<string | null>(null)

const getList = async () => {
  const res = await getMerchantDetailApi(route.params.muid)
  dataList.value = res.data['mdatas'].map((item: any, index: number) => ({
    ...item,
    id: item.uuid || index,
    rate: item.rate * 100
  }))
  bankDataList.value = res.data['mbcard_datas']
}

onMounted(async () => {
  channelLoading.value = true
  bankLoading.value = true
  // await getList()
  channelLoading.value = false
  bankLoading.value = false
})

const bankSchemas = reactive<TableColumn[]>([
  {
    field: 'bank_name',
    label: '银行名称',
    detail: { span: 24 },
    width: 200
  },
  {
    field: 'bank_code',
    label: '银行code',
    detail: { span: 24 }
  },
  {
    field: 'bank_card_number',
    label: t('bankCardInfo.bankcardnumber'),
    width: 240
  },
  {
    field: 'payee',
    label: '收款人'
  },
  {
    field: 'create_time',
    label: '添加时间'
  }
])

// @ts-ignore
const { allSchemas } = useCrudSchemas(bankSchemas)
</script>

<template>
  <ContentWrap :class="'detail-div'">
    <div :style="{ padding: '10px' }">
      <Table
        :columns="bankSchemas"
        :data="bankDataList"
        :style="{ height: '100%', margin: '10px' }"
        :loading="bankLoading"
      >
        <template #empty>
          <div style="text-align: center; padding: 40px; color: #999">
            <img src="@/assets/imgs/no_data.png" style="width: 120px" />
            <p style="line-height: 30px">{{ t('common.noData') }}</p>
          </div>
        </template>
      </Table>
    </div>
  </ContentWrap>
</template>
<style lang="css">
.detail-div > .el-card__body {
  padding: 0;
}
</style>
