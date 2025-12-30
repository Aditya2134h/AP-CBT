export function formatDate(date: Date | string, format: string = 'MMMM d, yyyy'): string {
  const d = new Date(date);
  
  return new Intl.DateTimeFormat('en-US', {
    year: format.includes('yyyy') ? 'numeric' : undefined,
    month: format.includes('MMMM') ? 'long' : format.includes('MMM') ? 'short' : format.includes('MM') ? '2-digit' : undefined,
    day: format.includes('d') ? 'numeric' : undefined,
    hour: format.includes('HH') ? '2-digit' : undefined,
    minute: format.includes('mm') ? '2-digit' : undefined,
    second: format.includes('ss') ? '2-digit' : undefined,
    hour12: format.includes('a') || format.includes('A'),
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  return formatDate(date, 'MMMM d, yyyy h:mm a');
}

export function formatTime(date: Date | string): string {
  return formatDate(date, 'h:mm a');
}

export function formatShortDate(date: Date | string): string {
  return formatDate(date, 'MM/dd/yyyy');
}

export function formatISODate(date: Date | string): string {
  return new Date(date).toISOString();
}

export function getTimeAgo(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return interval + ' year' + (interval === 1 ? '' : 's') + ' ago';
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return interval + ' month' + (interval === 1 ? '' : 's') + ' ago';
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval + ' day' + (interval === 1 ? '' : 's') + ' ago';
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval + ' hour' + (interval === 1 ? '' : 's') + ' ago';
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval + ' minute' + (interval === 1 ? '' : 's') + ' ago';
  
  return Math.floor(seconds) + ' second' + (seconds === 1 ? '' : 's') + ' ago';
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addHours(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

export function addMinutes(date: Date, minutes: number): Date {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function isBefore(date1: Date, date2: Date): boolean {
  return date1.getTime() < date2.getTime();
}

export function isAfter(date1: Date, date2: Date): boolean {
  return date1.getTime() > date2.getTime();
}

export function isBetween(date: Date, start: Date, end: Date): boolean {
  return isAfter(date, start) && isBefore(date, end);
}

export function getCountdown(endDate: Date): { days: number; hours: number; minutes: number; seconds: number } {
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { days, hours, minutes, seconds };
}

export function formatCountdown(countdown: { days: number; hours: number; minutes: number; seconds: number }): string {
  const parts = [];
  
  if (countdown.days > 0) parts.push(`${countdown.days}d`);
  if (countdown.hours > 0) parts.push(`${countdown.hours}h`);
  if (countdown.minutes > 0) parts.push(`${countdown.minutes}m`);
  if (countdown.seconds > 0 || parts.length === 0) parts.push(`${countdown.seconds}s`);
  
  return parts.join(' ');
}