import { useAuth } from '@/shared/lib/hooks/useAuth';
import { useNavigate } from 'react-router';
import { Button } from '@/shared/components/ui/button/button';
import { ThemeToggle } from '@/shared/components/ui/themeToggle/themeToggle';
import { ROUTES } from '@/shared/lib/config/routes';
import styles from './dashboard.module.scss';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <div className={styles.actions}>
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Sign out
          </Button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.welcomeCard}>
          <h2>Welcome back{user?.name ? `, ${user.name}` : ''}!</h2>
          <p>
            You are signed in as <strong>{user?.email || 'user'}</strong>.
          </p>
          <p className={styles.hint}>
            This is a protected page. Only authenticated users can see this.
          </p>
        </div>
      </main>
    </div>
  );
}
