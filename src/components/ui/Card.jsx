import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const cardVariants = {
  default: 'bg-card border-border',
  elevated: 'bg-elevated border-border',
  ghost: 'bg-transparent border-transparent',
};

export default function Card({
  children,
  variant = 'default',
  hover = true,
  className,
  onClick,
  ...props
}) {
  return (
    <motion.div
      whileHover={
        hover
          ? {
              scale: 1.01,
              borderColor: 'rgba(255,255,255,0.1)',
              boxShadow: '0 0 20px rgba(108,99,255,0.08)',
            }
          : undefined
      }
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={onClick}
      className={cn(
        'rounded-card border p-6 transition-colors duration-200',
        cardVariants[variant],
        onClick && 'cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
