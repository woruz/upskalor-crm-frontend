import React from 'react';
import { Dropdown } from '../dropdown';
import type { DropdownOption } from '../dropdown/dropdown.types';
import styles from './table.module.scss';

export interface FilterConfig {
  key: string;
  placeholder?: string;
  options: (string | DropdownOption)[];
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (value: string | number) => void;
  isSearchable?: boolean;
  isClearable?: boolean;
  minWidth?: string | number;
}

export interface TableFiltersProps {
  /** Array of filter dropdown definitions */
  filters: FilterConfig[];
  /** Optional key-value object of active filter values */
  values?: Record<string, string | number>;
  /** Global callback when any filter value changes */
  onFilterChange?: (key: string, value: string | number) => void;
  /** Custom title or label (defaults to funnel icon + "Filters") */
  title?: React.ReactNode;
  /** Optional reset all filters callback */
  onReset?: () => void;
  /** Custom container class */
  className?: string;
}

export const TableFilters: React.FC<TableFiltersProps> = ({
  filters,
  values = {},
  onFilterChange,
  title,
  onReset,
  className = '',
}) => {
  const hasActiveFilters = Object.values(values).some(
    (val) => val !== undefined && val !== '' && val !== 'all',
  );

  return (
    <div className={`${styles.tableToolbar} ${className}`}>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px', width: '100%' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 600,
            fontSize: '0.875rem',
            color: 'var(--color-text-primary)',
            marginRight: '4px',
          }}
        >
          {title ? (
            title
          ) : (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
              </svg>
              <span>Filters</span>
            </>
          )}
        </div>

        {filters.map((filter) => {
          const currentValue =
            filter.value !== undefined ? filter.value : values[filter.key];

          return (
            <Dropdown
              key={filter.key}
              size="sm"
              inline
              placeholder={filter.placeholder}
              options={filter.options}
              value={currentValue}
              defaultValue={filter.defaultValue}
              isSearchable={filter.isSearchable}
              isClearable={filter.isClearable}
              style={{ minWidth: filter.minWidth }}
              onChange={(val) => {
                filter.onChange?.(val);
                onFilterChange?.(filter.key, val);
              }}
            />
          );
        })}

        {hasActiveFilters && onReset && (
          <button
            type="button"
            onClick={onReset}
            style={{
              all: 'unset',
              fontSize: '0.8125rem',
              color: 'var(--color-primary-600)',
              fontWeight: 500,
              cursor: 'pointer',
              marginLeft: '4px',
            }}
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default TableFilters;
