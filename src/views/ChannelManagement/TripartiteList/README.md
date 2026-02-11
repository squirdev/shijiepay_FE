# 三方列表管理 (TripartiteList)

## 📋 功能概述

三方列表管理模块，用于管理第三方支付渠道，包括代收和代付功能。

## 🏗️ 架构设计

### 目录结构

```
TripartiteList/
├── TripartiteList.vue              # 主组件（约150行）
├── components/                      # 子组件
│   ├── Write.vue                   # 基础表单
│   ├── BankConfig.tsx              # 银行配置
│   ├── CollectionConfig.tsx        # 代收配置
│   ├── CollectionTest.tsx          # 代收测试
│   ├── DockingInfo.tsx             # 对接信息
│   └── SecretForm.tsx              # 密钥表单
├── composables/                     # 业务逻辑
│   ├── useTripartOptions.ts        # 选项数据管理
│   ├── useTripartTable.ts          # 表格逻辑
│   ├── useTripartDialog.ts         # 基础编辑弹窗
│   ├── useConfigDialogs.ts         # 配置弹窗管理
│   ├── useSecretDialog.ts          # 密钥查看逻辑
│   └── useDockingDialog.ts         # 对接信息逻辑
├── config/                          # 配置文件
│   └── tableColumns.tsx            # 表格列配置
├── types/                           # 类型定义
│   └── index.ts
├── common.tsx                       # 公共配置
├── REFACTORING_PLAN.md             # 重构计划
└── README.md                        # 本文档
```

## 🔧 核心 Composables

### useTripartOptions

**职责：** 管理所有选项数据（国家、支付模块、通道等）

**导出：**
- `countryOptions` - 国家选项
- `payModuleOptions` - 支付模块选项
- `tunnelOptions` - 通道选项
- `currentCountry` - 当前选中国家
- `filteredModuleOptions` - 根据国家过滤的模块选项

### useTripartTable

**职责：** 管理表格数据和操作

**导出：**
- `tableRegister` - 表格注册
- `loading` - 加载状态
- `dataList` - 数据列表
- `total` - 总数
- `currentPage` - 当前页
- `pageSize` - 每页数量
- `getList` - 获取列表
- `handleDelete` - 删除操作
- `handleUpdateBalance` - 更新余额
- `handleStatusChange` - 状态切换

### useTripartDialog

**职责：** 管理基础编辑弹窗（添加/编辑三方）

**导出：**
- `dialogVisible` - 弹窗显示状态
- `dialogTitle` - 弹窗标题
- `currentRow` - 当前行数据
- `writeRef` - 表单引用
- `saveLoading` - 保存加载状态
- `openDialog` - 打开弹窗
- `handleSave` - 保存数据

### useConfigDialogs

**职责：** 管理配置相关弹窗（代收配置、银行配置、测试）

**导出：**
- `configVisible` - 代收配置弹窗状态
- `configCurrentRow` - 代收配置当前行
- `openCollectionConfig` - 打开代收配置
- `handleCollectionSave` - 保存代收配置
- `bankVisible` - 银行配置弹窗状态
- `bankCurrentRow` - 银行配置当前行
- `openBankConfig` - 打开银行配置
- `handleBankSave` - 保存银行配置
- `testVisible` - 测试弹窗状态
- `testCurrentRow` - 测试当前行
- `openTestDialog` - 打开测试弹窗
- `handleTestSave` - 保存测试

### useSecretDialog

**职责：** 管理密钥查看弹窗

**导出：**
- `secretVisible` - 弹窗显示状态
- `secretFormRef` - 表单引用
- `currentRow` - 当前行数据
- `saveLoading` - 加载状态
- `openSecretDialog` - 打开弹窗
- `handleGetSecret` - 获取密钥

### useDockingDialog

**职责：** 管理对接信息弹窗

**导出：**
- `infoVisible` - 弹窗显示状态
- `infoFormRef` - 表单引用
- `currentRow` - 当前行数据
- `saveLoading` - 加载状态
- `openDockingDialog` - 打开弹窗
- `handleSaveDocking` - 保存对接信息

## 📊 主要功能

### 1. 基础 CRUD
- ✅ 列表查询（支持按名称、国家、备注搜索）
- ✅ 添加三方
- ✅ 编辑三方
- ✅ 删除三方

### 2. 余额管理
- ✅ 更新余额
- ✅ 余额显示（格式化）
- ✅ 余额提醒设置（最低/最高）

### 3. 状态管理
- ✅ 代付状态切换
- ✅ 代收状态切换

### 4. 配置管理
- ✅ 代收通道配置
- ✅ 代付银行配置

### 5. 安全功能
- ✅ 查看密钥（需要验证）
- ✅ 查看对接信息

### 6. 测试功能
- ✅ 代收下单测试

## 🎯 重构成果

### 代码行数对比

| 文件 | 重构前 | 重构后 | 减少 |
|------|--------|--------|------|
| 主组件 | 800+ 行 | ~150 行 | 81% |
| 业务逻辑 | 混在组件中 | 6个独立 composables | - |
| 配置代码 | 混在组件中 | 独立配置文件 | - |

### 改进点

1. **职责清晰**
   - 主组件只负责组合和渲染
   - 每个 composable 负责单一功能
   - 配置独立管理

2. **易于维护**
   - 表格问题 → `useTripartTable.ts`
   - 弹窗问题 → 对应的 dialog composable
   - 选项问题 → `useTripartOptions.ts`

3. **代码复用**
   - Composables 可以在其他组件中复用
   - 配置可以共享

4. **类型安全**
   - 完善的 TypeScript 类型定义
   - 类型推导支持

## 🔍 使用示例

### 在主组件中使用

```vue
<script setup lang="tsx">
// 选项数据
const { countryOptions, payModuleOptions, filteredModuleOptions } = useTripartOptions()

// 表格逻辑
const { dataList, loading, getList, handleDelete } = useTripartTable(searchParams)

// 弹窗逻辑
const { dialogVisible, openDialog, handleSave } = useTripartDialog({
  currentCountry,
  tunnelOptions,
  onSuccess: getList
})
</script>
```

### 在其他组件中复用

```typescript
// 复用选项数据
import { useTripartOptions } from '@/views/ChannelManagement/TripartiteList/composables/useTripartOptions'

const { countryOptions, payModuleOptions } = useTripartOptions()
```

## 📝 注意事项

1. **多语言规范**
   - 所有文本必须使用 `t()` 函数
   - 每个 i18n key 后必须添加中文注释
   - 示例：`t('common.save') /* 保存 */`

2. **类型安全**
   - 使用 TypeScript 类型定义
   - 避免使用 `any` 类型

3. **错误处理**
   - 所有 API 调用都有 try-catch
   - 统一的错误提示

4. **性能优化**
   - 使用 computed 缓存计算结果
   - 避免不必要的重新渲染

## 🚀 后续优化

1. **测试覆盖**
   - 添加单元测试
   - 添加集成测试

2. **文档完善**
   - 添加 API 文档
   - 添加使用示例

3. **性能优化**
   - 虚拟滚动（如果数据量大）
   - 懒加载

## 📚 相关文档

- [重构计划](./REFACTORING_PLAN.md)
- [重构快速指南](../../../REFACTORING_QUICK_GUIDE.md)
- [多语言规范](../../../docs/I18N_GUIDELINES.md)

---

**重构完成时间：** 2024-11-16
**重构方案：** 方案1 - Composables + 配置分离
**状态：** ✅ 已完成
