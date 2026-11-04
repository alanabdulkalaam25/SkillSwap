export type Role = 'STUDENT' | 'ADMIN';

export type ProficiencyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  semester: number;
  rollNumber: string;
  bio?: string | null;
  role: Role;
  createdAt: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  description?: string | null;
  createdAt: string;
  _count?: {
    offeredBy: number;
    wantedBy: number;
  };
}

export interface OfferedSkill {
  id: string;
  userId: string;
  skillId: string;
  proficiency: ProficiencyLevel;
  description?: string | null;
  createdAt: string;
  skill: Skill;
}

export interface WantedSkill {
  id: string;
  userId: string;
  skillId: string;
  priority: PriorityLevel;
  notes?: string | null;
  createdAt: string;
  skill: Skill;
}

export interface UserProfile extends User {
  updatedAt?: string;
  offeredSkills: OfferedSkill[];
  wantedSkills: WantedSkill[];
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
  error?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  department: string;
  semester: number;
  rollNumber: string;
}
