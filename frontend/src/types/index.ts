export type Role = 'STUDENT' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  semester: number;
  rollNumber: string;
  role: Role;
  createdAt: string;
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
