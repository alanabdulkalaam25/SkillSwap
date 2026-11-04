import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  host: process.env.HOST || '0.0.0.0',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/skillswap?schema=public',
  jwtSecret: process.env.JWT_SECRET || 'skillswap_super_secret_jwt_key_2026_phase1',
  collegeEmailDomains: (process.env.COLLEGE_EMAIL_DOMAINS || 'college.edu,student.college.edu,gec.ac.in,campus.edu,mycollege.edu')
    .split(',')
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean),
  isDev: process.env.NODE_ENV !== 'production',
};
