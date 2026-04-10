import { cn } from '../../lib/utils';

const variantClasses = {
  text: 'h-4 w-full rounded',
  heading: 'h-6 w-3/4 rounded',
  card: 'h-32 w-full rounded-card',
  avatar: 'h-10 w-10 rounded-full',
  'table-row': 'h-12 w-full rounded',
  button: 'h-9 w-24 rounded-btn',
};

export default function Skeleton({ variant = 'text', className, count = 1 }) {
  const items = Array.from({ length: count });

  return (
    <>
      {items.map((_, i) => (
        <div
          key={i}
          className={cn(
            'bg-elevated shimmer-bg animate-shimmer',
            variantClasses[variant],
            className
          )}
        />
      ))}
    </>
  );
}
