import { useFormik } from 'formik';
import { Link, useNavigate, useLocation } from 'react-router';
import {
  loginSchema,
  type LoginFormValues,
} from '@/shared/lib/validations/schemas';
import { Input } from '@/shared/components/ui/input/input';
import { Button } from '@/shared/components/ui/button/button';
import { useAuth } from '@/shared/lib/hooks/useAuth';
import { useToast } from '@/shared/components/ui/toast/toast';
import { loginUser, extractApiError, extractApiErrorCode } from '@/shared/lib/api/authApi';
import { ROUTES } from '@/shared/lib/config/routes';

interface LoginFormProps {
  callbackUrl?: string;
}

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  // If the user was redirected here from a protected route, capture where they came from.
  const from =
    callbackUrl ||
    (location.state as { from?: string })?.from ||
    ROUTES.DASHBOARD;

  const formik = useFormik<LoginFormValues>({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: loginSchema,
    // Validate on blur and submit only, not on every keystroke.
    validateOnChange: false,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        const response = await loginUser({
          email: values.email,
          password: values.password,
        });

        login(
          response.token,
          response.refreshToken,
          response.user,
          response.company,
        );

        addToast({
          title: 'Welcome back!',
          description: `Signed in as ${response.user.firstName} ${response.user.lastName}`,
          variant: 'success',
        });

        navigate(from);
      } catch (error) {
        const message = extractApiError(error);
        const code = extractApiErrorCode(error);

        const isNotRegistered =
          code === 'USER_NOT_FOUND' ||
          code === 'TENANT_NOT_FOUND' ||
          code === 'COMPANY_NOT_FOUND' ||
          code === 'NOT_FOUND' ||
          message.toLowerCase().includes('not found') ||
          message.toLowerCase().includes('not registered') ||
          message.toLowerCase().includes('no company found') ||
          message.toLowerCase().includes('no user found');

        if (isNotRegistered) {
          setErrors({ email: 'Account not registered. Redirecting to register page...' });
          addToast({
            title: 'Account Not Registered',
            description: 'No account found with these details. Redirecting you to register...',
            variant: 'warning',
          });
          setTimeout(() => {
            navigate(ROUTES.REGISTER);
          }, 1500);
        } else {
          setErrors({ email: message });
          addToast({
            title: 'Sign in failed',
            description: message,
            variant: 'error',
          });
        }
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

      <div
        className="flex items-center justify-end"
        style={{ marginTop: 'var(--spacing-sm)' }}
      >
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
        Not registered yet?{' '}
        <Link
          to={ROUTES.REGISTER}
          className="font-medium"
          style={{ color: 'var(--color-primary-600)', fontWeight: 600 }}
        >
          Register your company
        </Link>
      </p>
    </form>
  );
}
