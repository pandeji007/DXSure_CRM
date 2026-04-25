import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isValid } from 'date-fns';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parseDateValue(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return isValid(value) ? value : null;
  }

  if (typeof value === 'string' && DATE_ONLY_PATTERN.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    const parsedDate = new Date(year, month - 1, day);
    return isValid(parsedDate) ? parsedDate : null;
  }

  const parsedDate = new Date(value);
  return isValid(parsedDate) ? parsedDate : null;
}

export function formatDate(date) {
  const parsedDate = parseDateValue(date);

  if (!parsedDate) {
    return '—';
  }

  return format(parsedDate, 'MMM dd, yyyy');
}

export function formatDateTime(date) {
  const parsedDate = parseDateValue(date);

  if (!parsedDate) {
    return '—';
  }

  return format(parsedDate, 'MMM dd, yyyy hh:mm a');
}

export function formatRelative(date) {
  const parsedDate = parseDateValue(date);

  if (!parsedDate) {
    return '—';
  }

  return formatDistanceToNow(parsedDate, { addSuffix: true });
}

export function formatCurrency(amount) {
  if (amount == null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str, len = 50) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '…' : str;
}

export function toDateInputValue(date = new Date()) {
  const parsedDate = parseDateValue(date);

  if (!parsedDate) {
    return '';
  }

  const normalizedDate = new Date(parsedDate.getTime() - parsedDate.getTimezoneOffset() * 60000);
  return normalizedDate.toISOString().slice(0, 10);
}

export function toDateTimeLocalInputValue(date) {
  const parsedDate = parseDateValue(date);

  if (!parsedDate) {
    return '';
  }

  const normalizedDate = new Date(parsedDate.getTime() - parsedDate.getTimezoneOffset() * 60000);
  return normalizedDate.toISOString().slice(0, 16);
}

export function fromDateTimeLocalInputValue(value) {
  const parsedDate = parseDateValue(value);

  if (!parsedDate) {
    return null;
  }

  return parsedDate.toISOString();
}

export function isSameLocalDate(date, compareDate = new Date()) {
  const parsedDate = parseDateValue(date);
  const parsedCompareDate = parseDateValue(compareDate);

  if (!parsedDate || !parsedCompareDate) {
    return false;
  }

  return toDateInputValue(parsedDate) === toDateInputValue(parsedCompareDate);
}
