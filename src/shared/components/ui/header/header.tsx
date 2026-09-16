import { useState } from 'react';
import { Link } from 'react-router';
import { SearchInput } from '@/shared/components/ui/input';
import { ThemeToggle } from '@/shared/components/ui/themeToggle/themeToggle';
import { NotificationPanel, type Notification } from './notificationPanel';
import type { HeaderProps } from './header.types';
import styles from './header.module.scss';

const ChevronRightIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

/** Get initials from a name string */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/** Generate dummy notifications seeded from notificationCount prop */
function seedNotifications(count: number): Notification[] {
  const templates = [
    'Overdue Payment: Advance Payment is past the due date.',
    'Overdue Payment: Commissioning Payment is past the due date.',
    'Overdue Payment: Delivery Payment is past the due date.',
    'New lead assigned to you by the admin.',
    'Follow-up reminder: Rahul Desai is due today.',
    'Quote accepted by Fuzen — mark as Won.',
    'Survey scheduled for Arun Sharma tomorrow.',
  ];
  return Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
    message: templates[i % templates.length],
    timestamp: new Date(Date.now() - (i + 1) * 13 * 60 * 1000), // n × 13 min ago
    read: false,
  }));
}

export function Header({
  title,
  subtitle,
  breadcrumbs,
  titleAddon,
  actions,
  showSearch = false,
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  onSearch,
  userName,
  userAvatar,
  userRole,
  onUserClick,
  notificationCount = 0,
  showThemeToggle = true,
  className = '',
}: HeaderProps) {
  const initials = userName ? getInitials(userName) : 'U';

  // Notification state — seeded from the count prop on first render
  const [notifications, setNotifications] = useState<Notification[]>(() =>
    notificationCount > 0 ? seedNotifications(notificationCount) : [],
  );

  const handleMarkRead = (id: string) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );

  const handleMarkAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <header className={`${styles.header} ${className}`} aria-label="Page header">
      {/* Left: Title / Breadcrumbs */}
      <div className={styles.titleArea}>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, idx) => (
              <span key={idx} className={styles.breadcrumbItem}>
                {idx > 0 && (
                  <span className={styles.breadcrumbSep} aria-hidden="true">
                    <ChevronRightIcon />
                  </span>
                )}
                {crumb.path ? (
                  <Link to={crumb.path}>{crumb.label}</Link>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        {title && (
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{title}</h1>
            {titleAddon && titleAddon}
          </div>
        )}

        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>

      {/* Center: Search */}
      {showSearch && (
        <div className={styles.searchWrapper}>
          <SearchInput
            size="sm"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            onSearch={onSearch}
            onClear={() => onSearchChange?.('')}
          />
        </div>
      )}

      {/* Right: Actions + Controls */}
      <div className={styles.controls}>
        {/* Custom action slot */}
        {actions && actions}

        {/* Divider before system controls */}
        {(actions || showSearch) && (showThemeToggle || userName) && (
          <div className={styles.controlDivider} aria-hidden="true" />
        )}

        {/* Theme toggle */}
        {showThemeToggle && <ThemeToggle />}

        {/* Notification bell + dropdown panel */}
        <NotificationPanel
          notifications={notifications}
          onMarkRead={handleMarkRead}
          onMarkAllRead={handleMarkAllRead}
        />

        {/* User profile */}
        {userName && (
          <button
            type="button"
            className={styles.userBtn}
            onClick={onUserClick}
            aria-label={`User profile: ${userName}`}
          >
            <div className={styles.avatar}>
              {userAvatar ? (
                <img src={userAvatar} alt={userName} />
              ) : (
                initials
              )}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{userName}</span>
              {userRole && <span className={styles.userRole}>{userRole}</span>}
            </div>
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
