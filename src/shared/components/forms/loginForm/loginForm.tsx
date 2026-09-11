import { useFormik } from 'formik';
import { Link, useNavigate } from 'react-router';
import {
  loginSchema,
  type LoginFormValues,
} from '@/shared/lib/validations/schemas';
import { Input } from '@/shared/components/ui/input/input';
import { Button } from '@/shared/components/ui/button/button';
import { useAuth } from '@/shared/lib/hooks/useAuth';
import { ROUTES } from '@/shared/lib/config/routes';

interface LoginFormProps {
  callbackUrl?: string;
}

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const { login } = useAuth();
  const navigate = useNavigate();

  const formik = useFormik<LoginFormValues>({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    validationSchema: loginSchema,
    // Validate on blur and submit only, not on every keystroke.
    validateOnChange: false,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        const mockToken =
          'mock-token-' + Math.random().toString(36).substring(7);
        const mockRefreshToken =
          'mock-refresh-' + Math.random().toString(36).substring(7);

        await login(mockToken, mockRefreshToken, {
          id: '1',
          email: values.email,
          name: 'John Doe',
        });

        navigate(callbackUrl || ROUTES.DASHBOARD);
      } catch {
        setErrors({
          email: 'Invalid email or password',
          password: 'Invalid email or password',
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="Enter your email"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.email}
          error={
            formik.touched.email && formik.errors.email
              ? formik.errors.email
              : undefined
          }
          required
        />

        <Input
          id="password"
          name="password"
          type="password"
          label="Password"
          placeholder="Enter your password"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.password}
          error={
            formik.touched.password && formik.errors.password
              ? formik.errors.password
              : undefined
          }
          required
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="rememberMe"
            checked={formik.values.rememberMe}
            onChange={formik.handleChange}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span
            className="text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Remember me
          </span>
        </label>

        <Link
          to={ROUTES.FORGOT_PASSWORD}
          className="text-sm"
          style={{ color: 'var(--color-primary-600)' }}
        >
          Forgot password?
        </Link>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={formik.isSubmitting}
      >
        Sign in
      </Button>

      <p
        className="text-center text-sm"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        Don&apos;t have an account?{' '}
        <Link
          to={ROUTES.REGISTER}
          className="font-medium"
          style={{ color: 'var(--color-primary-600)' }}
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
