import { cn, getInitials } from '../../lib/utils';

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

export default function Avatar({ name, src, size = 'md', className }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={cn(
          'rounded-full object-cover border border-border',
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold',
        'bg-primary/15 text-primary border border-primary/20',
        sizeClasses[size],
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}
