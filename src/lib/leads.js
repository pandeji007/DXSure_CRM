const LEAD_SOURCE_LABELS = {
  website: 'Website',
  referral: 'Referral',
  social_media: 'Social Media',
  cold_call: 'Cold Call',
  email: 'Email Campaign',
  other: 'Other',
};

const LEGACY_LEAD_SOURCE_ALIASES = {
  email_campaign: 'email',
  event: 'other',
};

export const SUPPORTED_LEAD_SOURCES = Object.keys(LEAD_SOURCE_LABELS);

export const LEAD_SOURCE_OPTIONS = SUPPORTED_LEAD_SOURCES.map((value) => ({
  value,
  label: LEAD_SOURCE_LABELS[value],
}));

function humanizeLeadSource(source) {
  return source
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function normalizeLeadSource(source, { fallback = null } = {}) {
  if (source == null) {
    return null;
  }

  const normalizedValue = String(source)
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

  if (!normalizedValue) {
    return null;
  }

  const aliasedValue = LEGACY_LEAD_SOURCE_ALIASES[normalizedValue] || normalizedValue;

  if (SUPPORTED_LEAD_SOURCES.includes(aliasedValue)) {
    return aliasedValue;
  }

  return fallback;
}

export function formatLeadSource(source) {
  const normalizedValue = normalizeLeadSource(source, { fallback: null });

  if (!normalizedValue) {
    if (!source) {
      return '—';
    }

    return humanizeLeadSource(String(source));
  }

  return LEAD_SOURCE_LABELS[normalizedValue] || humanizeLeadSource(normalizedValue);
}
