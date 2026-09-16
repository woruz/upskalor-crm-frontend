import React from 'react';

export type SortOrder = 'asc' | 'desc' | null;

export interface Column<T = any> {
  /** Unique key for the column */
  key: string;
  /** Header label or custom ReactNode */
  header: React.ReactNode;
  /** Property key of T or a function that extracts the display value */
  accessor?: keyof T | ((row: T, index: number) => React.ReactNode);
  /** Custom renderer for cell content. Receives extracted value, row item, and row index */
  render?: (value: any, row: T, index: number) => React.ReactNode;
  /** Whether the column can be sorted */
  sortable?: boolean;
  /** Text alignment in header and body cells */
  align?: 'left' | 'center' | 'right';
  /** Fixed width e.g. '120px', '20%' */
  width?: string | number;
  /** Minimum width to prevent column from collapsing on narrow screens */
  minWidth?: string | number;
  /** Custom class for cells in this column */
  className?: string;
  /** Custom class for the header cell */
  headerClassName?: string;
}

export interface TableProps<T = any> {
  /** Column definitions */
  columns: Column<T>[];
  /** Array of row data objects */
  data: T[];
  /** Key extractor for React list keys. Defaults to `item.id` or row index */
  rowKey?: keyof T | ((row: T, index: number) => string | number);
  /** Loading state indicator with shimmer skeleton rows */
  isLoading?: boolean;
  /** Number of skeleton rows when loading (default: 5) */
  loadingRowsCount?: number;
  /** Custom empty text when no records are available */
  emptyText?: string;
  /** Custom empty state component */
  emptyState?: React.ReactNode;
  /** Highlight row on hover (default: true) */
  hoverable?: boolean;
  /** Alternate row background colors (default: false) */
  striped?: boolean;
  /** Outer border and rounded corners on container (default: true) */
  bordered?: boolean;
  /** Compact padding mode (default: false) */
  compact?: boolean;
  /** Additional class name for outer wrapper */
  className?: string;
  /** Additional class name for the scrollable container */
  containerClassName?: string;
  /** Additional class name for the table element */
  tableClassName?: string;
  /** Callback when a row is clicked */
  onRowClick?: (row: T, index: number) => void;
  /** Controlled sort column key */
  sortKey?: string;
  /** Controlled sort order ('asc' | 'desc') */
  sortOrder?: SortOrder;
  /** Controlled sort callback */
  onSort?: (key: string, order: 'asc' | 'desc') => void;
  /** Default sort key for uncontrolled mode */
  defaultSortKey?: string;
  /** Default sort order for uncontrolled mode */
  defaultSortOrder?: 'asc' | 'desc';
  /** Optional top toolbar slot (e.g. filters, search, actions) */
  toolbar?: React.ReactNode;
  /** Optional bottom footer / pagination slot */
  footer?: React.ReactNode;
  /** Optional custom caption or title */
  caption?: React.ReactNode;
}
