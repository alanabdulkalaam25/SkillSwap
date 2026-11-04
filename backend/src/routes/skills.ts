import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { prisma } from '../db';

export const skillsRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // GET /api/skills - Fetch all master skills with optional search & filter
  fastify.get('/', async (request, reply) => {
    const { search, category } = request.query as { search?: string; category?: string };

    const whereClause: any = {};

    if (search && search.trim()) {
      whereClause.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
        { category: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    if (category && category.trim() && category !== 'All') {
      whereClause.category = { equals: category.trim(), mode: 'insensitive' };
    }

    const skills = await prisma.skill.findMany({
      where: whereClause,
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
      include: {
        _count: {
          select: {
            offeredBy: true,
            wantedBy: true,
          },
        },
      },
    });

    return reply.send({
      success: true,
      count: skills.length,
      skills,
    });
  });

  // GET /api/skills/categories - Distinct categories with counts
  fastify.get('/categories', async (_request, reply) => {
    const categories = await prisma.skill.groupBy({
      by: ['category'],
      _count: {
        id: true,
      },
      orderBy: {
        category: 'asc',
      },
    });

    return reply.send({
      success: true,
      categories: categories.map((c) => ({
        name: c.category,
        count: c._count.id,
      })),
    });
  });
};
