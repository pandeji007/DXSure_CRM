import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const variants = {
  primary:
    'bg-primary hover:bg-primary-hover text-white shadow-glow-sm hover:shadow-glow',
  secondary:
    'bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/20',
  ghost:
    'bg-transparent hover:bg-white/[0.04] text-text-secondary hover:text-text-primary',
  danger:
    'bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20 hover:shadow-[0_0_20px_rgba(255,71,87,0.15)]',
  outline:
    'bg-transparent border border-border hover:border-border-hover text-text-primary hover:bg-white/[0.02]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-2.5 text-base gap-2',
};

const Button = forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      icon: Icon,
      iconRight: IconRight,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-btn transition-all duration-200 cursor-pointer',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : Icon ? (
          <Icon className="w-4 h-4" />
        ) : null}
        {children}
        {IconRight && !loading && <IconRight className="w-4 h-4" />}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
