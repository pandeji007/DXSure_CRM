import { useState } from 'react';
import { Activity, Search, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/ui/Table';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import { useActivityLogs } from '../../hooks/useActivityLogs';
import { useEmployees } from '../../hooks/useEmployees';
import { formatDateTime, formatRelative } from '../../lib/utils';

const actionOptions = [
  { value: 'user_login', label: 'Login' },
  { value: 'created_client', label: 'Created Client' },
  { value: 'updated_client', label: 'Updated Client' },
  { value: 'created_lead', label: 'Created Lead' },
  { value: 'converted_lead', label: 'Converted Lead' },
  { value: 'created_ticket', label: 'Created Ticket' },
  { value: 'completed_ticket', label: 'Completed Ticket' },
  { value: 'created_followup', label: 'Created Follow-up' },
  { value: 'recorded_payment', label: 'Recorded Payment' },
  { value: 'created_day_plan', label: 'Created Day Plan' },
];

const columns = [
  {
    key: 'profile',
    label: 'User',
    render: (value) => value ? (
      <div className="flex items-center gap-2">
        <Avatar name={value.name} size="sm" />
        <span className="text-sm">{value.name}</span>
      </div>
    ) : <span className="text-text-muted">—</span>,
  },
  {
    key: 'action',
    label: 'Action',
    render: (value) => (
      <Badge color="info" variant="outline" className="text-xs">
        {value?.replace(/_/g, ' ')}
      </Badge>
    ),
  },
  {
    key: 'description',
    label: 'Description',
    render: (value) => <span className="text-sm text-text-secondary">{value || '—'}</span>,
  },
  {
    key: 'entity_type',
    label: 'Entity',
    render: (value) => <span className="text-xs text-text-muted capitalize">{value || '—'}</span>,
  },
  {
    key: 'created_at',
    label: 'Time',
    sortable: true,
    render: (value) => (
      <div>
        <p className="text-xs text-text-secondary">{formatDateTime(value)}</p>
        <p className="text-xs text-text-muted">{formatRelative(value)}</p>
      </div>
    ),
  },
];

export default function ActivityPage() {
  const [filters, setFilters] = useState({ user_id: '', action: '', date_from: '', date_to: '' });
  const { data: employees } = useEmployees();
  const { data: logs, isLoading } = useActivityLogs(filters);

  const employeeOptions = (employees || []).map((e) => ({ value: e.id, label: e.name }));

  return (
    <PageWrapper>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight flex items-center gap-2">
          <Activity className="w-6 h-6 text-primary" /> Activity Logs
        </h1>
        <p className="text-sm text-text-secondary mt-1">Complete audit trail of all CRM actions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Select
          placeholder="All Users"
          options={employeeOptions}
          value={filters.user_id}
          onChange={(e) => setFilters({ ...filters, user_id: e.target.value })}
        />
        <Select
          placeholder="All Actions"
          options={actionOptions}
          value={filters.action}
          onChange={(e) => setFilters({ ...filters, action: e.target.value })}
        />
        <Input
          type="date"
          placeholder="From"
          value={filters.date_from}
          onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
        />
        <Input
          type="date"
          placeholder="To"
          value={filters.date_to}
          onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
        />
      </div>

      <Table
        columns={columns}
        data={logs}
        loading={isLoading}
        emptyTitle="No activity logs"
        emptyDescription="Activities will appear here as actions are performed."
      />
    </PageWrapper>
  );
}
