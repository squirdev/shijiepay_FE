<script lang="tsx">
import {
  computed,
  defineComponent,
  unref,
  PropType,
  ref,
  onMounted,
  onBeforeUnmount,
  nextTick
} from 'vue'
import { ElDropdown, ElDropdownItem, ElDropdownMenu, ElMenu, ElScrollbar } from 'element-plus'
import { useAppStore } from '@/store/modules/app'
import { usePermissionStore } from '@/store/modules/permission'
import { useRenderMenuItem } from './components/useRenderMenuItem'
import { useRouter } from 'vue-router'
import { isUrl } from '@/utils/is'
import { useDesign } from '@/hooks/web/useDesign'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('menu')

export default defineComponent({
  name: 'Menu',
  props: {
    menuSelect: {
      type: Function as PropType<(index: string) => void>,
      default: undefined
    }
  },
  setup(props) {
    const appStore = useAppStore()

    const layout = computed(() => appStore.getLayout)

    const { push, currentRoute } = useRouter()

    const permissionStore = usePermissionStore()

    const menuMode = computed((): 'vertical' | 'horizontal' => {
      // 竖
      const vertical: LayoutType[] = ['classic', 'topLeft', 'cutMenu']

      if (vertical.includes(unref(layout))) {
        return 'vertical'
      } else {
        return 'horizontal'
      }
    })

    const routers = computed(() => {
      const allRouters =
        unref(layout) === 'cutMenu' ? permissionStore.getMenuTabRouters : permissionStore.getRouters
      const path = unref(currentRoute).path

      if (path.startsWith('/pay4Mgr')) {
        return allRouters.filter((r) => r.path.startsWith('/pay4Mgr'))
      }

      if (path.startsWith('/pay4Mch')) {
        return allRouters.filter((r) => r.path.startsWith('/pay4Mch'))
      }

      return allRouters
    })

    const collapse = computed(() => appStore.getCollapse)

    const uniqueOpened = computed(() => appStore.getUniqueOpened)

    const activeMenu = computed(() => {
      const { meta, path } = unref(currentRoute)
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu as string
      }
      return path
    })

    const menuSelect = (index: string) => {
      if (props.menuSelect) {
        props.menuSelect(index)
      }
      // 自定义事件
      if (isUrl(index)) {
        window.open(index)
      } else {
        push(index)
      }
    }

    const renderMenuWrap = () => {
      if (unref(layout) === 'top') {
        return renderMenu()
      } else {
        return <ElScrollbar>{renderMenu()}</ElScrollbar>
      }
    }

    const menuVisible = ref(false)
    const menuX = ref(0)
    const menuY = ref(0)
    const currentItem = ref<{ path: string; name: string } | null>(null)

    const menuRef = ref<HTMLDivElement | null>(null)

    const handleRightClick = (event: MouseEvent, item: { path: string; name: string }) => {
      event.preventDefault()
      currentItem.value = item
      menuVisible.value = true
      menuX.value = event.clientX
      menuY.value = event.clientY

      // 用 nextTick 拿到实际菜单大小后调整位置
      nextTick(() => {
        const menuEl = menuRef.value
        if (menuEl) {
          const rect = menuEl.getBoundingClientRect()
          let x = event.clientX
          let y = event.clientY

          if (x + rect.width > window.innerWidth) {
            x = window.innerWidth - rect.width
          }
          if (y + rect.height > window.innerHeight) {
            y = window.innerHeight - rect.height
          }
          menuX.value = x
          menuY.value = y
        }
      })
    }

    const handleOpenHome = () => {
      let pathPrefix = ''
      const path = window.location.pathname
      if (path.startsWith('/pay4Mgr/') || path.startsWith('/pay4Mgr')) {
        pathPrefix = '/pay4Mgr'
      }
      if (path.startsWith('/pay4Mch/') || path.startsWith('/pay4Mch')) {
        pathPrefix = '/pay4Mch'
      }

      window.open(`${pathPrefix}/home`, '_blank')
    }

    const handleOpenNewTab = () => {
      if (currentItem.value) {
        const path = window.location.pathname
        let pathPrefix = ''
        if (path.startsWith('/pay4Mgr/') || path.startsWith('/pay4Mgr')) {
          pathPrefix = '/pay4Mgr'
        }
        if (path.startsWith('/pay4Mch/') || path.startsWith('/pay4Mch')) {
          pathPrefix = '/pay4Mch'
        }

        window.open(`${pathPrefix}${currentItem.value.path}`, '_blank')
      }
      menuVisible.value = false
    }

    const handleClickOutside = () => {
      menuVisible.value = false
    }

    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
    })

    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    const renderMenu = () => {
      return (
        <ElMenu
          defaultActive={unref(activeMenu)}
          mode={unref(menuMode)}
          collapse={
            unref(layout) === 'top' || unref(layout) === 'cutMenu' ? false : unref(collapse)
          }
          uniqueOpened={unref(layout) === 'top' ? false : unref(uniqueOpened)}
          backgroundColor="var(--left-menu-bg-color)"
          textColor="var(--left-menu-text-color)"
          activeTextColor="var(--left-menu-text-active-color)"
          popperClass={
            unref(menuMode) === 'vertical'
              ? `${prefixCls}-popper--vertical`
              : `${prefixCls}-popper--horizontal`
          }
          onSelect={menuSelect}
        >
          {{
            default: () => {
              const { renderMenuItem } = useRenderMenuItem(menuMode, handleRightClick)
              return renderMenuItem(unref(routers))
            }
          }}
        </ElMenu>
      )
    }

    return () => (
      <div
        id={prefixCls}
        class={[
          `${prefixCls} ${prefixCls}__${unref(menuMode)}`,
          'h-[100%] overflow-hidden flex-col bg-[var(--left-menu-bg-color)]',
          {
            'w-[var(--left-menu-min-width)]': unref(collapse) && unref(layout) !== 'cutMenu',
            'w-[var(--left-menu-max-width)]': !unref(collapse) && unref(layout) !== 'cutMenu'
          }
        ]}
      >
        {renderMenuWrap()}
        {/* Element Plus 右键菜单 */}
        {menuVisible.value && (
          <div
            ref={menuRef}
            class="el-dropdown__popper el-popper"
            style={{
              position: 'fixed',
              top: `${menuY.value}px`,
              left: `${menuX.value}px`,
              zIndex: 3000,
              paddingLeft: 0,
              paddingRight: 0
            }}
          >
            <ul class="el-dropdown-menu">
              <li class="el-dropdown-menu__item" onClick={handleOpenHome}>
                首页
              </li>
              <li class="el-dropdown-menu__item" onClick={handleOpenNewTab}>
                在新标签页打开
              </li>
              <li class="el-dropdown-menu__item" onClick={() => window.location.reload()}>
                刷新
              </li>
            </ul>
          </div>
        )}
      </div>
    )
  }
})
</script>

