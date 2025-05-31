import dayjs from 'dayjs'

const FORMATS = {
  short: 'DD.MM.YYYY',
  long: 'DD MMM YYYY',
}

export function formatDate(
  date: string,
  format: keyof typeof FORMATS = 'short',
) {
  return dayjs(date).format(FORMATS[format])
}

export function formatContestDuration({
  startDate,
  expectedEndDate,
  endDate,
}: {
  startDate: string
  expectedEndDate: string
  endDate: string | null
}) {
  return `${formatDate(startDate, 'long')} - ${formatDate(endDate ?? expectedEndDate, 'long')}`
}
