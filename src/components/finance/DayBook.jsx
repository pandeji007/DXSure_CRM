import Table from '../ui/Table';
import Badge from '../ui/Badge';
import { formatDate, formatCurrency } from '../../lib/utils';
import { getFinanceDirection } from '../../lib/finance';

const typeColors = {
  payment: 'success',
  salary: 'warning',
  petty_cash: 'info',
  expense: 'danger',
};

const columns = [
  {
    key: 'entry_date',
    label: 'Date',
    sortable: true,
    render: (value) => <span className="text-text-secondary text-xs">{formatDate(value)}</span>,
  },
  {
    key: 'type',
    label: 'Type',
    render: (value) => <Badge color={typeColors[value] || 'muted'}>{value?.replace(/_/g, ' ')}</Badge>,
  },
  {
    key: 'description',
    label: 'Description',
    render: (value) => <span className="text-sm truncate max-w-[200px] block">{value || '—'}</span>,
  },
  {
    key: 'client',
    label: 'Client',
    render: (value) => <span className="text-sm text-text-secondary">{value?.name || '—'}</span>,
  },
  {
    key: 'amount',
    label: 'Amount',
    sortable: true,
    render: (value, row) => {
      const direction = row.direction || getFinanceDirection(row.type);
      const isInflow = direction === 'inflow';

      return (
        <span className={isInflow ? 'text-success font-medium' : 'text-danger font-medium'}>
          {isInflow ? '+' : '-'}{formatCurrency(value).replace('-', '')}
        </span>
      );
    },
  },
  {
    key: 'signed_amount',
    label: 'Impact',
    sortable: true,
    render: (value) => (
      <span className={value >= 0 ? 'text-success text-xs font-medium' : 'text-danger text-xs font-medium'}>
        {formatCurrency(value)}
      </span>
    ),
  },
  {
    key: 'payment_method',
    label: 'Method',
    render: (value) => <span className="text-xs text-text-muted capitalize">{value?.replace(/_/g, ' ') || '—'}</span>,
  },
];

export default function DayBook({ data, loading }) {
  return (
    <Table
      columns={columns}
      data={data}
      loading={loading}
      emptyTitle="No financial entries"
      emptyDescription="Start recording payments and expenses."
    />
  );
}
