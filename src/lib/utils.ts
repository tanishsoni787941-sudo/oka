import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatInTimeZone, toZonedTime, fromZonedTime } from "date-fns-tz"
import { differenceInCalendarDays, addDays, set } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const IST_TIMEZONE = "Asia/Kolkata"

export function getCurrentISTDate() {
  return toZonedTime(new Date(), IST_TIMEZONE)
}

export function getDaysSinceRegistration(createdAt: Date) {
  const createdIST = toZonedTime(createdAt, IST_TIMEZONE)
  const currentIST = getCurrentISTDate()
  return differenceInCalendarDays(currentIST, createdIST)
}

export function isLiveClassTime() {
  const now = getCurrentISTDate()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  
  // 4:00 PM (16:00) to 5:30 PM (17:30)
  if (hours === 16) return true;
  if (hours === 17 && minutes <= 30) return true;
  return false;
}

export function hasReachedUnlockTime() {
  const now = getCurrentISTDate()
  const hours = now.getHours()
  // 4:00 PM (16:00) or later
  return hours >= 16;
}

export function getUnlockTime(createdAt: Date, unlockDayOffset: number): Date {
  const createdIST = toZonedTime(createdAt, IST_TIMEZONE)
  const unlockDateIST = addDays(createdIST, unlockDayOffset)
  const unlockTimeIST = set(unlockDateIST, { hours: 16, minutes: 0, seconds: 0, milliseconds: 0 })
  return fromZonedTime(unlockTimeIST, IST_TIMEZONE)
}
