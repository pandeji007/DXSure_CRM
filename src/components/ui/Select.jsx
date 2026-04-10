import { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(
  ({ label, error, options = [], placeholder = 'Select...', className, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-medium tracking-widest uppercase text-text-muted"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full bg-elevated border border-border rounded-input px-4 py-2.5 text-sm text-text-primary appearance-none',
              'focus:border-primary focus:shadow-[0_0_0_3px_rgba(108,99,255,0.13)]',
              'transition-all duration-200 cursor-pointer',
              error && 'border-danger',
              className
            )}
            {...props}
          >
            <option value="" className="bg-elevated text-text-muted">
              {placeholder}
            </option>
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                className="bg-elevated text-text-primary"
              >
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        </div>
        {error && <p className="text-xs text-danger mt-0.5">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
