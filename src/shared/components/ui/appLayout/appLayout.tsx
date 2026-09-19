import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Sidebar } from '@/shared/components/ui/sidebar';
import { Header } from '@/shared/components/ui/header';
import { APP_NAV_ITEMS } from '@/shared/lib/config/navItems';
import { useAuth } from '@/shared/lib/hooks/useAuth';
import { ROUTES } from '@/shared/lib/config/routes';
import type { HeaderProps } from '@/shared/components/ui/header/header.types';
import styles from './appLayout.module.scss';

export interface AppLayoutProps {
  children: React.ReactNode;
  /** Props forwarded to the Header component */
  headerProps?: Omit<HeaderProps, 'showThemeToggle'>;
}

export function AppLayout({ children, headerProps }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } finally {
      navigate(ROUTES.LOGIN);
    }
  }, [logout, navigate]);

  const authorizedNavItems = useMemo(() => {
    return APP_NAV_ITEMS.filter((item) => {
      if (!item.roles || item.roles.length === 0) return true;
      if (!user?.role) return false;
      return item.roles.includes(user.role);
    }).map((item) => {
      if (item.key === 'logout') {
        return {
          ...item,
          onClick: handleLogout,
        };
      }
      return item;
    });
  }, [user?.role, handleLogout]);

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <Sidebar items={authorizedNavItems} />

      {/* Content area */}
      <div className={styles.main}>
        <Header showThemeToggle {...headerProps} />
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}

export default AppLayout;
