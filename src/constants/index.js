export const LEAD_STATUSES = [
  { value: 'new', label: 'New', color: 'bg-blue-500' },
  { value: 'contacted', label: 'Contacted', color: 'bg-yellow-500' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-orange-500' },
  { value: 'qualified', label: 'Qualified', color: 'bg-purple-500' },
  { value: 'converted', label: 'Converted', color: 'bg-green-500' },
  { value: 'lost', label: 'Lost', color: 'bg-red-500' },
];

export const LEAD_PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export const LEAD_SOURCES = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'cold_call', label: 'Cold Call' },
  { value: 'email', label: 'Email Campaign' },
  { value: 'event', label: 'Event' },
  { value: 'other', label: 'Other' },
];

export const CLIENT_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'churned', label: 'Churned' },
];

export const TICKET_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const TICKET_PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

export const FOLLOWUP_TYPES = [
  { value: 'call', label: 'Phone Call' },
  { value: 'email', label: 'Email' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'visit', label: 'Site Visit' },
  { value: 'other', label: 'Other' },
];

export const FOLLOWUP_STATUSES = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'missed', label: 'Missed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'card', label: 'Card' },
  { value: 'other', label: 'Other' },
];

export const FINANCE_TYPES = [
  { value: 'payment', label: 'Payment Received' },
  { value: 'salary', label: 'Salary' },
  { value: 'petty_cash', label: 'Petty Cash' },
  { value: 'expense', label: 'Expense' },
];

export const DAYPLAN_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export const DEPARTMENTS = [
  { value: 'sales', label: 'Sales' },
  { value: 'support', label: 'Support' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'finance', label: 'Finance' },
  { value: 'operations', label: 'Operations' },
  { value: 'hr', label: 'HR' },
];

export const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'employee', label: 'Employee' },
];

export const STATUS_COLORS = {
  new: 'info',
  contacted: 'warning',
  in_progress: 'warning',
  qualified: 'info',
  converted: 'success',
  lost: 'danger',
  active: 'success',
  inactive: 'muted',
  churned: 'danger',
  pending: 'warning',
  completed: 'success',
  cancelled: 'muted',
  critical: 'danger',
  high: 'danger',
  medium: 'warning',
  low: 'info',
  urgent: 'danger',
  scheduled: 'info',
  missed: 'danger',
  draft: 'muted',
  submitted: 'info',
  approved: 'success',
  rejected: 'danger',
};
