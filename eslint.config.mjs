import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import prettierPlugin from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'

export default [
  // 忽略目录
  {
    ignores: ['node_modules', 'dist', 'dist-*']
  },

  // JS 基础规则
  js.configs.recommended,

  // TS 规则（flat 版，直接展开）
  ...tseslint.configs.recommended,

  // Vue 规则（flat 版）
  ...pluginVue.configs['flat/essential'],

  // 关闭 ESLint 自带的格式规则（给 Prettier 让路）
  prettierConfig,

  // 项目自定义规则
  {
    files: ['src/**/*.{ts,tsx,vue}'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    plugins: {
      prettier: prettierPlugin
    },
    rules: {
      // Prettier：开发期用 warn，fix 时才改
      'prettier/prettier': 'warn',

      // 原来的规则
      'no-undef': 'off',
      'no-use-before-define': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',

      'vue/no-v-html': 'off',
      'vue/multi-word-component-names': 'off'
    }
  }
]
