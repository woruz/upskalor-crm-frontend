import { LoginForm } from '@/shared/components/forms/loginForm/loginForm';
import { ThemeToggle } from '@/shared/components/ui/themeToggle/themeToggle';
import styles from './login.module.scss';

export function LoginPage() {
  return (
    <div className={styles.page}>
      <div className={styles.themeToggle}>
        <ThemeToggle />
      </div>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.subtitle}>Sign in to your account</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
