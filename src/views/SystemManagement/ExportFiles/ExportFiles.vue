<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/CustomSearch'
import { useI18n } from '@/hooks/web/useI18n'
import { useRouter } from 'vue-router'
import { Table, TableColumn } from '@/components/Table'
import { getFileListApi, deleteFileApi } from '@/api/systemmanagement'
import { useTable } from '@/hooks/web/useTable'
import { ExportFileListType } from '@/api/systemmanagement/types'
import { ref, unref, reactive, h } from 'vue'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { Breadcrumb } from '@/components/Breadcrumb'
import { BaseButton } from '@/components/Button'
import { ElTag } from 'element-plus'
import { useAppStore } from '@/store/modules/app'
import { formatToDate, todayStart, tomorrowStart } from '@/utils/dateUtil'

const router = useRouter()
const ids = ref<string[]>([])
const merchantCategoryOptions = ref([])

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getFileListApi({
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
    const res = await deleteFileApi(unref(ids))
    return !!res.success
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

const { t } = useI18n()

const crudSchemas = reactive<CrudSchema[]>([
  {
    field: 'admin_name',
    label: t('systemManagement.exporter') /* 导出者 */,
    search: {
      hidden: true
    },
    form: {
      component: 'Select',
      colProps: {
        span: 24
      },
      componentProps: {
        placeholder: t('systemManagement.exporter') /* 导出者 */,
        options: merchantCategoryOptions
      }
    },
    detail: {
      span: 24
    }
  },
  {
    field: 'filename',
    label: t('systemManagement.fileName') /* 档案名称 */,
    search: {
      component: 'Input',
      componentProps: {
        placeholder: t('systemManagement.pleaseInput') /* 请输入 */
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
    label: t('systemManagement.filePath') /* 档案路径 */,
    search: {
      hidden: true
    },
    form: {
      hidden: true
    }
  },
  {
    field: 'total',
    label: t('systemManagement.dataVolume') /* 资料量 */,
    search: {
      hidden: true
    },
    form: {
      hidden: true
    }
  },
  {
    field: 'out_count',
    label: t('systemManagement.exported') /* 已出口 */,
    form: {
      hidden: true
    },
    search: { hidden: true }
  },
  {
    field: 'statu',
    label: t('systemManagement.exportStatus') /* 导出状态 */,
    form: {
      hidden: true
    },
    search: { hidden: true },
    formatter: (_: Recordable, __: TableColumn, cellValue: string) => {
      const statusMap: Record<
        string,
        { type: 'success' | 'info' | 'warning' | 'danger'; label: string }
      > = {
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
    label: t('systemManagement.exportTime') /* 导出时间 */,
    search: {
      component: 'DatePicker',
      componentProps: {
        type: 'datetimerange',
        placeholder: t('systemManagement.exportTime') /* 导出时间 */,
        valueFormat: 'YYYY-MM-DD HH:mm:ss'
      }
    },
    form: {
      hidden: true
    }
  },
  {
    field: 'note',
    label: t('userDemo.remark') /* 备注 */,
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
    // fixed: 'right',
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
              <el-divider direction="vertical" class="w-[1px] h-[16px] bg-[#dfe6ec]" />
              <BaseButton type="text" style="margin-left: 0" onClick={() => delData(row)}>
                {t('merchantList.delete')}
              </BaseButton>
            </div>
          )
        }
      }
    }
  }
])

const appStore = useAppStore()
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

// @ts-ignore
const { allSchemas } = useCrudSchemas(crudSchemas)
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
  </div>
</template>
