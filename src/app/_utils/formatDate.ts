import dayjs from 'dayjs'

const FORMATS = {
  short: 'DD.MM.YYYY',
  long: 'DD MMM YYYY',
}

export function formatDate(date: string, format: keyof typeof FORMATS = 'short') {
  return dayjs(date).format(FORMATS[format])
}

export function formatContestDuration({ startDate, endDate }: { startDate: string; endDate: string }) {
  return `${formatDate(startDate, 'long')} - ${formatDate(endDate, 'long')}`
}
