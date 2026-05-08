import { startOfWeek, format, addWeeks, subWeeks } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function getMondayOfWeek(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 })
}

export function formatWeekRange(semanaRef: Date): string {
  const monday = getMondayOfWeek(semanaRef)
  const friday = new Date(monday)
  friday.setDate(friday.getDate() + 4)

  const startStr = format(monday, 'dd/MM/yyyy', { locale: ptBR })
  const endStr = format(friday, 'dd/MM/yyyy', { locale: ptBR })

  return `${startStr} a ${endStr}`
}

export function formatFullWeekRange(semanaRef: Date): string {
  const monday = getMondayOfWeek(semanaRef)
  const friday = new Date(monday)
  friday.setDate(friday.getDate() + 4)

  const startStr = format(monday, 'd', { locale: ptBR })
  const endStr = format(friday, 'd \\d\\e MMMM \\d\\e yyyy', { locale: ptBR })

  return `Semana de ${startStr} a ${endStr}`
}

export function getNextWeek(date: Date): Date {
  return addWeeks(getMondayOfWeek(date), 1)
}

export function getPreviousWeek(date: Date): Date {
  return subWeeks(getMondayOfWeek(date), 1)
}

export function getCurrentWeekMonday(): Date {
  return getMondayOfWeek(new Date())
}

export function formatDate(date: Date): string {
  return format(date, 'dd/MM/yyyy', { locale: ptBR })
}

export function formatDateISO(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function formatDateTime(date: Date): string {
  return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR })
}

export function isSameWeek(date1: Date, date2: Date): boolean {
  const monday1 = getMondayOfWeek(date1)
  const monday2 = getMondayOfWeek(date2)
  return monday1.getTime() === monday2.getTime()
}