<style lang="less" scoped>
@prefix-cls: ~'@{adminNamespace}-menu';

.@{prefix-cls} {
  position: relative;
  transition: width var(--transition-time-02);

  :deep(.@{elNamespace}-menu) {
    width: 100% !important;
    border-right: none;

    // 设置选中时子标题的颜色
    .is-active {
      & > .@{elNamespace}-sub-menu__title {
        color: var(--left-menu-text-active-color) !important;
      }
    }

    // 设置子菜单悬停的高亮和背景色
    .@{elNamespace}-sub-menu__title,
    .@{elNamespace}-menu-item {
      &:hover {
        color: var(--left-menu-text-active-color) !important;
        background-color: var(--left-menu-bg-color) !important;
      }
    }

    // 设置选中时的高亮背景和高亮颜色
    .@{elNamespace}-menu-item.is-active {
      color: var(--left-menu-text-active-color) !important;
      background-color: var(--left-menu-bg-active-color) !important;

      &:hover {
        background-color: var(--left-menu-bg-active-color) !important;
      }
    }

    .@{elNamespace}-menu-item.is-active {
      position: relative;
    }

    // 设置子菜单的背景颜色
    .@{elNamespace}-menu {
      .@{elNamespace}-sub-menu__title,
      .@{elNamespace}-menu-item:not(.is-active) {
        background-color: var(--left-menu-bg-light-color) !important;
      }
    }
  }

  // 折叠时的最小宽度
  :deep(.@{elNamespace}-menu--collapse) {
    width: var(--left-menu-min-width);

    & > .is-active,
    & > .is-active > .@{elNamespace}-sub-menu__title {
      position: relative;
      background-color: var(--left-menu-collapse-bg-active-color) !important;
    }
  }

  // 折叠动画的时候，就需要把文字给隐藏掉
  :deep(.horizontal-collapse-transition) {
    .@{prefix-cls}__title {
      display: none;
    }
  }

  // 水平菜单
  &__horizontal {
    height: calc(~'var(--top-tool-height)') !important;

    :deep(.@{elNamespace}-menu--horizontal) {
      height: calc(~'var(--top-tool-height)');
      border-bottom: none;
      // 重新设置底部高亮颜色
      & > .@{elNamespace}-sub-menu.is-active {
        .@{elNamespace}-sub-menu__title {
          border-bottom-color: var(--el-color-primary) !important;
        }
      }

      .@{elNamespace}-menu-item.is-active {
        position: relative;

        &::after {
          display: none !important;
        }
      }

      .@{prefix-cls}__title {
        /* stylelint-disable-next-line */
        max-height: calc(~'var(--top-tool-height) - 2px') !important;
        /* stylelint-disable-next-line */
        line-height: calc(~'var(--top-tool-height) - 2px');
      }
    }
  }
}
</style>

<style lang="less">
@prefix-cls: ~'@{adminNamespace}-menu-popper';

.@{prefix-cls}--vertical,
.@{prefix-cls}--horizontal {
  // 设置选中时子标题的颜色
  .is-active {
    & > .el-sub-menu__title {
      color: var(--left-menu-text-active-color) !important;
    }
  }

  // 设置子菜单悬停的高亮和背景色
  .el-sub-menu__title,
  .el-menu-item {
    &:hover {
      color: var(--left-menu-text-active-color) !important;
      background-color: var(--left-menu-bg-color) !important;
    }
  }

  // 设置选中时的高亮背景
  .el-menu-item.is-active {
    position: relative;
    background-color: var(--left-menu-bg-active-color) !important;

    &:hover {
      background-color: var(--left-menu-bg-active-color) !important;
    }
  }
}

@submenu-prefix-cls: ~'@{adminNamespace}-submenu-popper';

// 设置子菜单溢出时滚动样式
.@{submenu-prefix-cls}--vertical {
  max-height: 100%;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
    background-color: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgb(144 147 153 / 30%);
    border-radius: 4px;
  }
}

.el-menu .el-menu .el-menu-item:not(.is-active) {
  padding-left: 60px;
}
.el-menu .el-menu .el-menu-item.is-active {
  padding-left: 60px;
}
.el-menu .el-menu .el-sub-menu .el-sub-menu__title {
  padding-left: 50px;
}
</style>
