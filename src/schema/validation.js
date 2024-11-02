import { z, ZodDate } from 'zod';
import validator from 'validator';

const sanitizeInput = (value) => {
  return validator.trim(validator.escape(value));
};

export const registerSchema = z
  .object({
    full_name: z
      .string()
      .trim()
      .min(1, 'First name is required')
      .transform(sanitizeInput),

    email: z
      .string()
      .trim()
      .min(1, 'Email is required')
      .email('Invalid email address')
      .transform(sanitizeInput),

    password: z.string().min(6, 'Password must be at least 6 characters'),

    confirm_password: z
      .string()
      .min(6, 'Confirm password must be at least 5 characters'),
  })
  .superRefine(({ password, confirm_password }, ctx) => {
    if (password !== confirm_password) {
      ctx.addIssue({
        path: ['confirm_password'],
        message: 'Passwords must match',
      });
    }
  });

export const verifySchema = z.object({
  otp: z.string().trim().min(1, 'otp is required').transform(sanitizeInput),
});

export const forgetPswdSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .transform(sanitizeInput),
});

export const resetPswdSchema = z
  .object({
    newPassword: z
      .string()
      .trim()
      .min(6, 'New password is required')
      .transform(sanitizeInput),

    confirm_newPassword: z
      .string()
      .min(6, 'Confirm password is required')
      .transform(sanitizeInput),
  })
  .superRefine(({ newPassword, confirm_newPassword }, ctx) => {
    if (newPassword !== confirm_newPassword) {
      ctx.addIssue({
        path: ['confirm_newPassword'],
        message: 'Passwords must match',
      });
    }
  });

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .transform(sanitizeInput),

  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const inviteSchema = z.object({
  emails: z
    .array(z.string())
    .min(1, 'At least one email is required')
    .transform((emails) => emails.map(sanitizeInput))
    .refine((emails) =>
      emails.every((email) => z.string().email().safeParse(email).success)
    ),
});

export const requestSchema = z.object({
  requestType: z
    .string()
    .trim()
    .min(1, 'Request type is required')
    .transform(sanitizeInput),
  reason: z
    .string()
    .trim()
    .min(1, 'Reason is required')
    .transform(sanitizeInput),
  note: z
    .string()
    .trim()
    .min(1, 'Note is required')
    .max(250)
    .transform(sanitizeInput),
  startDate: z
    .string()
    .trim()
    .min(1, 'Start date is required')
    .transform(sanitizeInput),
  endDate: z
    .string()
    .trim()
    .min(1, 'End date is required')
    .transform(sanitizeInput),
});

export const updateUserSchema = z.object({
  full_name: z.string().optional(),
  email: z.string().email().optional(),
  work_days: z.array(z.string()).optional(),
  role: z.string().optional(),
  shift_duration: z
    .object({
      start: z.string().optional(),
      end: z.string().optional(),
    })
    .optional(),
});

export const passwordSchema = z
  .object({
    current_password: z
      .string()
      .min(6, 'Password is required')
      .transform(sanitizeInput),
    new_password: z
      .string()
      .min(6, 'Confirm password is required')
      .transform(sanitizeInput),
    confirm_password: z
      .string()
      .min(6, 'Confirm password is required')
      .transform(sanitizeInput),
  })
  .superRefine(({ new_password, confirm_password }, ctx) => {
    if (new_password !== confirm_password) {
      ctx.addIssue({
        path: ['confirm_password'],
        message: 'Passwords must match',
      });
    }
  });

export const plansSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Plan name is required')
    .transform(sanitizeInput),
  price: z.number().optional(),
  currency: z
    .string()
    .trim()
    .min(1, 'Plan name is required')
    .transform(sanitizeInput),
  duration: z
    .string()
    .trim()
    .min(1, 'Plan name is required')
    .transform(sanitizeInput),
  features: z
    .string()
    .trim()
    .min(1, 'Features is required')
    .transform(sanitizeInput),
});

export const chargeRequestSchema = z.object({
  planId: z.string().nonempty('Plan ID is required'),
  card: z
    .object({
      number: z
        .string()
        .regex(/^\d{15,19}$/, { message: 'Invalid card number' }),
      cvv: z.string().regex(/^\d{3,4}$/, { message: 'Invalid CVV' }),
      expiryMonth: z
        .string()
        .regex(/^(0[1-9]|1[0-2])$/, { message: 'Invalid expiry month' }),
      expiryYear: z
        .string()
        .regex(/^\d{4}$/, { message: 'Invalid expiry year' }),
    })
    .refine(
      (card) => {
        const currentDate = new Date();
        const cardDate = new Date(
          card.expiryYear,
          parseInt(card.expiryMonth) - 1
        );
        return cardDate >= currentDate;
      },
      { message: 'Card has expired' }
    ),
});

export const pinSchema = z.object({
  reference: z
    .string()
    .trim()
    .min(1, 'Reference is required')
    .transform(sanitizeInput),

  pin: z.string().trim().min(1, 'Pin is required').transform(sanitizeInput),
});

export const otpSchema = z.object({
  reference: z
    .string()
    .trim()
    .min(1, 'Reference is required')
    .transform(sanitizeInput),

  otp: z.string().trim().min(1, 'Otp is required').transform(sanitizeInput),
});
