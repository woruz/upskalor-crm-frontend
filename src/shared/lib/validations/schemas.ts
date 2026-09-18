import * as Yup from 'yup';

// ─── Login ──────────────────────────────────────────────────────────────────────

export interface LoginFormValues {
  companySlug: string;
  email: string;
  password: string;
}

export const loginSchema = Yup.object<LoginFormValues>({
  companySlug: Yup.string()
    .max(100, 'Company slug must be 100 characters or less')
    .matches(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Only lowercase letters, numbers, and hyphens are allowed',
    )
    .required('Company slug is required'),
  email: Yup.string()
    .email('Invalid email address')
    .max(320, 'Email must be 320 characters or less')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .max(200, 'Password must be 200 characters or less')
    .required('Password is required'),
});

// ─── Register ───────────────────────────────────────────────────────────────────

export interface RegisterFormValues {
  companyName: string;
  companySlug: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const registerSchema = Yup.object<RegisterFormValues>({
  companyName: Yup.string()
    .max(150, 'Company name must be 150 characters or less')
    .required('Company name is required'),
  companySlug: Yup.string()
    .max(100, 'Company slug must be 100 characters or less')
    .matches(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Only lowercase letters, numbers, and hyphens are allowed',
    )
    .required('Company slug is required'),
  firstName: Yup.string()
    .max(100, 'First name must be 100 characters or less')
    .required('First name is required'),
  lastName: Yup.string()
    .max(100, 'Last name must be 100 characters or less')
    .required('Last name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .max(320, 'Email must be 320 characters or less')
    .required('Email is required'),
  password: Yup.string()
    .min(12, 'Password must be at least 12 characters')
    .max(200, 'Password must be 200 characters or less')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

// ─── Forgot / Reset Password ────────────────────────────────────────────────────

export interface ForgotPasswordFormValues {
  email: string;
}

export interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

export const forgotPasswordSchema = Yup.object<ForgotPasswordFormValues>({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});

export const resetPasswordSchema = Yup.object<ResetPasswordFormValues>({
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

// ─── Profile ────────────────────────────────────────────────────────────────────

export interface ProfileFormValues {
  name: string;
  email: string;
  bio: string;
}

export interface ChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ContactFormValues {
  name: string;
  email: string;
  message: string;
}

export const profileSchema = Yup.object<ProfileFormValues>({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  bio: Yup.string().max(500, 'Bio must be 500 characters or less').defined(),
});

export const changePasswordSchema = Yup.object<ChangePasswordFormValues>({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm password is required'),
});

export const contactSchema = Yup.object<ContactFormValues>({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  message: Yup.string()
    .min(10, 'Message must be at least 10 characters')
    .required('Message is required'),
});
