import React from 'react';

export interface KanbanColumn {
  /** Unique ID for the column (must match the item's status/column value) */
  id: string;
  /** Display title for the column header (e.g. "NEW", "QUOTE SENT") */
  title: string;
  /** Optional custom count override */
  badgeCount?: number;
  /** Optional color dot or accent */
  color?: string;
}

export interface KanbanProps<T = any> {
  /** List of Kanban columns */
  columns: KanbanColumn[];
  /** Array of data items (cards) */
  data: T[];
  /** Property key of T or extractor function determining which column the item belongs to */
  columnKey: keyof T | ((item: T) => string);
  /** Property key of T or extractor function for unique card ID */
  idKey?: keyof T | ((item: T) => string | number);
  /** Callback fired when a card is dropped into a new column */
  onCardMove?: (item: T, toColumnId: string, fromColumnId: string) => void;
  /** Custom renderer for each card. If omitted, a clean default card will be rendered */
  renderCard?: (item: T, column: KanbanColumn, index: number) => React.ReactNode;
  /** Custom renderer for column header */
  renderHeader?: (column: KanbanColumn, count: number) => React.ReactNode;
  /** Optional callback when clicking a card */
  onCardClick?: (item: T) => void;
  /** Text or component displayed when a column has no cards */
  emptyColumnPlaceholder?: React.ReactNode;
  /** Custom class for outer board wrapper */
  className?: string;
  /** Custom class for column container */
  columnClassName?: string;
  /** Custom class for card item */
  cardClassName?: string;
}
