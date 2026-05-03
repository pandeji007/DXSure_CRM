import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import { cn } from '../../lib/utils';

export default function StatCard({ title, value, icon: Icon, color = 'primary', trend, index = 0 }) {
  const [displayValue, setDisplayValue] = useState(0);
  const shouldRenderRawValue = typeof value === 'string';
  const numericValue = typeof value === 'number' ? value : 0;

  useEffect(() => {
    if (numericValue === 0) { setDisplayValue(0); return; }
    const duration = 1000;
    const steps = 30;
    const increment = numericValue / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setDisplayValue(numericValue);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [numericValue]);

  const colorMap = {
    primary: { bg: 'bg-primary/10', text: 'text-primary', glow: 'shadow-[0_0_20px_rgba(108,99,255,0.15)]' },
    secondary: { bg: 'bg-secondary/10', text: 'text-secondary', glow: 'shadow-[0_0_20px_rgba(0,212,170,0.15)]' },
    danger: { bg: 'bg-danger/10', text: 'text-danger', glow: 'shadow-[0_0_20px_rgba(255,71,87,0.15)]' },
    warning: { bg: 'bg-warning/10', text: 'text-warning', glow: 'shadow-[0_0_20px_rgba(255,165,2,0.15)]' },
    success: { bg: 'bg-success/10', text: 'text-success', glow: 'shadow-[0_0_20px_rgba(46,213,115,0.15)]' },
  };

  const c = colorMap[color] || colorMap.primary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4, ease: 'easeOut' }}
    >
      <Card className="relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium tracking-widest uppercase text-text-muted mb-2">
              {title}
            </p>
            <p className="text-3xl font-bold text-text-primary tracking-tight">
              {shouldRenderRawValue ? value : displayValue.toLocaleString('en-IN')}
            </p>
            {trend && (
              <p className={cn('text-xs mt-2 font-medium', trend > 0 ? 'text-success' : 'text-danger')}>
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
              </p>
            )}
          </div>
          <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center animate-pulse-glow', c.bg, c.glow)}>
            <Icon className={cn('w-6 h-6', c.text)} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
