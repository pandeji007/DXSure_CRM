import Table from '../ui/Table';
import Badge from '../ui/Badge';
import { formatDate, formatCurrency } from '../../lib/utils';
import { STATUS_COLORS } from '../../constants';
import { formatLeadSource } from '../../lib/leads';

const columns = [
  {
    key: 'title',
    label: 'Lead',
    sortable: true,
    render: (value, row) => (
      <div>
        <p className="font-medium text-text-primary">{value}</p>
        <p className="text-xs text-text-muted">{row.contact_name}</p>
      </div>
    ),
  },
  { key: 'company', label: 'Company', sortable: true },
  {
    key: 'value',
    label: 'Value',
    sortable: true,
    render: (value) => (
      <span className="text-secondary font-medium">{value ? formatCurrency(value) : '—'}</span>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    render: (value) => (
      <Badge color={STATUS_COLORS[value] || 'muted'}>
        {value?.replace(/_/g, ' ')}
      </Badge>
    ),
  },
  {
    key: 'priority',
    label: 'Priority',
    render: (value) => (
      <Badge color={STATUS_COLORS[value] || 'muted'} variant="outline">
        {value}
      </Badge>
    ),
  },
  {
    key: 'source',
    label: 'Source',
    render: (value) => (
      <span className="text-text-secondary text-xs">{formatLeadSource(value)}</span>
    ),
  },
  {
    key: 'expected_close_date',
    label: 'Close Date',
    sortable: true,
    render: (value) => <span className="text-text-secondary text-xs">{formatDate(value)}</span>,
  },
];

export default function LeadTable({ data, loading, onRowClick, emptyAction }) {
  return (
    <Table
      columns={columns}
      data={data}
      loading={loading}
      onRowClick={onRowClick}
      emptyTitle="No leads yet"
      emptyDescription="Start tracking your sales pipeline by adding leads."
      emptyAction={emptyAction}
    />
  );
}
