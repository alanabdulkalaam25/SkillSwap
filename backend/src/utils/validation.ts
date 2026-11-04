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
  semester: z.coerce.number().int().min(1, 'Semester must be between 1 and 10').max(10, 'Semester must be between 1 and 10'),
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

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters long').optional(),
  bio: z.string().trim().max(600, 'Bio cannot exceed 600 characters').optional().nullable(),
  department: z.string().trim().min(2, 'Department must be at least 2 characters long').optional(),
  semester: z.coerce.number().int().min(1, 'Semester must be between 1 and 10').max(10, 'Semester must be between 1 and 10').optional(),
});

export const proficiencyEnum = z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']);
export const priorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH']);

export const addOfferedSkillSchema = z
  .object({
    skillId: z.string().trim().optional(),
    skillName: z.string().trim().min(2, 'Skill name must be at least 2 characters').optional(),
    category: z.string().trim().optional(),
    proficiency: proficiencyEnum.default('INTERMEDIATE'),
    description: z.string().trim().max(300, 'Description cannot exceed 300 characters').optional().nullable(),
  })
  .refine((data) => data.skillId || data.skillName, {
    message: 'Either skillId or skillName must be provided',
  });

export const addWantedSkillSchema = z
  .object({
    skillId: z.string().trim().optional(),
    skillName: z.string().trim().min(2, 'Skill name must be at least 2 characters').optional(),
    category: z.string().trim().optional(),
    priority: priorityEnum.default('MEDIUM'),
    notes: z.string().trim().max(300, 'Notes cannot exceed 300 characters').optional().nullable(),
  })
  .refine((data) => data.skillId || data.skillName, {
    message: 'Either skillId or skillName must be provided',
  });

export const discoverQuerySchema = z.object({
  search: z.string().trim().optional(),
  department: z.string().trim().optional(),
  semester: z.coerce.number().int().min(1).max(10).optional(),
  skill: z.string().trim().optional(),
  skillType: z.enum(['offered', 'wanted', 'any']).default('any').optional(),
  mutualOnly: z
    .string()
    .transform((val) => val === 'true' || val === '1')
    .optional(),
  minScore: z.coerce.number().min(0).max(100).optional(),
  sort: z
    .enum(['score_desc', 'score_asc', 'name_asc', 'skills_desc', 'newest'])
    .default('score_desc')
    .optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type AddOfferedSkillInput = z.infer<typeof addOfferedSkillSchema>;
export type AddWantedSkillInput = z.infer<typeof addWantedSkillSchema>;
export type DiscoverQueryInput = z.infer<typeof discoverQuerySchema>;
