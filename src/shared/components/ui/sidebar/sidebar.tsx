import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import type { SidebarProps, SidebarNavItem } from './sidebar.types';
import styles from './sidebar.module.scss';

/** Chevron-left/right icon */
const ChevronIcon = ({ collapsed }: { collapsed: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 250ms ease' }}
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

interface NavItemProps {
  item: SidebarNavItem;
  collapsed: boolean;
  activePath: string;
  onNavigate?: (item: SidebarNavItem) => void;
}

function NavItemComponent({ item, collapsed, activePath, onNavigate }: NavItemProps) {
  const isActive = item.path ? activePath === item.path || activePath.startsWith(item.path + '/') : false;

  const content = (
    <>
      {item.icon && (
        <span className={styles.navIcon} aria-hidden="true">
          {item.icon}
        </span>
      )}
      <span className={styles.navLabel}>{item.label}</span>
      {item.badge !== undefined && (
        <span className={styles.navBadge}>{item.badge}</span>
      )}
    </>
  );

  const itemClasses = [
    styles.navItem,
    isActive ? styles['navItem--active'] : '',
    item.key === 'logout' ? styles['navItem--logout'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = () => {
    item.onClick?.();
    onNavigate?.(item);
  };

  const inner = item.path ? (
    <NavLink
      to={item.path}
      className={itemClasses}
      onClick={handleClick}
      aria-current={isActive ? 'page' : undefined}
      title={collapsed ? item.label : undefined}
    >
      {content}
    </NavLink>
  ) : (
    <button
      type="button"
      className={itemClasses}
      onClick={handleClick}
      title={collapsed ? item.label : undefined}
    >
      {content}
    </button>
  );

  if (collapsed) {
    return (
      <div className={styles.tooltipWrapper}>
        {inner}
        <div className={styles.tooltip}>{item.label}</div>
      </div>
    );
  }

  return inner;
}

export function Sidebar({
  items,
  activePath: activePropPath,
  logo,
  onNavigate,
  defaultCollapsed = false,
  footer,
  className = '',
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const location = useLocation();
  const activePath = activePropPath ?? location.pathname;

  const sidebarClasses = [
    styles.sidebar,
    collapsed ? styles['sidebar--collapsed'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <aside className={sidebarClasses} aria-label="Main navigation">
      {/* Logo / Brand */}
      <div className={styles.logoArea}>
        {logo ?? (
          <>
            <div className={styles.logoIcon}>U</div>
            <div className={styles.logoText}>
              <span>Upskalor</span>
              <span>CRM</span>
            </div>
          </>
        )}
        <button
          type="button"
          className={styles.toggleBtn}
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronIcon collapsed={collapsed} />
        </button>
      </div>

      {/* Navigation */}
      <nav className={styles.nav} aria-label="Primary navigation">
        {items.map((item) => (
          <React.Fragment key={item.key}>
            {item.dividerBefore && <div className={styles.sectionDivider} />}
            <NavItemComponent
              item={item}
              collapsed={collapsed}
              activePath={activePath}
              onNavigate={onNavigate}
            />
          </React.Fragment>
        ))}
      </nav>

      {/* Footer slot */}
      {footer && <div className={styles.footer}>{footer}</div>}
    </aside>
  );
}

export default Sidebar;
