import React, { useState, useMemo } from 'react';
import type { TableProps, Column, SortOrder } from './table.types';
import styles from './table.module.scss';

export function Table<T = any>({
  columns,
  data,
  rowKey,
  isLoading = false,
  loadingRowsCount = 5,
  emptyText = 'No data available',
  emptyState,
  hoverable = true,
  striped = false,
  bordered = true,
  compact = false,
  className = '',
  containerClassName = '',
  tableClassName = '',
  onRowClick,
  sortKey: controlledSortKey,
  sortOrder: controlledSortOrder,
  onSort,
  defaultSortKey,
  defaultSortOrder,
  toolbar,
  footer,
  caption,
}: TableProps<T>) {
  // Uncontrolled sort state
  const [internalSortKey, setInternalSortKey] = useState<string | undefined>(
    defaultSortKey,
  );
  const [internalSortOrder, setInternalSortOrder] = useState<SortOrder>(
    defaultSortOrder ?? null,
  );

  const isControlledSort = controlledSortKey !== undefined;
  const activeSortKey = isControlledSort ? controlledSortKey : internalSortKey;
  const activeSortOrder = isControlledSort
    ? controlledSortOrder
    : internalSortOrder;

  const handleSortClick = (column: Column<T>) => {
    if (!column.sortable) return;

    let nextOrder: SortOrder = 'asc';
    if (activeSortKey === column.key) {
      if (activeSortOrder === 'asc') nextOrder = 'desc';
      else if (activeSortOrder === 'desc') nextOrder = null;
      else nextOrder = 'asc';
    }

    if (onSort) {
      onSort(column.key, (nextOrder || 'asc') as 'asc' | 'desc');
    }

    if (!isControlledSort) {
      setInternalSortKey(nextOrder ? column.key : undefined);
      setInternalSortOrder(nextOrder);
    }
  };

  // Helper to extract cell raw value
  const getCellValue = (row: T, column: Column<T>, index: number): any => {
    if (typeof column.accessor === 'function') {
      return column.accessor(row, index);
    }
    if (typeof column.accessor === 'string' || typeof column.accessor === 'number') {
      return (row as any)[column.accessor];
    }
    return (row as any)[column.key];
  };

  // Sort rows automatically if uncontrolled and activeSortKey is set
  const sortedData = useMemo(() => {
    if (isControlledSort || !activeSortKey || !activeSortOrder) {
      return data;
    }

    const targetColumn = columns.find((c) => c.key === activeSortKey);
    if (!targetColumn) return data;

    return [...data].sort((a, b) => {
      const valA = getCellValue(a, targetColumn, 0);
      const valB = getCellValue(b, targetColumn, 0);

      if (valA == null && valB == null) return 0;
      if (valA == null) return 1;
      if (valB == null) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return activeSortOrder === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();

      if (strA < strB) return activeSortOrder === 'asc' ? -1 : 1;
      if (strA > strB) return activeSortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, columns, activeSortKey, activeSortOrder, isControlledSort]);

  // Extract unique key for each row
  const getRowKey = (row: T, index: number): string | number => {
    if (typeof rowKey === 'function') {
      return rowKey(row, index);
    }
    if (rowKey && (row as any)[rowKey] !== undefined) {
      return (row as any)[rowKey];
    }
    if ((row as any).id !== undefined) {
      return (row as any).id;
    }
    return index;
  };

  const renderSortIcon = (column: Column<T>) => {
    if (!column.sortable) return null;

    const isActive = activeSortKey === column.key && !!activeSortOrder;
    const isAsc = isActive && activeSortOrder === 'asc';
    const isDesc = isActive && activeSortOrder === 'desc';

    return (
      <span
        className={`${styles.sortIcon} ${isActive ? styles['sortIcon--active'] : ''}`}
        aria-hidden="true"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8 10L12 6L16 10"
            stroke={isAsc ? 'currentColor' : 'currentColor'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={isDesc ? 0.3 : 1}
          />
          <path
            d="M8 14L12 18L16 14"
            stroke={isDesc ? 'currentColor' : 'currentColor'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={isAsc ? 0.3 : 1}
          />
        </svg>
      </span>
    );
  };

  return (
    <div
      className={`${styles.tableWrapper} ${
        bordered ? styles['tableWrapper--bordered'] : ''
      } ${className}`}
    >
      {/* Optional Toolbar / Filters */}
      {toolbar && <div className={styles.tableToolbar}>{toolbar}</div>}

      {/* Slidable container on small screens */}
      <div
        className={`${styles.tableContainer} ${containerClassName}`}
        tabIndex={0}
        role="region"
        aria-label="Slidable data table"
      >
        <table className={`${styles.table} ${tableClassName}`}>
          {caption && <caption>{caption}</caption>}
          <thead className={styles.tableHead}>
            <tr>
              {columns.map((col) => {
                const alignClass = col.align
                  ? styles[`tableTh--align-${col.align}`]
                  : '';
                const compactClass = compact ? styles['tableTh--compact'] : '';

                return (
                  <th
                    key={col.key}
                    scope="col"
                    style={{
                      width: col.width,
                      minWidth: col.minWidth,
                    }}
                    className={`${styles.tableTh} ${alignClass} ${compactClass} ${
                      col.headerClassName || ''
                    }`}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        className={styles.sortButton}
                        onClick={() => handleSortClick(col)}
                        aria-label={`Sort by ${
                          typeof col.header === 'string' ? col.header : col.key
                        }`}
                      >
                        <span>{col.header}</span>
                        {renderSortIcon(col)}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className={styles.tableBody}>
            {isLoading ? (
              // Loading Skeleton rows
              Array.from({ length: loadingRowsCount }).map((_, rIdx) => (
                <tr key={`skeleton-${rIdx}`} className={styles.skeletonRow}>
                  {columns.map((col, cIdx) => (
                    <td key={`skeleton-cell-${cIdx}`} className={styles.skeletonCell}>
                      <div
                        className={styles.skeletonBar}
                        style={{
                          width: `${55 + ((rIdx * 17 + cIdx * 23) % 40)}%`,
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : sortedData.length === 0 ? (
              // Empty State
              <tr>
                <td
                  colSpan={columns.length}
                  className={styles.emptyStateCell}
                >
                  {emptyState ? (
                    emptyState
                  ) : (
                    <div className={styles.emptyStateContent}>
                      <svg
                        width="36"
                        height="36"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ opacity: 0.4 }}
                      >
                        <path
                          d="M4 6H20M4 12H20M4 18H12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <p className={styles.emptyStateText}>{emptyText}</p>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              // Data Rows
              sortedData.map((row, rowIndex) => {
                const isClickable = Boolean(onRowClick);
                const rowClasses = [
                  styles.tableRow,
                  hoverable && styles['tableRow--hoverable'],
                  striped && styles['tableRow--striped'],
                  isClickable && styles['tableRow--clickable'],
                ]
                  .filter(Boolean)
                  .join(' ');

                return (
                  <tr
                    key={getRowKey(row, rowIndex)}
                    className={rowClasses}
                    onClick={() => onRowClick?.(row, rowIndex)}
                  >
                    {columns.map((col) => {
                      const value = getCellValue(row, col, rowIndex);
                      const alignClass = col.align
                        ? styles[`tableTd--align-${col.align}`]
                        : '';
                      const compactClass = compact
                        ? styles['tableTd--compact']
                        : '';

                      return (
                        <td
                          key={col.key}
                          style={{
                            width: col.width,
                            minWidth: col.minWidth,
                          }}
                          className={`${styles.tableTd} ${alignClass} ${compactClass} ${
                            col.className || ''
                          }`}
                        >
                          {col.render
                            ? col.render(value, row, rowIndex)
                            : value != null
                            ? String(value)
                            : '—'}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Optional Footer / Pagination */}
      {footer && <div className={styles.tableFooter}>{footer}</div>}
    </div>
  );
}

export default Table;
