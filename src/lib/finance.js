import { format } from 'date-fns';

const INFLOW_TYPES = new Set(['payment', 'petty_cash']);
const OUTFLOW_TYPES = new Set(['salary', 'expense']);

export function getFinanceAmountValue(amount) {
  const numericAmount = Number(amount ?? 0);
  return Number.isFinite(numericAmount) ? Math.abs(numericAmount) : 0;
}

export function getFinanceDirection(type) {
  if (INFLOW_TYPES.has(type)) {
    return 'inflow';
  }

  if (OUTFLOW_TYPES.has(type)) {
    return 'outflow';
  }

  return 'neutral';
}

export function getFinanceSignedAmount(entry) {
  const absoluteAmount = getFinanceAmountValue(entry?.amount);
  const direction = getFinanceDirection(entry?.type);

  if (direction === 'outflow') {
    return -absoluteAmount;
  }

  if (direction === 'inflow') {
    return absoluteAmount;
  }

  return 0;
}

export function normalizeFinanceEntry(entry) {
  if (!entry) {
    return entry;
  }

  const amount = getFinanceAmountValue(entry.amount);
  const direction = getFinanceDirection(entry.type);

  return {
    ...entry,
    amount,
    direction,
    signed_amount: direction === 'outflow' ? -amount : direction === 'inflow' ? amount : 0,
  };
}

export function normalizeFinanceEntries(entries = []) {
  return entries.map(normalizeFinanceEntry);
}

export function calculateFinanceTotals(entries = []) {
  const normalizedEntries = normalizeFinanceEntries(entries);

  return normalizedEntries.reduce(
    (totals, entry) => {
      if (entry.direction === 'inflow') {
        totals.inflow += entry.amount;
      }

      if (entry.direction === 'outflow') {
        totals.outflow += entry.amount;
      }

      totals.net += entry.signed_amount;
      return totals;
    },
    {
      inflow: 0,
      outflow: 0,
      net: 0,
      entries: normalizedEntries,
    }
  );
}

export function buildFinanceMonthlySeries(entries = []) {
  const normalizedEntries = normalizeFinanceEntries(entries);
  const monthlyBuckets = new Map();

  normalizedEntries.forEach((entry) => {
    if (!entry?.entry_date) {
      return;
    }

    const parsedDate = new Date(entry.entry_date);
    if (Number.isNaN(parsedDate.getTime())) {
      return;
    }

    const monthKey = format(parsedDate, 'yyyy-MM');
    const monthLabel = format(parsedDate, 'MMM yyyy');
    const bucket = monthlyBuckets.get(monthKey) || {
      monthKey,
      monthLabel,
      inflow: 0,
      outflow: 0,
      net: 0,
    };

    if (entry.direction === 'inflow') {
      bucket.inflow += entry.amount;
    }

    if (entry.direction === 'outflow') {
      bucket.outflow += entry.amount;
    }

    bucket.net += entry.signed_amount;
    monthlyBuckets.set(monthKey, bucket);
  });

  return Array.from(monthlyBuckets.values())
    .sort((left, right) => left.monthKey.localeCompare(right.monthKey))
    .slice(-12);
}
