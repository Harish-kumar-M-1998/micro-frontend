import { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Card title */
  title?: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Header action slot (e.g., button) */
  action?: ReactNode;
  /** Card body content */
  children: ReactNode;
  /** Remove default padding */
  noPadding?: boolean;
}

/**
 * Responsive card container for grouping related content.
 */
export function Card({
  title,
  subtitle,
  action,
  children,
  noPadding = false,
  className = '',
  ...props
}: CardProps) {
  const hasHeader = title || subtitle || action;

  return (
    <article
      className={[
        'rounded-xl border border-slate-200 bg-white shadow-sm',
        'dark:border-slate-700 dark:bg-slate-800',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {hasHeader && (
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
    </article>
  );
}
