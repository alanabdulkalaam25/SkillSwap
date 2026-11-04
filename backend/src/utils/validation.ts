import { z } from 'zod';
import { config } from '../config';

export function isCollegeEmail(email: string): boolean {
  const normalized = email.toLowerCase().trim();
  const domain = normalized.split('@')[1];
  if (!domain) return false;

  // Check exact domain match or subdomain match against allowed list
  const inAllowedList = config.collegeEmailDomains.some((allowed) => {
    return domain === allowed || domain.endsWith(`.${allowed}`);
  });

  if (inAllowedList) return true;

  // Also support any academic institution domain ending in .edu or .ac.in or .edu.*
  const academicRegex = /\.(edu|ac\.[a-z]{2,3}|edu\.[a-z]{2,3})$/i;
  return academicRegex.test(domain);
}

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters long'),
  email: z
    .string()
    .trim()
    .email('Invalid email address')
    .refine(
      (email) => isCollegeEmail(email),
      {
        message: `Registration requires a verified college email address (e.g. @college.edu, @gec.ac.in, or academic domain). Allowed: ${config.collegeEmailDomains.join(', ')}`,
      }
    ),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  department: z.string().trim().min(2, 'Department is required (e.g. Computer Science, Mechanical)'),
  semester: z.coerce.number().int().min(1, 'Semester must be between 1 and 8').max(8, 'Semester must be between 1 and 8'),
  rollNumber: z
    .string()
    .trim()
    .min(3, 'Roll number must be at least 3 characters')
    .regex(/^[a-zA-Z0-9\-_]+$/, 'Roll number must only contain letters, numbers, hyphens or underscores'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
