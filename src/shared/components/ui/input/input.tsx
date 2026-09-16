import React, { useId } from 'react';
import styles from './input.module.scss';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helpText?: string;
  size?: InputSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isClearable?: boolean;
  onClear?: () => void;
  isSearch?: boolean;
  onSearch?: (value: string) => void;
  wrapperClassName?: string;
}

const defaultSearchIcon = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helpText,
      size = 'md',
      leftIcon,
      rightIcon,
      isClearable = false,
      onClear,
      isSearch = false,
      onSearch,
      className = '',
      wrapperClassName = '',
      required,
      id,
      value,
      onChange,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    // Use default search icon if isSearch is true and leftIcon is not explicitly set
    const effectiveLeftIcon = leftIcon || (isSearch ? defaultSearchIcon : null);
    const showClearButton =
      isClearable && value !== undefined && value !== '' && !props.disabled;

    const inputClasses = [
      styles.input,
      styles[`input--${size}`],
      effectiveLeftIcon && styles['input--with-left-icon'],
      (rightIcon || showClearButton) && styles['input--with-right-icon'],
      error && styles['input--error'],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(e);
      if (e.key === 'Enter' && onSearch) {
        onSearch(String(value ?? ''));
      }
    };

    const handleClearClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onClear?.();
      if (onChange) {
        const syntheticEvent = {
          target: { value: '' },
          currentTarget: { value: '' },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    };

    return (
      <div className={`${styles['input-wrapper']} ${wrapperClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className={`${styles.label} ${
              required ? styles['label--required'] : ''
            }`}
          >
            {label}
          </label>
        )}
        <div className={styles['input-container']}>
          {effectiveLeftIcon && (
            <span className={styles['left-icon']}>{effectiveLeftIcon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            value={value}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            className={inputClasses}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helpText
                ? `${inputId}-help`
                : undefined
            }
            {...props}
          />
          {showClearButton && !rightIcon && (
            <button
              type="button"
              className={styles['clear-btn']}
              onClick={handleClearClick}
              aria-label="Clear input"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
          {rightIcon && !showClearButton && (
            <span className={styles['right-icon']}>{rightIcon}</span>
          )}
        </div>
        {error && (
          <span id={`${inputId}-error`} className={styles.error} role="alert">
            {error}
          </span>
        )}
        {helpText && !error && (
          <span id={`${inputId}-help`} className={styles['help-text']}>
            {helpText}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

// Dedicated pre-configured SearchInput component
export interface SearchInputProps extends InputProps {
  onSearch?: (query: string) => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ placeholder = 'Search leads...', ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="search"
        isSearch
        isClearable
        placeholder={placeholder}
        {...props}
      />
    );
  },
);

SearchInput.displayName = 'SearchInput';

export default Input;
