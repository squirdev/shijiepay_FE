<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/CustomSearch'
import { Dialog } from '@/components/Dialog'
import { useI18n } from '@/hooks/web/useI18n'
import { Table, TableColumn } from '@/components/Table'
import { useTable } from '@/hooks/web/useTable'
import { ref, unref, reactive, h } from 'vue'
import { getDownloadFileApi, deleteDownloadFileApi } from '@/api/merchant'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { Breadcrumb } from '@/components/Breadcrumb'
import { useEventBus } from '@/hooks/event/useEventBus'
import { BaseButton } from '@/components/Button'
import { ExportFileListType } from '@/api/merchant/types'
import { ElMessage, ElTag } from 'element-plus'
import { formatToDate, todayStart, tomorrowStart } from '@/utils/dateUtil'
import { hasPermi } from '@/components/Permission'
const ids = ref<string[]>([])

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getDownloadFileApi({
      pageIndex: unref(currentPage),
      pageSize: unref(pageSize),
      ...unref(searchParams)
    })
    return {
      list: res.data.list,
      total: res.data.total
    }
  },
  fetchDelApi: async () => {
    const res = await deleteDownloadFileApi(unref(ids))
    return !!res?.success
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
const { t } = useI18n()
const delData = async (row?: ExportFileListType) => {
  const elTableExpose = await getElTableExpose()
  ids.value = row
    ? [row.uuid]
    : elTableExpose?.getSelectionRows().map((v: ExportFileListType) => v.uuid) || []

  await delList(unref(ids).length)
}

const download = async (path: any) => {
  // const res = await downloadFileApi(path)
  const link = document.createElement('a')
  link.href = `${import.meta.env.VITE_BACKEND_API_ADDRESS}${path}`
  link.download = '' // Optional: let browser use default filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const crudSchemas = reactive<CrudSchema[]>([
  {
    field: 'admin_name',
    label: t('systemManagement.exporter'),
    search: {
      hidden: true
    },
    detail: {
      span: 24
    },
    table: { hidden: true }
  },
  {
    field: 'filename',
    label: t('systemManagement.fileName'),
    search: {
      component: 'Input',
      componentProps: {
        placeholder: t('common.inputText') /* 请输入 */
      }
    },
    form: {
      hidden: true
    },
    detail: {
      span: 24
    }
  },
  {
    field: 'path',
    label: t('systemManagement.filePath'),
    search: {
      hidden: true
    },
    form: {
      hidden: true
    }
  },
  {
    field: 'file_size',
    label: t('systemManagement.fileSize'),
    search: {
      hidden: true
    },
    form: {
      hidden: true
    }
  },
  {
    field: 'total',
    label: t('systemManagement.dataVolume'),
    search: {
      hidden: true
    },
    form: {
      hidden: true
    }
  },
  {
    field: 'out_count',
    label: t('systemManagement.exported'),
    form: {
      hidden: true
    },
    search: { hidden: true }
  },
  {
    field: 'statu',
    label: t('systemManagement.exportStatus'),
    form: {
      hidden: true
    },
    search: { hidden: true },
    formatter: (_: Recordable, __: TableColumn, cellValue: string) => {
      const statusMap: Record<string, { type: string; label: string }> = {
        successed: { type: 'success', label: t('systemManagement.successful') },
        failed: { type: 'danger', label: t('systemManagement.failed') },
        ongoing: { type: 'warning', label: t('systemManagement.inprogress') }
      }
      const status = statusMap[cellValue] || {
        type: 'info',
        label: t('common.unknown') // fallback label if the status is unrecognized
      }
      return h(ElTag, { type: status.type }, () => status.label)
    }
  },
  {
    field: 'create_time',
    label: t('systemManagement.exportTime'),
    search: {
      component: 'DatePicker',
      componentProps: {
        type: 'datetimerange',
        placeholder: t('paymentManagement.time'),
        valueFormat: 'YYYY-MM-DD HH:mm:ss'
      }
    },
    form: {
      hidden: true
    }
  },
  {
    field: 'note',
    label: t('userDemo.remark'),
    search: {
      hidden: true
    },
    form: {
      component: 'InputNumber',
      colProps: {
        span: 24
      },
      componentProps: {
        placeholder: t('userDemo.remark'),
        controlsPosition: 'right'
      }
    }
  },
  {
    field: 'Operate',
    label: t('merchantList.operate'),
    fixed: 'right',
    search: {
      hidden: true
    },
    form: {
      hidden: true
    },
    'min-width': 160,
    table: {
      slots: {
        default: (data: any) => {
          const row = data.row as ExportFileListType
          return (
            <div style="display: flex; flex-wrap: wrap; justify-content: center; align-items: center;">
              <BaseButton type="text" onClick={() => download(row.path)}>
                {t('common.download')}
              </BaseButton>
              {hasPermi('merExportDataDel') && (
                <>
                  <el-divider direction="vertical" class="w-[1px] h-[16px] bg-[#dfe6ec]" />
                  <BaseButton type="text" style="margin-left: 0" onClick={() => delData(row)}>
                    {t('merchantList.delete')}
                  </BaseButton>
                </>
              )}
            </div>
          )
        }
      }
    }
  }
])

// @ts-ignore
const { allSchemas } = useCrudSchemas(crudSchemas)

const dialogVisible = ref(false)
const dialogTitle = ref('')

const currentRow = ref<any | null>(null)
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
