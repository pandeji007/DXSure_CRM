import { cn } from '../../lib/utils';
import { ArrowUpDown, Inbox } from 'lucide-react';
import Skeleton from './Skeleton';

export default function Table({
  columns,
  data,
  onRowClick,
  loading,
  emptyTitle = 'No data found',
  emptyDescription = 'Try adjusting your filters or adding new items.',
  emptyAction,
  sortConfig,
  onSort,
  className,
}) {
  if (loading) {
    return (
      <div className="overflow-x-auto rounded-card border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left px-4 py-3 text-xs font-medium tracking-widest uppercase text-text-muted"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-border last:border-0">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <Skeleton variant="text" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 rounded-card border border-border bg-card">
        <div className="w-14 h-14 rounded-2xl bg-elevated flex items-center justify-center mb-4">
          <Inbox className="w-7 h-7 text-text-muted" />
        </div>
        <h3 className="text-base font-semibold text-text-primary mb-1">{emptyTitle}</h3>
        <p className="text-sm text-text-secondary mb-4 text-center max-w-sm">
          {emptyDescription}
        </p>
        {emptyAction}
      </div>
    );
  }

  return (
    <div className={cn('overflow-x-auto rounded-card border border-border', className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-surface">
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable && onSort?.(col.key)}
                className={cn(
                  'text-left px-4 py-3 text-xs font-medium tracking-widest uppercase text-text-muted',
                  col.sortable && 'cursor-pointer hover:text-text-secondary select-none'
                )}
              >
                <span className="flex items-center gap-1.5">
                  {col.label}
                  {col.sortable && (
                    <ArrowUpDown className={cn(
                      'w-3 h-3',
                      sortConfig?.key === col.key && 'text-primary'
                    )} />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={row.id || i}
              onClick={() => onRowClick?.(row)}
              className={cn(
                'border-b border-border last:border-0 transition-colors duration-150',
                'hover:bg-elevated',
                onRowClick && 'cursor-pointer'
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="px-4 py-3 text-sm text-text-primary"
                >
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
