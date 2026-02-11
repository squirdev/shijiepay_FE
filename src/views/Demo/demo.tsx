import { defineComponent, reactive, ref } from 'vue'
import { ElForm, ElFormItem, ElSelect, ElOption, ElInput, ElButton, ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'

const Demo = defineComponent({
  name: 'Demo',
  setup() {
    const bankCodeOtions = getBankCodeOptions()
    const formRef = ref<FormInstance>()

    // 表单数据
    const formData = reactive({
      bankCode: '',
      cardNumber: '',
      name: '',
      remark: '',
      amount: '',
      merchant: '9123'
    })

    // 表单校验规则
    const rules = {
      bankCode: [{ required: true, message: '请选择银行', trigger: 'change' }],
      cardNumber: [{ required: true, message: '请输入卡号', trigger: 'blur' }],
      name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
      amount: [{ required: true, message: '请输入金额', trigger: 'blur' }]
    }

    const resetForm = () => {
      if (!formRef.value) return
      formRef.value.resetFields()
    }

    // 复制到剪贴板
    const copyToClipboard = async () => {
      if (!formRef.value) return
      const valid = await formRef.value.validate().catch(() => false)

      if (valid) {
        const copyText = `银行代码:${formData.bankCode}\n卡号:${formData.cardNumber}\n姓名:${formData.name}\n备注:${formData.remark}\n金额:${formData.amount}\n商户:${formData.merchant}`

        try {
          await navigator.clipboard.writeText(copyText)
          ElMessage.success('复制成功')
        } catch (err) {
          console.error('复制失败:', err)
          ElMessage.error('复制失败')
        }
      }
    }

    // 读取剪贴板数据
    const readFromClipboard = async () => {
      try {
        const text = await navigator.clipboard.readText()
        const lines = text.split('\n')

        // 正则表达式

        // 修改银行代码正则，使其可以匹配：
        // 1. 银行代码：ICB
        // 2. 银行代码ICB
        // 3. 银行：ICB
        // 4. 银行ICB
        // 5. ICB（纯银行代码）
        // 从银行列表中获取所有银行代码，并创建正则模式
        const bankCodes = bankCodeOtions.map((item) => item.value).join('|')
        // 创建银行代码正则表达式
        const bankCodeRegex = new RegExp(`(?:银行(?:代码)?)?[：:]?\\s*(${bankCodes})`, 'i')

        // 修改卡号正则，使其可以匹配：
        // 1. 卡号：123456
        // 2. 账号：123456
        // 3. 账户：123456
        // 4. 卡号123456
        // 5. 账号123456
        // 6. 账户123456
        // 7. 123456 (纯数字，至少6位)
        const cardNumberRegex = /(?:卡号|银行卡号|账号|账户)?[：:]?\s*(\d{6,})/
        const nameRegex = /(?:姓名|账号名称|名称)\s*[：:]?\s*(.+)/
        const remarkRegex = /备注\s*[：:]\s*(.+)/
        // 修改金额正则，使其可以匹配：
        // 1. 金额：1000
        // 2. 金额1000
        // 3. 1000
        // 4. 1,000
        // 5. 1000.00
        // 6. 1,000.00
        // 7. 1000VND
        // 8. 1,000.00 VND
        const amountRegex = /(?:金额[：:]?\s*)?([0-9,.]+(?:\s*VND)?)/i

        // 优先处理明确带标识的行
        lines.forEach((line) => {
          // 先处理有明确标识的行
          if (
            line.includes('银行') ||
            line.includes('卡号') ||
            line.includes('账号') ||
            line.includes('账户')
          ) {
            // 匹配银行代码
            const bankCodeMatch = line.match(bankCodeRegex)
            if (bankCodeMatch) {
              const code = bankCodeMatch[1].trim()
              // 验证匹配到的代码是否在银行列表中
              if (bankCodeOtions.some((bank) => bank.value === code)) {
                formData.bankCode = code
              }
            }

            // 匹配卡号
            const cardNumberMatch = line.match(cardNumberRegex)
            if (cardNumberMatch) {
              formData.cardNumber = cardNumberMatch[1].trim()
            }
          }

          // 匹配金额
          if (line.includes('金额')) {
            const amountMatch = line.match(amountRegex)
            if (line.includes('金额') && amountMatch) {
              formData.amount = amountMatch[1].replace(/VND/i, '').replace(/,/g, '').trim()
            }
          }
          // 匹配姓名
          if (line.includes('姓名') || line.includes('账号名称') || line.includes('名称')) {
            const nameMatch = line.match(nameRegex)
            if (nameMatch) {
              formData.name = nameMatch[1].trim()
            }
          }

          // 匹配备注
          if (line.includes('备注')) {
            const remarkMatch = line.match(remarkRegex)
            if (remarkMatch) {
              formData.remark = remarkMatch[1].trim()
            }
          }
        })

        // 再处理纯数字的行
        lines.forEach((line) => {
          const trimmedLine = line.trim()
          // 修改数字判断正则，支持小数点
          if (/^\d+(\.\d+)?$/.test(trimmedLine)) {
            // 判断数字特征
            if (trimmedLine.length >= 6 && !formData.cardNumber && !trimmedLine.includes('.')) {
              // 长度大于等于6位，且不包含小数点，且卡号未被设置，认为是卡号
              formData.cardNumber = trimmedLine
            } else if (!formData.amount) {
              // 包含小数点或长度小于6位，且金额未被设置，认为是金额
              formData.amount = trimmedLine
            }
          } else if (line.toLowerCase().includes('vnd')) {
            // 包含VND的一定是金额
            const amountMatch = line.match(amountRegex)
            if (amountMatch) {
              formData.amount = amountMatch[1].replace(/VND/i, '').replace(/,/g, '').trim()
            }
          }
        })

        ElMessage.success('读取成功')
      } catch (err) {
        console.error('读取失败:', err)
        ElMessage.error('读取失败')
      }
    }

    return () => (
      <div class="flex justify-center mt-100px">
        <div class="w-50%">
          <ElForm ref={formRef} model={formData} rules={rules} labelWidth="100px">
            <ElFormItem label="银行代码" prop="bankCode">
              <ElSelect v-model={formData.bankCode} placeholder="请选择银行" class="w-full">
                {bankCodeOtions.map((option) => (
                  <ElOption key={option.value} label={option.label} value={option.value} />
                ))}
              </ElSelect>
            </ElFormItem>

            <ElFormItem label="卡号" prop="cardNumber">
              <ElInput v-model={formData.cardNumber} placeholder="请输入卡号" />
            </ElFormItem>

            <ElFormItem label="姓名" prop="name">
              <ElInput v-model={formData.name} placeholder="请输入姓名" />
            </ElFormItem>

            <ElFormItem label="备注" prop="remark">
              <ElInput v-model={formData.remark} placeholder="请输入备注" />
            </ElFormItem>

            <ElFormItem label="金额" prop="amount">
              <ElInput v-model={formData.amount} placeholder="请输入金额" type="number" />
            </ElFormItem>
            <ElFormItem label="商户" prop="merchant">
              <ElInput
                disabled
                v-model={formData.merchant}
                placeholder="请输入商户"
                type="number"
              />
            </ElFormItem>

            <ElFormItem>
              <ElButton type="primary" onClick={copyToClipboard}>
                复制
              </ElButton>
              <ElButton onClick={resetForm} class="ml-4">
                清空
              </ElButton>
              <ElButton type="success" class="ml-4" onClick={readFromClipboard}>
                读取数据
              </ElButton>
            </ElFormItem>
          </ElForm>
        </div>
      </div>
    )
  }
})

export default Demo

const getBankCodeOptions = () => {
  const bankCode = [
    { label: 'ICB', value: 'ICB' },
    { label: 'VCB', value: 'VCB' },
    { label: 'BIDV', value: 'BIDV' },
    { label: 'VBA', value: 'VBA' },
    { label: 'OCB', value: 'OCB' },
    { label: 'MB', value: 'MB' },
    { label: 'TCB', value: 'TCB' },
    { label: 'ACB', value: 'ACB' },
    { label: 'VPB', value: 'VPB' },
    { label: 'TPB', value: 'TPB' },
    { label: 'STB', value: 'STB' },
    { label: 'HDB', value: 'HDB' },
    { label: 'VCCB', value: 'VCCB' },
    { label: 'SCB', value: 'SCB' },
    { label: 'VIB', value: 'VIB' },
    { label: 'SHB', value: 'SHB' },
    { label: 'EIB', value: 'EIB' },
    { label: 'MSB', value: 'MSB' },
    { label: 'CAKE', value: 'CAKE' },
    { label: 'Ubank', value: 'Ubank' },
    { label: 'TIMO', value: 'TIMO' },
    { label: 'VTLMONEY', value: 'VTLMONEY' },
    { label: 'VNPTMONEY', value: 'VNPTMONEY' },
    { label: 'SGICB', value: 'SGICB' },
    { label: 'BAB', value: 'BAB' },
    { label: 'PVCB', value: 'PVCB' },
    { label: 'Oceanbank', value: 'Oceanbank' },
    { label: 'NCB', value: 'NCB' },
    { label: 'SHBVN', value: 'SHBVN' },
    { label: 'ABB', value: 'ABB' },
    { label: 'VAB', value: 'VAB' },
    { label: 'NAB', value: 'NAB' },
    { label: 'PGB', value: 'PGB' },
    { label: 'VIETBANK', value: 'VIETBANK' },
    { label: 'BVB', value: 'BVB' },
    { label: 'SEAB', value: 'SEAB' },
    { label: 'COOPBANK', value: 'COOPBANK' },
    { label: 'LPB', value: 'LPB' },
    { label: 'KLB', value: 'KLB' },
    { label: 'KBank', value: 'KBank' },
    { label: 'UOB', value: 'UOB' },
    { label: 'SCVN', value: 'SCVN' },
    { label: 'PBVN', value: 'PBVN' },
    { label: 'NHB HN', value: 'NHB HN' },
    { label: 'IVB', value: 'IVB' },
    { label: 'IBK - HCM', value: 'IBK - HCM' },
    { label: 'IBK - HN', value: 'IBK - HN' },
    { label: 'VRB', value: 'VRB' },
    { label: 'WVN', value: 'WVN' },
    { label: 'KBHN', value: 'KBHN' },
    { label: 'KBHCM', value: 'KBHCM' },
    { label: 'HSBC', value: 'HSBC' },
    { label: 'HLBVN', value: 'HLBVN' },
    { label: 'GPB', value: 'GPB' },
    { label: 'DOB', value: 'DOB' },
    { label: 'DBS', value: 'DBS' },
    { label: 'CIMB', value: 'CIMB' },
    { label: 'CBB', value: 'CBB' },
    { label: 'CITIBANK', value: 'CITIBANK' },
    { label: 'KEBHANAHCM', value: 'KEBHANAHCM' },
    { label: 'KEBHANAHN', value: 'KEBHANAHN' },
    { label: 'MAFC', value: 'MAFC' },
    { label: 'VBSP', value: 'VBSP' }
  ]
  return bankCode
}
