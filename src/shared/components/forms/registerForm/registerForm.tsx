import { useFormik } from 'formik';
import { Link, useNavigate } from 'react-router';
import {
  registerSchema,
  type RegisterFormValues,
} from '@/shared/lib/validations/schemas';
import { Input } from '@/shared/components/ui/input/input';
import { Button } from '@/shared/components/ui/button/button';
import { useToast } from '@/shared/components/ui/toast/toast';
import {
  registerCompany,
  extractApiError,
  extractApiErrorCode,
} from '@/shared/lib/api/authApi';
import { ROUTES } from '@/shared/lib/config/routes';

/**
 * Auto-generates a URL-safe slug from a company name.
 * "Acme Solar Corp" → "acme-solar-corp"
 */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function RegisterForm() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const formik = useFormik<RegisterFormValues>({
    initialValues: {
      companyName: '',
      companySlug: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: registerSchema,
    validateOnChange: false,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        await registerCompany({
          companyName: values.companyName,
          companySlug: values.companySlug,
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
        });

        addToast({
          title: 'Account created!',
          description:
            'Your company has been registered. Please sign in to continue.',
          variant: 'success',
        });

        navigate(ROUTES.LOGIN);
      } catch (error) {
        const message = extractApiError(error);
        const code = extractApiErrorCode(error);

        if (code === 'REGISTRATION_CONFLICT') {
          setErrors({
            companySlug: 'Company slug or email is already taken',
            email: 'Company slug or email is already taken',
          });
        }

        addToast({
          title: 'Registration failed',
          description: message,
          variant: 'error',
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  /**
   * When the user types a company name, auto-populate the slug field
   * (only if the slug hasn't been manually edited).
   */
  const handleCompanyNameChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    formik.handleChange(e);
    const currentSlug = formik.values.companySlug;
    const autoSlug = slugify(formik.values.companyName);
    // Only auto-fill if the slug currently matches the auto-generated one (or is empty)
    if (currentSlug === '' || currentSlug === autoSlug) {
      formik.setFieldValue('companySlug', slugify(e.target.value));
    }
  };

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* ── Company Info ── */}
        <Input
          id="companyName"
          name="companyName"
          type="text"
          label="Company Name"
          placeholder="e.g. Acme Solar Corp"
          onChange={handleCompanyNameChange}
          onBlur={formik.handleBlur}
          value={formik.values.companyName}
          error={
            formik.touched.companyName && formik.errors.companyName
              ? formik.errors.companyName
              : undefined
          }
          required
        />

        <Input
          id="companySlug"
          name="companySlug"
          type="text"
          label="Company Slug"
          placeholder="e.g. acme-solar"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.companySlug}
          error={
            formik.touched.companySlug && formik.errors.companySlug
              ? formik.errors.companySlug
              : undefined
          }
          helpText="URL-safe identifier (lowercase, numbers, hyphens only)"
          required
        />

        {/* ── Owner Info ── */}
        <div className="flex gap-3" style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          <Input
            id="firstName"
            name="firstName"
            type="text"
            label="First Name"
            placeholder="John"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.firstName}
            error={
              formik.touched.firstName && formik.errors.firstName
                ? formik.errors.firstName
                : undefined
            }
            wrapperClassName="flex-1"
            required
          />

          <Input
            id="lastName"
            name="lastName"
            type="text"
            label="Last Name"
            placeholder="Doe"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.lastName}
            error={
              formik.touched.lastName && formik.errors.lastName
                ? formik.errors.lastName
                : undefined
            }
            wrapperClassName="flex-1"
            required
          />
        </div>

        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="owner@acmesolar.com"
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
          placeholder="Minimum 12 characters"
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

        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirm Password"
          placeholder="Re-enter your password"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.confirmPassword}
          error={
            formik.touched.confirmPassword && formik.errors.confirmPassword
              ? formik.errors.confirmPassword
              : undefined
          }
          required
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={formik.isSubmitting}
      >
        Create account
      </Button>

      <p
        className="text-center text-sm"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        Already have an account?{' '}
        <Link
          to={ROUTES.LOGIN}
          className="font-medium"
          style={{ color: 'var(--color-primary-600)' }}
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
