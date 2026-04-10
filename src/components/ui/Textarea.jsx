import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Textarea = forwardRef(
  ({ label, error, className, id, rows = 4, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-xs font-medium tracking-widest uppercase text-text-muted"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={cn(
            'w-full bg-elevated border border-border rounded-input px-4 py-2.5 text-sm text-text-primary',
            'placeholder:text-text-muted resize-none',
            'focus:border-primary focus:shadow-[0_0_0_3px_rgba(108,99,255,0.13)]',
            'transition-all duration-200',
            error && 'border-danger',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-danger mt-0.5">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
export default Textarea;
