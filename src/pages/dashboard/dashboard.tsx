import { useAuth } from '@/shared/lib/hooks/useAuth';
import { useNavigate } from 'react-router';
import { Button } from '@/shared/components/ui/button/button';
import { AppLayout } from '@/shared/components/ui/appLayout/appLayout';
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
    <AppLayout
      headerProps={{
        title: 'Dashboard',
        breadcrumbs: [{ label: 'Dashboard' }],
        userName: user?.name || user?.email || 'User',
        userRole: 'Administrator',
        actions: (
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Sign out
          </Button>
        ),
      }}
    >
      <div className={styles.page}>
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
    </AppLayout>
  );
}
