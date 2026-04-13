import { cn } from '@/lib/utils';
import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, ...props }, ref) => {
    if (icon) {
      return (
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </div>
          <input
            ref={ref}
            className={cn(
              'w-full h-10 pl-10 pr-4 text-sm',
              'rounded-lg border border-slate-200 bg-white',
              'placeholder:text-slate-400 text-slate-900',
              'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent',
              'transition-colors',
              className,
            )}
            {...props}
          />
        </div>
      );
    }
    return (
      <input
        ref={ref}
        className={cn(
          'w-full h-10 px-4 text-sm',
          'rounded-lg border border-slate-200 bg-white',
          'placeholder:text-slate-400 text-slate-900',
          'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent',
          'transition-colors',
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';
