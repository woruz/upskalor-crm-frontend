import type React from 'react';

export interface SidebarNavItem {
  /** Unique key for the nav item */
  key: string;
  /** Display label */
  label: string;
  /** Route path */
  path?: string;
  /** SVG icon ReactNode */
  icon?: React.ReactNode;
  /** Sub-items for nested nav */
  children?: SidebarNavItem[];
  /** Show a badge with count */
  badge?: number | string;
  /** Divider before this item */
  dividerBefore?: boolean;
  /** Roles permitted to see this item */
  roles?: string[];
  /** Optional click handler (for actions like logout) */
  onClick?: () => void;
}

export interface SidebarProps {
  /** Navigation items to render */
  items: SidebarNavItem[];
  /** Current active path – used to highlight active item */
  activePath?: string;
  /** Logo/brand area content */
  logo?: React.ReactNode;
  /** Called when a nav item is clicked */
  onNavigate?: (item: SidebarNavItem) => void;
  /** Whether sidebar starts collapsed */
  defaultCollapsed?: boolean;
  /** Footer content slot */
  footer?: React.ReactNode;
  className?: string;
}
