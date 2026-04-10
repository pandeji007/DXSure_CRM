import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(date) {
  if (!date) return '—';
  return format(new Date(date), 'MMM dd, yyyy');
}

export function formatDateTime(date) {
  if (!date) return '—';
  return format(new Date(date), 'MMM dd, yyyy hh:mm a');
}

export function formatRelative(date) {
  if (!date) return '—';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
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
