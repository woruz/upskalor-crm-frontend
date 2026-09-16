import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useId,
} from 'react';
import type {
  DropdownProps,
  DropdownOption,
} from './dropdown.types';
import styles from './dropdown.module.scss';

export const Dropdown = ({
  options = [],
  value: controlledValue,
  defaultValue,
  onChange,
  placeholder = 'Select an option',
  label,
  error,
  helpText,
  disabled = false,
  required = false,
  size = 'md',
  isClearable = false,
  isSearchable = false,
  leftIcon,
  align = 'left',
  inline = false,
  className = '',
  controlClassName = '',
  menuClassName = '',
  name,
  id,
  trigger,
  children,
  onOpen,
  onClose,
}: DropdownProps) => {
  const generatedId = useId();
  const dropdownId = id || generatedId;

  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<string | number | undefined>(
    defaultValue,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  // Normalize options (support strings or DropdownOption objects)
  const normalizedOptions: DropdownOption[] = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === 'string' || typeof opt === 'number') {
        return { label: String(opt), value: opt };
      }
      return opt;
    });
  }, [options]);

  // Selected option
  const selectedOption = useMemo(() => {
    return normalizedOptions.find((opt) => opt.value === currentValue);
  }, [normalizedOptions, currentValue]);

  // Filtered options based on search query
  const filteredOptions = useMemo(() => {
    if (!isSearchable || !searchQuery.trim()) {
      return normalizedOptions;
    }
    const query = searchQuery.toLowerCase();
    return normalizedOptions.filter((opt) =>
      opt.label.toLowerCase().includes(query),
    );
  }, [normalizedOptions, isSearchable, searchQuery]);

  const handleOpen = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
    setSearchQuery('');
    onOpen?.();
  }, [disabled, onOpen]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setSearchQuery('');
    onClose?.();
  }, [onClose]);

  const toggle = useCallback(() => {
    if (isOpen) {
      handleClose();
    } else {
      handleOpen();
    }
  }, [isOpen, handleOpen, handleClose]);

  const handleSelect = (option: DropdownOption) => {
    if (option.disabled) return;

    if (!isControlled) {
      setInternalValue(option.value);
    }
    onChange?.(option.value, option);
    handleClose();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isControlled) {
      setInternalValue(undefined);
    }
    onChange?.('', undefined);
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      if (isSearchable && searchInputRef.current) {
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClose, isSearchable]);

  // Backward compatibility: If custom trigger & children passed, render action menu mode
  if (trigger) {
    return (
      <div ref={containerRef} className={`${styles.dropdown} ${className}`}>
        <div className={styles['dropdown-trigger']} onClick={toggle}>
          {trigger}
        </div>
        {isOpen && (
          <div
            className={`${styles['dropdown-menu']} ${styles[`dropdown-menu--${align}`]} ${menuClassName}`}
            role="menu"
          >
            {children}
          </div>
        )}
      </div>
    );
  }

  // Form Select Dropdown Mode
  const controlClasses = [
    styles['dropdown-control'],
    styles[`dropdown-control--${size}`],
    isOpen && styles['dropdown-control--open'],
    disabled && styles['dropdown-control--disabled'],
    error && styles['dropdown-control--error'],
    controlClassName,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={containerRef}
      className={`${styles['dropdown-wrapper']} ${
        inline ? styles['dropdown-wrapper--inline'] : ''
      } ${className}`}
    >
      {label && (
        <label
          htmlFor={dropdownId}
          className={`${styles.label} ${
            required ? styles['label--required'] : ''
          }`}
        >
          {label}
        </label>
      )}

      <div className={styles['dropdown-container']}>
        <div
          id={dropdownId}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={`${dropdownId}-menu`}
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : 0}
          className={controlClasses}
          onClick={toggle}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggle();
            }
          }}
        >
          <div className={styles['dropdown-content']}>
            {(selectedOption?.icon || leftIcon) && (
              <span className={styles['dropdown-icon']}>
                {selectedOption?.icon || leftIcon}
              </span>
            )}
            {selectedOption ? (
              <span className={styles['dropdown-value']}>
                {selectedOption.label}
              </span>
            ) : (
              <span className={styles['dropdown-placeholder']}>
                {placeholder}
              </span>
            )}
          </div>

          <div className={styles['dropdown-actions']}>
            {isClearable && selectedOption && !disabled && (
              <button
                type="button"
                className={styles['clear-button']}
                onClick={handleClear}
                aria-label="Clear selection"
              >
                <svg
                  width="12"
                  height="12"
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

            <span
              className={`${styles.chevron} ${
                isOpen ? styles['chevron--open'] : ''
              }`}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </div>
        </div>

        {/* Hidden input for form integrations */}
        {name && (
          <input
            type="hidden"
            name={name}
            value={currentValue !== undefined ? String(currentValue) : ''}
          />
        )}

        {/* Options Dropdown Menu */}
        {isOpen && (
          <div
            id={`${dropdownId}-menu`}
            className={`${styles['dropdown-menu']} ${
              styles[`dropdown-menu--${align}`]
            } ${menuClassName}`}
            role="listbox"
          >
            {isSearchable && (
              <div className={styles['search-container']}>
                <input
                  ref={searchInputRef}
                  type="text"
                  className={styles['search-input']}
                  placeholder="Search options..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            {filteredOptions.length === 0 ? (
              <div className={styles['no-options']}>No options found</div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === currentValue;
                return (
                  <div
                    key={String(opt.value)}
                    role="option"
                    aria-selected={isSelected}
                    className={`${styles.option} ${
                      isSelected ? styles['option--selected'] : ''
                    } ${opt.disabled ? styles['option--disabled'] : ''}`}
                    onClick={() => handleSelect(opt)}
                  >
                    <div className={styles['option-main']}>
                      {opt.icon && (
                        <span className={styles['dropdown-icon']}>
                          {opt.icon}
                        </span>
                      )}
                      <div>
                        <div className={styles['option-label']}>
                          {opt.label}
                        </div>
                        {opt.description && (
                          <div className={styles['option-desc']}>
                            {opt.description}
                          </div>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <span className={styles['check-icon']}>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {error && <span className={styles['error-text']}>{error}</span>}
      {!error && helpText && (
        <span className={styles['help-text']}>{helpText}</span>
      )}
    </div>
  );
};

// Sub-components for action menu compatibility
export const DropdownItem = ({
  children,
  leftIcon,
  rightIcon,
  destructive = false,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  destructive?: boolean;
}) => {
  const itemClasses = [
    styles['dropdown-item'],
    destructive && styles['dropdown-item--destructive'],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type="button" className={itemClasses} role="menuitem" {...props}>
      {leftIcon && (
        <span className={styles['dropdown-item-left']}>{leftIcon}</span>
      )}
      <span className={styles['dropdown-item-content']}>{children}</span>
      {rightIcon && (
        <span className={styles['dropdown-item-right']}>{rightIcon}</span>
      )}
    </button>
  );
};

export const DropdownDivider = ({ className = '' }: { className?: string }) => (
  <div
    className={`${styles['dropdown-divider']} ${className}`}
    role="separator"
  />
);

export const DropdownHeader = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`${styles['dropdown-header']} ${className}`}>
    {children}
  </div>
);

// Attach sub-components
Dropdown.Item = DropdownItem;
Dropdown.Divider = DropdownDivider;
Dropdown.Header = DropdownHeader;

export default Dropdown;
