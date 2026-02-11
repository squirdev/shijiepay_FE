/**
 * Independent time operation toolto facilitate subsequent switch to dayjs
 */
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

// 设置默认时区为北京时间
dayjs.tz.setDefault('Asia/Shanghai')

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'
const DATE_FORMAT = 'YYYY-MM-DD'

export const todayStart = formatToDateTime(dayjs().startOf('day'))
export const tomorrowStart = formatToDateTime(dayjs().add(1, 'day').startOf('day'))

export function formatToDateTime(date?: dayjs.ConfigType, format = DATE_TIME_FORMAT): string {
  return dayjs(date).tz().format(format)
}

export function formatToDate(date?: dayjs.ConfigType, format = DATE_FORMAT): string {
  return dayjs(date).tz().format(format)
}

/**
 * 判断当前时间是否比给定时间字符串大 N 分钟
 * @param timeStr - 时间字符串（如 "15:45:16" 或 "08:30"）
 * @param minutes - 要比较的分钟数（如 30）
 * @returns boolean
 */
export function isCurrentTimeAfterByMinutes(timeStr: string, minutes: number): boolean {
  const targetTime = dayjs(timeStr)
  const nowPlusMinutes = dayjs().add(minutes, 'minute')
  return targetTime.isAfter(nowPlusMinutes)
}
export const dateUtil = dayjs
