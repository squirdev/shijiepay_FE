import { ref } from 'vue'

/**
 * 配置弹窗管理
 * 管理代收配置、银行配置、测试弹窗
 */
export const useConfigDialogs = (onSuccess?: () => void) => {
  // 代收配置弹窗
  const configVisible = ref(false)
  const configCurrentRow = ref<any>()

  const openCollectionConfig = (row: any) => {
    configCurrentRow.value = row
    configVisible.value = true
  }

  const handleCollectionSave = () => {
    configVisible.value = false
    onSuccess?.()
  }

  // 银行配置弹窗
  const bankVisible = ref(false)
  const bankCurrentRow = ref<any>()

  const openBankConfig = (row: any) => {
    bankVisible.value = true
    bankCurrentRow.value = row
  }

  const handleBankSave = () => {
    bankVisible.value = false
    onSuccess?.()
  }

  // 测试弹窗
  const testVisible = ref(false)
  const testCurrentRow = ref<any>()

  const openTestDialog = (row: any) => {
    testVisible.value = true
    testCurrentRow.value = row
  }

  const handleTestSave = () => {
    testVisible.value = false
    onSuccess?.()
  }

  //测试代付弹框
  const testDfVisible = ref(false)
  const testDfCurrentRow = ref<any>()

  const openTestDfDialog = (row: any) => {
    testDfVisible.value = true
    testDfCurrentRow.value = row
  }

  const handleTestDfSave = () => {
    testDfVisible.value = false
    onSuccess?.()
  }

  return {
    // 代收配置
    configVisible,
    configCurrentRow,
    openCollectionConfig,
    handleCollectionSave,
    // 银行配置
    bankVisible,
    bankCurrentRow,
    openBankConfig,
    handleBankSave,
    // 测试
    testVisible,
    testCurrentRow,
    openTestDialog,
    handleTestSave,

    //测试代付
    testDfVisible,
    testDfCurrentRow,
    openTestDfDialog,
    handleTestDfSave
  }
}
