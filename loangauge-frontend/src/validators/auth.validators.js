import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(50, 'Password must be at most 50 characters long')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one digit')
  // Backend's custom @ValidPassword only accepts special characters from a
  // specific whitelist (@#$%^&+=!*()_-), not any non-alphanumeric character.
  // A password like "Password1~" used to pass here and then get rejected by
  // the backend, since ~ isn't in that set.
  .regex(/[@#$%^&+=!*()_-]/, 'Password must contain at least one special character (@#$%^&+=!*()_-)');

export const registerSchema = z
  .object({
    // .trim() matters here: backend's @NotBlank rejects whitespace-only
    // input, but zod's .min(1) alone treats "   " as a valid length-3
    // string and lets it through.
    firstName: z.string().trim().min(1, 'First name is required').max(100, 'First name cannot exceed 100 characters'),
    lastName: z.string().trim().min(1, 'Last name is required').max(100, 'Last name cannot exceed 100 characters'),
    // Backend also enforces @Size(max=150) on email — wasn't mirrored here.
    email: z.string().min(1, 'Email is required').max(150, 'Email cannot exceed 150 characters').email('Invalid email format'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm password is required'),
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, 'Phone number must be a 10-digit Indian number starting with 6-9')
      .optional()
      .or(z.literal(''))
      // Backend @Pattern only skips validation on null — an empty string still
      // fails the regex. Normalize blank input to null before it hits the API.
      .transform((val) => (val ? val : null)),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
