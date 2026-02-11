export const setIndex = (reserveIndex: boolean, index: number, size: number, current: number) => {
  const newIndex = index + 1
  if (reserveIndex) {
    return size * (current - 1) + newIndex
  } else {
    return newIndex
  }
}

/**
 * 根据表头文字长度计算列宽
 * @param label 表头文字
 * @param minWidth 最小宽度（如果提供则优先使用）
 * @returns 计算后的列宽
 */
export const calculateColumnWidth = (
  label?: string,
  minWidth?: string | number
): string | number | undefined => {
  // 如果提供了 minWidth，优先使用
  if (minWidth !== undefined && minWidth !== null) {
    return minWidth
  }

  // 如果没有 label，返回 undefined 让表格自动处理
  if (!label) {
    return undefined
  }

  // 根据文字长度计算宽度
  // 中文字符宽度约为 16px，英文字符宽度约为 8px
  // 加上 padding 和 icon 等额外空间
  let width = 0
  for (let i = 0; i < label.length; i++) {
    const charCode = label.charCodeAt(i)
    // 判断是否为中文字符（CJK Unicode 范围）
    if (charCode >= 0x4e00 && charCode <= 0x9fff) {
      width += 16
    } else {
      width += 8
    }
  }

  // 加上 padding 和其他空间（左右各 12px padding + 4px border）
  width += 28

  // 最小宽度 80px，最大宽度 300px
  return Math.max(80, Math.min(width, 300))
}
