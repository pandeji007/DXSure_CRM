import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export default function Tooltip({ children, content, side = 'top', className }) {
  const [show, setShow] = useState(false);

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const origins = {
    top: { y: 4, opacity: 0 },
    bottom: { y: -4, opacity: 0 },
    left: { x: 4, opacity: 0 },
    right: { x: -4, opacity: 0 },
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && content && (
          <motion.div
            initial={origins[side]}
            animate={{ x: 0, y: 0, opacity: 1 }}
            exit={origins[side]}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-50 px-2.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap',
              'bg-elevated text-text-primary border border-border shadow-card',
              positions[side],
              className
            )}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
