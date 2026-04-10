import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Input = forwardRef(
  ({ label, error, icon: Icon, iconRight: IconRight, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium tracking-widest uppercase text-text-muted"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full bg-elevated border border-border rounded-input px-4 py-2.5 text-sm text-text-primary',
              'placeholder:text-text-muted',
              'focus:border-primary focus:shadow-[0_0_0_3px_rgba(108,99,255,0.13)]',
              'transition-all duration-200',
              Icon && 'pl-10',
              IconRight && 'pr-10',
              error && 'border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(255,71,87,0.13)]',
              className
            )}
            {...props}
          />
          {IconRight && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
              <IconRight className="w-4 h-4" />
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-danger mt-0.5">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
