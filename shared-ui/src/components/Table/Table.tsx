import { ReactNode } from 'react';

export interface Column<T> {
  /** Unique column key */
  key: string;
  /** Column header label */
  header: string;
  /** Custom cell renderer */
  render?: (row: T, index: number) => ReactNode;
  /** Accessor function for default rendering */
  accessor?: (row: T) => ReactNode;
  /** Column width class */
  className?: string;
  /** Hide on mobile */
  hideOnMobile?: boolean;
}

export interface TableProps<T> {
  /** Table data rows */
  data: T[];
  /** Column definitions */
  columns: Column<T>[];
  /** Unique key extractor */
  keyExtractor: (row: T, index: number) => string;
  /** Loading state */
  isLoading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Caption for accessibility */
  caption?: string;
}

/**
 * Responsive, accessible data table with loading and empty states.
 */
export function Table<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No data available',
  caption,
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12" role="status" aria-live="polite">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <span className="sr-only">Loading table data</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="bg-slate-50 dark:bg-slate-900">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={[
                  'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300',
                  col.hideOnMobile ? 'hidden md:table-cell' : '',
                  col.className ?? '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-800">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-slate-500 dark:text-slate-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={keyExtractor(row, rowIndex)}
                className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={[
                      'px-4 py-3 text-sm text-slate-900 dark:text-slate-100',
                      col.hideOnMobile ? 'hidden md:table-cell' : '',
                      col.className ?? '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {col.render
                      ? col.render(row, rowIndex)
                      : col.accessor
                        ? col.accessor(row)
                        : String((row as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
