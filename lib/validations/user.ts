import { z } from 'zod';
import { REGEX } from '../constants';

export const userSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .regex(REGEX.EMAIL, 'Invalid email format'),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(REGEX.PASSWORD, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  
  role: z.enum(['admin', 'instructor', 'student']),
  
  avatar: z.string().url().optional(),
  
  twoFactorEnabled: z.boolean().default(false),
  
  twoFactorSecret: z.string().optional(),
  
  twoFactorRecoveryCodes: z.array(z.string()).optional(),
  
  status: z.enum(['active', 'suspended', 'pending']).default('active'),
  
  classes: z.array(z.string()).optional(),
});

export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  
  password: z.string()
    .min(1, 'Password is required'),
  
  token: z.string().optional(),
});

export const registerSchema = userSchema.pick({
  email: true,
  password: true,
  name: true,
});

export const updateUserSchema = userSchema.partial().extend({
  id: z.string().min(1, 'User ID is required'),
});

export type UserSchema = z.infer<typeof userSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
export type UpdateUserSchema = z.infer<typeof updateUserSchema>;