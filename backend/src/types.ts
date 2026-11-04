import { Role } from '@prisma/client';
import { FastifyRequest, FastifyReply } from 'fastify';

export interface UserPayload {
  id: string;
  email: string;
  name: string;
  role: Role;
  rollNumber: string;
  department: string;
  semester: number;
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: UserPayload;
    user: UserPayload;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
