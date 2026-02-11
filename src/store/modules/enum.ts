import { defineStore } from 'pinia'
import { store } from '../index'

interface EnumOption {
  label: string
  value: string
  [key: string]: any
}

interface CountryOption extends EnumOption {
  code?: string
  currencyCode?: string
  currencyName?: string
  flag?: string
  name?: string
}

interface EnumState {
  threePartyOptions: EnumOption[]
  countryOptions: EnumOption[]
}

export const useEnumStore = defineStore('enum', {
  state: (): EnumState => {
    return {
      threePartyOptions: [],
      countryOptions: []
    }
  },
  getters: {
    getThreePartyOptions(): EnumOption[] {
      return this.threePartyOptions
    },
    getCountryOptions(): EnumOption[] {
      return this.countryOptions
    }
  },
  actions: {
    setThreePartyOptions(options: EnumOption[]) {
      this.threePartyOptions = options
    },
    setCountryOptions(options: EnumOption[]) {
      this.countryOptions = options
    },
    clearThreePartyOptions() {
      this.threePartyOptions = []
    },
    clearCountryOptions() {
      this.countryOptions = []
    },
    clearAll() {
      this.threePartyOptions = []
      this.countryOptions = []
    }
  },
  persist: {
    storage: sessionStorage // 使用 sessionStorage 替代 localStorage
  }
})

export const useEnumStoreWithOut = () => {
  return useEnumStore(store)
}
