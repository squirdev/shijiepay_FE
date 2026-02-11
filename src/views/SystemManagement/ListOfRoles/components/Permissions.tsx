import { defineComponent, onMounted, ref, watch, computed, PropType } from 'vue'
import { ElTree } from 'element-plus'
import { useI18n } from '@/hooks/web/useI18n'
import { permissionListApi } from '@/api/systemmanagement'

interface PermissionItem {
  name: string
  code: string
  parentName?: string
  parentCode?: string
  permission?: PermissionItem[]
}

interface TreeItem {
  id: string
  label: string
  children?: TreeItem[]
  disabled?: boolean
}

const Permissions = defineComponent({
  name: 'Permissions',
  props: {
    userPermissions: {
      type: Array as PropType<string[]>,
      required: true
    }
  },
  setup(props, { expose }) {
    const { t } = useI18n()
    const permissionData = ref<TreeItem[]>([])
    const userPermissions = ref<string[]>([])
    const treeRef = ref()

    // 获取所有节点的 id
    const getAllNodeIds = (
      data: TreeItem[]
    ): { ids: string[]; nodeMap: Record<string, TreeItem> } => {
      const ids: string[] = []
      const nodeMap: Record<string, TreeItem> = {}
      const traverse = (nodes: TreeItem[]) => {
        nodes.forEach((node) => {
          ids.push(node.id)

          nodeMap[node.id] = node
          if (node.children) {
            traverse(node.children)
          }
        })
      }
      traverse(data)
      return { ids, nodeMap }
    }

    watch(
      () => props.userPermissions,
      (newVal) => {
        userPermissions.value = newVal
      },
      {
        immediate: true, // 关键：确保组件挂载时就执行一次
        deep: true // 关键：防止数组内容变了但引用没变导致不触发
      }
    )
    // 计算所有节点的 id
    const allNodeIds = computed(() => getAllNodeIds(permissionData.value).ids)

    const checkedKeys = computed(() => {
      if (!permissionData.value.length) return []
      const nodes = getAllNodeIds(permissionData.value).nodeMap
      const ret = userPermissions.value.filter((l) => !nodes[l]?.children?.length)

      return ret
    })

    const processPermissionList = (data: PermissionItem[]) => {
      const permissionGroups: TreeItem[] = data.reduce<TreeItem[]>((ret, item) => {
        const currentIndex = ret.findIndex((l) => l.id === item.parentCode)
        const operationChildren = (item.permission ?? []).map((item) => ({
          id: item.code,
          label: item.name
        }))
        if (item.parentCode && item.parentName) {
          if (currentIndex < 0) {
            ret.push({
              id: item.parentCode,
              label: item.parentName,
              children: [{ id: item.code, label: item.name, children: operationChildren }]
            })
          } else {
            ret[currentIndex].children?.push({
              id: item.code,
              label: item.name,
              disabled: item.code === 'INDEX_TOTAL_NUMBER_SHOW',
              children: operationChildren
            })
          }
        }

        if (!item.parentCode && !item.parentName) {
          ret.push({
            id: item.code,
            label: item.name,
            disabled: item.code === 'INDEX_TOTAL_NUMBER_SHOW',
            children: []
          })
        }

        return ret
      }, [])

      return permissionGroups
    }

    const fetchPermissionList = async () => {
      try {
        const res = await permissionListApi({})

        if (!res.success) return
        permissionData.value = processPermissionList(res.data)
      } catch (error) {
        console.error(error)
      }
    }

    onMounted(() => {
      fetchPermissionList()
    })

    const submit = async () => {
      if (!treeRef.value) return

      // 获取选中的节点数据
      const checkedNodes = treeRef.value.getCheckedNodes(false, true)

      const ret = checkedNodes.map((l) => l.id).filter((l) => !l.includes('Top'))

      return ret
    }

    expose({
      submit
    })

    return () => (
      <div>
        <ElTree
          ref={treeRef}
          data={permissionData.value}
          showCheckbox
          nodeKey="id"
          defaultExpandedKeys={allNodeIds.value}
          defaultCheckedKeys={[...checkedKeys.value, 'INDEX_TOTAL_NUMBER_SHOW']}
          props={{
            disabled: (data: TreeItem) => data.disabled ?? false
          }}
        />
      </div>
    )
  }
})

export default Permissions
