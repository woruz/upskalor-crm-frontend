import React from 'react';

export interface DropdownOption {
  label: string;
  value: string | number;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
}

export type DropdownSize = 'sm' | 'md' | 'lg';

export interface DropdownProps {
  /** Dropdown options list (can be strings or DropdownOption objects) */
  options?: (string | DropdownOption)[];
  /** Selected value (controlled) */
  value?: string | number;
  /** Default value for uncontrolled mode */
  defaultValue?: string | number;
  /** Callback fired when an option is selected */
  onChange?: (value: string | number, option?: DropdownOption) => void;
  /** Placeholder text shown when no value is selected */
  placeholder?: string;
  /** Optional label above the dropdown */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text below dropdown */
  helpText?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Required field indicator */
  required?: boolean;
  /** Size variant */
  size?: DropdownSize;
  /** Show clear button when a value is selected */
  isClearable?: boolean;
  /** Show search filter input inside menu */
  isSearchable?: boolean;
  /** Icon on left side of trigger */
  leftIcon?: React.ReactNode;
  /** Menu horizontal alignment */
  align?: 'left' | 'right';
  /** Display as inline component */
  inline?: boolean;
  /** Custom class for outer wrapper */
  className?: string;
  /** Custom class for control button */
  controlClassName?: string;
  /** Custom class for dropdown menu list */
  menuClassName?: string;
  /** Form name attribute */
  name?: string;
  /** Unique ID for accessibility */
  id?: string;
  /** Backward compatibility: custom trigger element for action menu */
  trigger?: React.ReactNode;
  /** Backward compatibility: children for action menu */
  children?: React.ReactNode;
  onOpen?: () => void;
  onClose?: () => void;
}
