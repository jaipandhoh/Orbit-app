import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const Table = ({ className = '', children, ...props }) => (
  <table className={`w-full ${className}`} {...props}>
    {children}
  </table>
);

const THead = ({ children, ...props }) => (
  <thead {...props}>{children}</thead>
);

const TBody = ({ children, ...props }) => (
  <tbody className="divide-y divide-ds-border" {...props}>{children}</tbody>
);

const TR = ({ className = '', onClick, children, ...props }) => (
  <tr
    className={`transition-colors duration-100 ${onClick ? 'hover:bg-ds-bg-subtle cursor-pointer' : ''} ${className}`}
    onClick={onClick}
    {...props}
  >
    {children}
  </tr>
);

const TH = ({ sortable, sortDir, onSort, className = '', children, ...props }) => (
  <th
    className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ds-fg-muted ${sortable ? 'cursor-pointer select-none' : ''} ${className}`}
    onClick={sortable ? onSort : undefined}
    {...props}
  >
    <span className="inline-flex items-center gap-1">
      {children}
      {sortable && (
        <span className="flex flex-col -space-y-1 text-ds-fg-subtle">
          <ChevronUp size={12} className={sortDir === 'asc' ? 'text-ds-fg' : ''} />
          <ChevronDown size={12} className={sortDir === 'desc' ? 'text-ds-fg' : ''} />
        </span>
      )}
    </span>
  </th>
);

const TD = ({ className = '', children, ...props }) => (
  <td className={`px-6 py-4 text-sm text-ds-fg ${className}`} {...props}>
    {children}
  </td>
);

export { Table, THead, TBody, TR, TH, TD };
