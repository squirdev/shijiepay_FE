<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/store/modules/app'
import { ConfigGlobal } from '@/components/ConfigGlobal'
import { useDesign } from '@/hooks/web/useDesign'
import { ElNotification } from 'element-plus'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('app')

const appStore = useAppStore()
const currentSize = computed(() => appStore.getCurrentSize)

const greyMode = computed(() => appStore.getGreyMode)

appStore.initTheme()
</script>

<template>
  <ConfigGlobal :size="currentSize">
    <RouterView :class="greyMode ? `${prefixCls}-grey-mode` : ''" />
  </ConfigGlobal>
</template>

<style lang="less">
@prefix-cls: ~'@{adminNamespace}-app';

.size {
  width: 100%;
  height: 100%;
}

html,
body {
  padding: 0 !important;
  margin: 0;
  overflow: hidden;
  .size;

  #app {
    .size;
  }
}

.@{prefix-cls}-grey-mode {
  filter: grayscale(100%);
}
.search-section .el-form-item--label-right {
  width: 320px;
  margin-right: 12px !important;
  margin-bottom: 12px;
}

.search-section .el-form-item--label-right:last-child {
  width: auto;
}

.search-section .el-form-item--label-right:last-child > * {
  margin-left: 0 !important;
  padding: 0 !important;
}
.search-section .el-form-item__content {
  padding: 0 !important;
}
.search-section .el-form-item--default .el-form-item__label {
  height: 34px;
  line-height: 34px;
  text-align: right;
}

.search-section .el-form-item__content .el-input__wrapper {
  height: 34px !important;
  border-color: #dcdfe6 !important;
}
.search-section .el-form-item__content .el-tooltip__trigger {
  border-color: #dcdfe6 !important;
  height: 34px !important;
}
.search-section .el-form-item__label-wrap {
  margin: 0 !important;
  color: #606267;
  /*min-width: 96px; */
  font-weight: bold;
  display: flex;
  justify-content: end;
}

.search-section .el-button {
  font-weight: 400 !important;
}
.search-section {
  margin-bottom: 12px;
}
.search-section > div {
  padding-bottom: 0;
}
.el-table__cell > .cell {
  text-align: center;
}
.self-breadcrumb {
  margin-bottom: 10px;
}
.self-breadcrumb > div {
  padding: 15px;
}
.el-input__inner {
  text-align: left !important;
}
// .el-dialog__body > .el-scrollbar {
//   height: 500px !important;
// }
div.el-dialog {
  --el-dialog-width: 40%;
}
td .el-tooltip .el-button {
  height: 25px !important;
  padding: 6px 10px !important;
}
.v-user-info {
  margin-right: 20px;
}
.v-logo {
  --logo-height: 55px;
  justify-content: center;
  padding-right: 12px !important;
}

.bank-buttons .is-checked .el-checkbox-button__inner {
  background-color: #f56c6c !important;
  border-color: #c93d4b !important;
  color: white !important;
}

.bank-buttons .is-checked .el-checkbox-button__inner:hover {
  color: rgb(102, 81, 81) !important;
}
.bank-buttons .el-checkbox-button__inner:hover {
  color: #f56c6c !important;
}

a {
  text-decoration: none !important;
}

p {
  padding: 0 !important;
}

.customCheckbox .el-checkbox.el-checkbox--default {
  height: auto;
  width: 100% !important;
  padding: 10px !important;
  margin-bottom: 10px !important;
}
.customCheckbox .el-checkbox__label {
  display: flex;
  flex-direction: column;
  flex: 1 !important;
}
.customFormItem .checkbox-group-container {
  flex: 1 !important;
}
.bankFormItem .el-checkbox__input.is-checked + .el-checkbox__label {
  color: #f56c6c !important;
}
.bankFormItem .el-checkbox.is-bordered.is-checked {
  border-color: #f56c6c !important;
}
.bankFormItem .el-checkbox__input.is-checked .el-checkbox__inner,
.bankFormItem .el-checkbox__input.is-indeterminate .el-checkbox__inner {
  border-color: #f56c6c !important;
  background-color: #f56c6c !important;
}
</style>
