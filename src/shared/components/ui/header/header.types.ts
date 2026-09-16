import type React from 'react';

export interface HeaderBreadcrumb {
  label: string;
  path?: string;
}

export interface HeaderProps {
  /** Page title shown in header */
  title?: React.ReactNode;
  /** Subtitle/description */
  subtitle?: React.ReactNode;
  /** Breadcrumb trail */
  breadcrumbs?: HeaderBreadcrumb[];
  /** Left side content after title area (e.g. badge, status) */
  titleAddon?: React.ReactNode;
  /** Right side action buttons/content */
  actions?: React.ReactNode;
  /** Whether to show search bar */
  showSearch?: boolean;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Controlled search value */
  searchValue?: string;
  /** Called on search change */
  onSearchChange?: (value: string) => void;
  /** Called on search submit */
  onSearch?: (value: string) => void;
  /** User display name */
  userName?: string;
  /** User avatar URL, falls back to initials */
  userAvatar?: string;
  /** User role/subtitle */
  userRole?: string;
  /** Called when user avatar/name is clicked */
  onUserClick?: () => void;
  /** Notification count badge */
  notificationCount?: number;
  /** Called when notification bell is clicked */
  onNotificationClick?: () => void;
  /** Show theme toggle */
  showThemeToggle?: boolean;
  className?: string;
}
