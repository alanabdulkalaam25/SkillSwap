import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db';

const rosterQuery = z.object({
  search: z.string().trim().max(100).optional(),
  status: z.enum(['active', 'suspended', 'all']).default('all'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});
const skillSchema = z.object({
  name: z.string().trim().min(2).max(80),
  category: z.string().trim().min(2).max(80),
  description: z.string().trim().max(300).optional().nullable(),
});

export const adminRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.addHook('preHandler', fastify.authenticate);
  fastify.addHook('preHandler', async (request, reply) => {
    const user = await prisma.user.findUnique({ where: { id: request.user.id }, select: { role: true, isActive: true } });
    if (!user?.isActive) return reply.status(403).send({ success: false, error: 'Account is suspended' });
    if (user.role !== 'ADMIN') return reply.status(403).send({ success: false, error: 'Administrator access required' });
  });

  fastify.get('/stats', async (_request, reply) => {
    const [students, skills, exchanges, pending, suspended] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.skill.count(),
      prisma.exchangeRequest.count(),
      prisma.exchangeRequest.count({ where: { status: 'PENDING' } }),
      prisma.user.count({ where: { role: 'STUDENT', isActive: false } }),
    ]);
    return reply.send({ success: true, stats: { students, skills, exchanges, pending, suspended } });
  });

  fastify.get('/students', async (request, reply) => {
    const parsed = rosterQuery.safeParse(request.query);
    if (!parsed.success) return reply.status(400).send({ success: false, error: parsed.error.errors.map((e) => e.message).join('; ') });
    const { search, status, page, limit } = parsed.data;
    const where = {
      role: 'STUDENT' as const,
      ...(status === 'active' ? { isActive: true } : status === 'suspended' ? { isActive: false } : {}),
      ...(search ? { OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { rollNumber: { contains: search, mode: 'insensitive' as const } },
        { department: { contains: search, mode: 'insensitive' as const } },
      ] } : {}),
    };
    const [total, students] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit,
        select: { id: true, name: true, email: true, department: true, semester: true, rollNumber: true, isActive: true, createdAt: true,
          _count: { select: { offeredSkills: true, wantedSkills: true, sentExchanges: true, receivedExchanges: true } } } }),
    ]);
    return reply.send({ success: true, students, total, page, limit, totalPages: Math.ceil(total / limit) || 1 });
  });

  fastify.patch('/students/:id/status', async (request, reply) => {
    const params = z.object({ id: z.string().uuid() }).safeParse(request.params);
    const body = z.object({ status: z.enum(['active', 'suspended']) }).safeParse(request.body);
    if (!params.success || !body.success) return reply.status(400).send({ success: false, error: 'Provide a valid student id and status (active or suspended)' });
    const student = await prisma.user.findUnique({ where: { id: params.data.id }, select: { id: true, role: true } });
    if (!student || student.role !== 'STUDENT') return reply.status(404).send({ success: false, error: 'Student not found' });
    const updated = await prisma.user.update({ where: { id: student.id }, data: { isActive: body.data.status === 'active' }, select: { id: true, name: true, isActive: true } });
    return reply.send({ success: true, student: updated });
  });

  fastify.post('/skills', async (request, reply) => {
    const parsed = skillSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ success: false, error: parsed.error.errors.map((e) => e.message).join('; ') });
    try {
      const skill = await prisma.skill.create({ data: parsed.data });
      return reply.status(201).send({ success: true, skill });
    } catch (error: any) {
      if (error?.code === 'P2002') return reply.status(409).send({ success: false, error: 'A skill with this name already exists' });
      throw error;
    }
  });
};
