import { ElMessageBox, type ElMessageBoxOptions } from 'element-plus'

let isShowing = false

export function showMessageBox(
  options: ElMessageBoxOptions
): Promise<'confirm' | 'cancel' | 'close'> {
  if (isShowing) {
    return Promise.reject('MessageBox is already showing')
  }

  isShowing = true

  return ElMessageBox({
    ...options,
    closeOnClickModal: false,
    closeOnPressEscape: false
  }).finally(() => {
    isShowing = false
  })
}
