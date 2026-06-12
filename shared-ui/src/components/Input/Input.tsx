import { InputHTMLAttributes, forwardRef, useId } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Label text displayed above input */
  label?: string;
  /** Error message shown below input */
  error?: string;
  /** Helper text shown below input when no error */
  hint?: string;
}

/**
 * Accessible form input with label, error, and hint support.
 * Associates label via htmlFor/id and exposes aria-invalid on errors.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, required, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = error ? `${inputId}-error` : undefined;
    const hintId = hint && !error ? `${inputId}-hint` : undefined;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            {label}
            {required && (
              <span className="ml-1 text-red-500" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={[errorId, hintId].filter(Boolean).join(' ') || undefined}
          className={[
            'w-full rounded-lg border px-3 py-2 text-slate-900 transition-colors',
            'mfe-focus-ring dark:bg-slate-800 dark:text-slate-100',
            error
              ? 'border-red-500 focus-visible:ring-red-500'
              : 'border-slate-300 dark:border-slate-600',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="text-sm text-slate-500 dark:text-slate-400">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
