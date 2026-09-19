import { RegisterForm } from '@/shared/components/forms/registerForm/registerForm';
import { ThemeToggle } from '@/shared/components/ui/themeToggle/themeToggle';
import styles from './register.module.scss';

export function RegisterPage() {
  return (
    <div className={styles.page}>
      <div className={styles.themeToggle}>
        <ThemeToggle />
      </div>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Create your account</h1>
          <p className={styles.subtitle}>
            Register your company and get started
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
