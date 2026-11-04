import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { prisma } from '../db';
import { discoverQuerySchema } from '../utils/validation';
import { calculateMatchScore } from '../utils/matching';

export const studentsRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // All student discover routes require authentication
  fastify.addHook('preHandler', fastify.authenticate);

  // GET /api/students/departments - Distinct departments for filters
  fastify.get('/departments', async (request, reply) => {
    const departments = await prisma.user.findMany({
      select: { department: true },
      distinct: ['department'],
      orderBy: { department: 'asc' },
    });

    return reply.send({
      success: true,
      departments: departments.map((d) => d.department).filter(Boolean),
    });
  });

  // GET /api/students/discover - Discover peers with smart matching scores
  fastify.get('/discover', async (request, reply) => {
    const currentUserId = request.user.id;
    const parseResult = discoverQuerySchema.safeParse(request.query);

    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors.map((e) => e.message).join('; ');
      return reply.status(400).send({
        success: false,
        error: errorMsg,
      });
    }

    const {
      search,
      department,
      semester,
      skill,
      skillType = 'any',
      mutualOnly,
      minScore,
      sort = 'score_desc',
      page = 1,
      limit = 20,
    } = parseResult.data;

    // 1. Fetch current user with their offered and wanted skills
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      include: {
        offeredSkills: { include: { skill: true } },
        wantedSkills: { include: { skill: true } },
      },
    });

    if (!currentUser) {
      return reply.status(404).send({
        success: false,
        error: 'Current authenticated student profile not found',
      });
    }

    // 2. Build where filter for candidate discovery
    const whereClause: any = {
      id: { not: currentUserId },
    };

    if (department) {
      whereClause.department = {
        contains: department,
        mode: 'insensitive',
      };
    }

    if (semester !== undefined) {
      whereClause.semester = semester;
    }

    // Skill filter
    if (skill) {
      const skillFilter = {
        skill: {
          name: {
            contains: skill,
            mode: 'insensitive' as const,
          },
        },
      };

      if (skillType === 'offered') {
        whereClause.offeredSkills = { some: skillFilter };
      } else if (skillType === 'wanted') {
        whereClause.wantedSkills = { some: skillFilter };
      } else {
        whereClause.OR = [
          { offeredSkills: { some: skillFilter } },
          { wantedSkills: { some: skillFilter } },
        ];
      }
    }

    // Search query filter (matches name, bio, rollNumber, or skill names)
    if (search) {
      const searchPattern = { contains: search, mode: 'insensitive' as const };
      const searchConditions: any[] = [
        { name: searchPattern },
        { bio: searchPattern },
        { rollNumber: searchPattern },
        { department: searchPattern },
        { offeredSkills: { some: { skill: { name: searchPattern } } } },
        { wantedSkills: { some: { skill: { name: searchPattern } } } },
      ];

      if (whereClause.OR) {
        whereClause.AND = [
          { OR: whereClause.OR },
          { OR: searchConditions },
        ];
        delete whereClause.OR;
      } else {
        whereClause.OR = searchConditions;
      }
    }

    // 3. Fetch candidate students
    const candidates = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        department: true,
        semester: true,
        rollNumber: true,
        bio: true,
        role: true,
        createdAt: true,
        offeredSkills: {
          include: { skill: true },
          orderBy: { createdAt: 'desc' },
        },
        wantedSkills: {
          include: { skill: true },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 4. Calculate smart matching scores for each candidate
    const candidatesWithMatch = candidates.map((candidate) => {
      const match = calculateMatchScore(currentUser, candidate);
      return {
        ...candidate,
        match,
      };
    });

    // 5. Post-calculation filters (mutualOnly, minScore)
    let filteredCandidates = candidatesWithMatch;

    if (mutualOnly) {
      filteredCandidates = filteredCandidates.filter((c) => c.match.isMutual);
    }

    if (minScore !== undefined) {
      filteredCandidates = filteredCandidates.filter((c) => c.match.score >= minScore);
    }

    // 6. Sort candidates
    filteredCandidates.sort((a, b) => {
      switch (sort) {
        case 'score_asc':
          return a.match.score - b.match.score;
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'skills_desc': {
          const aCount = a.offeredSkills.length + a.wantedSkills.length;
          const bCount = b.offeredSkills.length + b.wantedSkills.length;
          return bCount - aCount;
        }
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'score_desc':
        default: {
          if (b.match.score !== a.match.score) {
            return b.match.score - a.match.score;
          }
          if (b.match.isMutual !== a.match.isMutual) {
            return b.match.isMutual ? 1 : -1;
          }
          return a.name.localeCompare(b.name);
        }
      }
    });

    // 7. Calculate aggregate discovery statistics
    const totalCount = filteredCandidates.length;
    const mutualMatchesCount = filteredCandidates.filter((c) => c.match.isMutual).length;
    const highMatchesCount = filteredCandidates.filter((c) => c.match.score >= 70).length;

    // 8. Pagination slice
    const startIndex = (page - 1) * limit;
    const paginatedStudents = filteredCandidates.slice(startIndex, startIndex + limit);
    const totalPages = Math.ceil(totalCount / limit) || 1;

    return reply.send({
      success: true,
      total: totalCount,
      page,
      limit,
      totalPages,
      stats: {
        totalFound: totalCount,
        mutualMatches: mutualMatchesCount,
        highMatches: highMatchesCount,
      },
      students: paginatedStudents,
    });
  });

  // GET /api/students/:id - Public student profile + personalized match breakdown
  fastify.get('/:id', async (request, reply) => {
    const currentUserId = request.user.id;
    const { id } = request.params as { id: string };

    const [currentUser, candidate] = await Promise.all([
      prisma.user.findUnique({
        where: { id: currentUserId },
        include: {
          offeredSkills: { include: { skill: true } },
          wantedSkills: { include: { skill: true } },
        },
      }),
      prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          department: true,
          semester: true,
          rollNumber: true,
          bio: true,
          role: true,
          createdAt: true,
          offeredSkills: {
            include: { skill: true },
            orderBy: { createdAt: 'desc' },
          },
          wantedSkills: {
            include: { skill: true },
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
    ]);

    if (!candidate) {
      return reply.status(404).send({
        success: false,
        error: 'Student not found',
      });
    }

    if (!currentUser) {
      return reply.status(404).send({
        success: false,
        error: 'Authenticated student profile not found',
      });
    }

    const match = calculateMatchScore(currentUser, candidate);

    return reply.send({
      success: true,
      student: {
        ...candidate,
        match,
      },
    });
  });
};
