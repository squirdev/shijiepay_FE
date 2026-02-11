# 代付银行管理 - PaymentBank

## 📁 目录结构

```
PaymentBank/
├── PaymentBank.vue              # 主组件
├── components/                  # 子组件
│   ├── Write.vue               # 编辑表单组件
│   └── FeeRangeForm.tsx        # 区间费用表单组件
├── composables/                 # 业务逻辑
│   ├── useBankOptions.ts       # 选项数据管理
│   ├── useBankTable.ts         # 表格逻辑
│   ├── useBankDialog.ts        # 编辑弹窗逻辑
│   └── useRangeDialog.ts       # 区间费用弹窗逻辑
├── config/                      # 配置文件
│   └── tableColumns.tsx        # 表格列配置
└── types/                       # 类型定义
    └── index.ts                # TypeScript 类型
```

## 🎯 重构内容

### 1. 代码组织优化

**重构前：**
- 单文件 400+ 行代码
- 所有逻辑混在一起
- 难以维护和测试

**重构后：**
- 主组件精简到 ~150 行
- 按功能模块拆分
- 职责清晰，易于维护

### 2. Composables 拆分

#### useBankOptions.ts
负责管理所有下拉选项数据：
- 国家选项（全局枚举）
- 钱包类型选项

#### useBankTable.ts
负责表格相关逻辑：
- 数据获取和分页
- 选择变化处理
- 批量状态更新

#### useBankDialog.ts
负责编辑弹窗逻辑：
- 单个编辑
- 批量编辑费率
- 表单提交和保存

#### useRangeDialog.ts
负责区间费用弹窗逻辑：
- 单个区间费用配置
- 批量区间费用配置
- 表单提交和保存

### 3. 配置文件分离

#### tableColumns.tsx
- 表格列配置
- 搜索表单配置
- 编辑表单配置
- 操作列渲染

### 4. 类型定义完善

#### types/index.ts
- BankOption: 选项类型
- SearchParams: 搜索参数
- SaveValue: 保存参数
- RateForm: 费率表单
- IntervalData: 区间费用数据
- RangeFormData: 区间费用表单数据

## 🌍 多语言规范

所有显示文本都使用 i18n，并添加了中文注释：

```typescript
// ✅ 正确示例
ElMessage.success(t('common.successOperation')) /* 操作成功 */
label: t('paymentBank.bankName') /* 银行名称 */
```

新增的语言字段在 `src/locales/zh-CN.ts` 中的 `paymentBank` 部分：
- bankName: 银行名称
- bankCode: 银行code
- rate: 费率
- intervalFee: 单笔区间费用
- rangeConfig: 区间费用配置
- 等等...

## 📊 重构效果

### 代码行数对比

| 文件 | 重构前 | 重构后 |
|------|--------|--------|
| PaymentBank.vue | 400+ 行 | ~150 行 |
| useBankOptions.ts | - | ~50 行 |
| useBankTable.ts | - | ~100 行 |
| useBankDialog.ts | - | ~120 行 |
| useRangeDialog.ts | - | ~120 行 |
| tableColumns.tsx | - | ~250 行 |
| types/index.ts | ~50 行 | ~70 行 |

### 可维护性提升

1. **清晰的职责划分**
   - 主组件只负责组合和渲染
   - Composables 负责业务逻辑
   - Config 负责配置

2. **易于定位问题**
   - 表格问题 → `useBankTable.ts`
   - 编辑问题 → `useBankDialog.ts`
   - 区间费用问题 → `useRangeDialog.ts`
   - 选项问题 → `useBankOptions.ts`

3. **便于测试**
   - 每个 composable 可以独立测试
   - 配置文件可以单独验证

4. **代码复用**
   - Composables 可以在其他组件中复用
   - 配置可以共享

## 🚀 使用示例

### 在主组件中使用

```vue
<script setup lang="tsx">
// 导入 composables
import { useBankOptions } from './composables/useBankOptions'
import { useBankTable } from './composables/useBankTable'
import { useBankDialog } from './composables/useBankDialog'
import { useRangeDialog } from './composables/useRangeDialog'

// 使用选项数据
const { countryOptions, walletTypeOptions } = useBankOptions()

// 使用表格逻辑
const { 
  tableRegister, 
  loading, 
  dataList, 
  getList 
} = useBankTable(searchParams)

// 使用编辑弹窗
const { 
  dialogVisible, 
  openEditDialog, 
  handleSave 
} = useBankDialog({ ids, getElTableExpose, onSuccess: getList })

// 使用区间费用弹窗
const { 
  rangeFormVisible, 
  openRangeDialog, 
  handleSaveRange 
} = useRangeDialog({ ids, getElTableExpose, onSuccess: getList })
</script>
```

## 📝 注意事项

1. **多语言规范**
   - 所有显示文本必须使用 i18n
   - 每个 i18n 调用后必须添加中文注释
   - 禁止硬编码中文

2. **类型安全**
   - 所有函数参数和返回值都有类型定义
   - 使用 TypeScript 严格模式

3. **错误处理**
   - 所有 API 调用都有 try-catch
   - 错误信息统一使用 ElMessage 显示

4. **代码风格**
   - 使用 ESLint 和 Prettier
   - 遵循项目代码规范

## 🔗 相关文档

- [重构计划](../../../../REFACTORING_PLAN.md)
- [重构快速指南](../../../../REFACTORING_QUICK_GUIDE.md)
- [重构示例](../../../../REFACTORING_EXAMPLE.md)
- [多语言规范](../../../../docs/I18N_GUIDELINES.md)
- [参考实现：CollectionChannel](../CollectionChannel/README.md)

## 📅 更新日志

- 2024-11-16: 完成重构，按照 CollectionChannel 模式进行代码组织优化
