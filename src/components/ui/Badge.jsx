import { cn } from '../../lib/utils';

const colorMap = {
  success: 'bg-success/15 text-success border-success/20',
  warning: 'bg-warning/15 text-warning border-warning/20',
  danger: 'bg-danger/15 text-danger border-danger/20',
  info: 'bg-primary/15 text-primary border-primary/20',
  muted: 'bg-text-muted/15 text-text-muted border-text-muted/20',
  secondary: 'bg-secondary/15 text-secondary border-secondary/20',
};

const outlineColorMap = {
  success: 'border-success/40 text-success',
  warning: 'border-warning/40 text-warning',
  danger: 'border-danger/40 text-danger',
  info: 'border-primary/40 text-primary',
  muted: 'border-text-muted/40 text-text-muted',
  secondary: 'border-secondary/40 text-secondary',
};

export default function Badge({
  children,
  color = 'info',
  variant = 'solid',
  className,
}) {
  const isOutline = variant === 'outline';

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-[6px] border',
        isOutline ? outlineColorMap[color] : colorMap[color],
        isOutline && 'bg-transparent',
        className
      )}
    >
      {children}
    </span>
  );
}
