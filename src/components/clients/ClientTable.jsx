import Table from '../ui/Table';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import { formatDate } from '../../lib/utils';
import { STATUS_COLORS } from '../../constants';

const columns = [
  {
    key: 'name',
    label: 'Client',
    sortable: true,
    render: (value, row) => (
      <div className="flex items-center gap-3">
        <Avatar name={value} size="sm" />
        <div>
          <p className="font-medium text-text-primary">{value}</p>
          <p className="text-xs text-text-muted">{row.email}</p>
        </div>
      </div>
    ),
  },
  { key: 'company', label: 'Company', sortable: true },
  { key: 'phone', label: 'Phone' },
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
    key: 'created_at',
    label: 'Created',
    sortable: true,
    render: (value) => <span className="text-text-secondary text-xs">{formatDate(value)}</span>,
  },
];

export default function ClientTable({ data, loading, onRowClick, emptyAction }) {
  return (
    <Table
      columns={columns}
      data={data}
      loading={loading}
      onRowClick={onRowClick}
      emptyTitle="No clients yet"
      emptyDescription="Start building your client base by adding your first client."
      emptyAction={emptyAction}
    />
  );
}
