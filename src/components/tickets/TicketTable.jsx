import Table from '../ui/Table';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import { formatDate } from '../../lib/utils';
import { STATUS_COLORS } from '../../constants';

const columns = [
  {
    key: 'title',
    label: 'Ticket',
    sortable: true,
    render: (value, row) => (
      <div>
        <p className="font-medium text-text-primary">{value}</p>
        <p className="text-xs text-text-muted truncate max-w-[200px]">{row.description}</p>
      </div>
    ),
  },
  {
    key: 'assigned_to_profile',
    label: 'Assigned To',
    render: (value) => value?.name ? (
      <div className="flex items-center gap-2">
        <Avatar name={value.name} size="sm" />
        <span className="text-sm">{value.name}</span>
      </div>
    ) : <span className="text-text-muted">—</span>,
  },
  {
    key: 'priority',
    label: 'Priority',
    render: (value) => <Badge color={STATUS_COLORS[value] || 'muted'} variant="outline">{value}</Badge>,
  },
  {
    key: 'status',
    label: 'Status',
    render: (value) => <Badge color={STATUS_COLORS[value] || 'muted'}>{value?.replace(/_/g, ' ')}</Badge>,
  },
  {
    key: 'due_date',
    label: 'Due Date',
    sortable: true,
    render: (value) => <span className="text-text-secondary text-xs">{formatDate(value)}</span>,
  },
];

export default function TicketTable({ data, loading, onRowClick, emptyAction }) {
  return (
    <Table
      columns={columns}
      data={data}
      loading={loading}
      onRowClick={onRowClick}
      emptyTitle="No tickets yet"
      emptyDescription="Create tickets to track and assign tasks."
      emptyAction={emptyAction}
    />
  );
}
