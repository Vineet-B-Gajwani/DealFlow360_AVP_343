import { z } from 'zod';

export const ALL_ROLES = [
  'SALES_REP',
  'SALES_MANAGER',
  'FINANCE_OPERATIONS',
  'ADMIN',
  'CUSTOMER',
];

export const INTERNAL_ROLES = [
  'SALES_REP',
  'SALES_MANAGER',
  'FINANCE_OPERATIONS',
  'ADMIN',
];

// ── Login Schema with RBAC Role ────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Must be a valid email address'),
  password: z.string().min(1, 'Password is required'),
  role: z
    .string()
    .min(1, 'Please select your role'),
});

// ── Registration Schema ────────────────────────────────────────────────────────

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Must be a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    role: z.enum(ALL_ROLES, {
      errorMap: () => ({ message: 'Please select a valid role' }),
    }),

    // Customer profile fields (optional unless role === 'CUSTOMER')
    companyName: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
    taxId: z.string().optional(),
    proofDocId: z.string().optional(),
    tier: z.enum(['Standard', 'Silver', 'Gold', 'Platinum']).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
