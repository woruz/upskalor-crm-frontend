import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './notificationPanel.module.scss';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  message: string;
  timestamp: Date;
  read: boolean;
  category?: string;
}

interface NotificationPanelProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────

export function NotificationPanel({ notifications, onMarkRead, onMarkAllRead }: NotificationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close on outside click
  const handleOutsideClick = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, handleOutsideClick]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className={styles.wrapper} ref={containerRef}>
      {/* ── Bell trigger ─────────────────────────────────────────── */}
      <button
        type="button"
        className={`${styles.bellBtn} ${isOpen ? styles['bellBtn--active'] : ''}`}
        onClick={() => setIsOpen((p) => !p)}
        aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Notifications"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className={styles.badge} aria-hidden="true">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Panel ────────────────────────────────────────────────── */}
      {isOpen && (
        <div className={styles.panel} role="dialog" aria-label="Notifications">
          {/* Header row */}
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                className={styles.markAllBtn}
                onClick={() => { onMarkAllRead(); }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className={styles.list} role="list">
            {notifications.length === 0 ? (
              <div className={styles.empty}>
                <BellIcon />
                <span>No notifications</span>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`${styles.item} ${!n.read ? styles['item--unread'] : ''}`}
                  role="listitem"
                >
                  <div className={styles.itemBody}>
                    <p className={styles.itemMessage}>{n.message}</p>
                    <span className={styles.itemTime}>{timeAgo(n.timestamp)}</span>
                  </div>

                  <button
                    type="button"
                    className={`${styles.checkBtn} ${n.read ? styles['checkBtn--done'] : ''}`}
                    onClick={() => onMarkRead(n.id)}
                    title={n.read ? 'Already read' : 'Mark as read'}
                    aria-label={n.read ? 'Already read' : `Mark "${n.message}" as read`}
                  >
                    <CheckIcon />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
