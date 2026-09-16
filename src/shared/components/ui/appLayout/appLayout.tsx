import React from 'react';
import { Sidebar } from '@/shared/components/ui/sidebar';
import { Header } from '@/shared/components/ui/header';
import { APP_NAV_ITEMS } from '@/shared/lib/config/navItems';
import type { HeaderProps } from '@/shared/components/ui/header/header.types';
import styles from './appLayout.module.scss';

export interface AppLayoutProps {
  children: React.ReactNode;
  /** Props forwarded to the Header component */
  headerProps?: Omit<HeaderProps, 'showThemeToggle'>;
}

export function AppLayout({ children, headerProps }: AppLayoutProps) {
  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <Sidebar items={APP_NAV_ITEMS} />

      {/* Content area */}
      <div className={styles.main}>
        <Header showThemeToggle {...headerProps} />
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}

export default AppLayout;
