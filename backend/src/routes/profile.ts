import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { prisma } from '../db';
import {
  updateProfileSchema,
  addOfferedSkillSchema,
  addWantedSkillSchema,
} from '../utils/validation';

export const profileRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // All profile routes require authentication
  fastify.addHook('preHandler', fastify.authenticate);

  // Helper to resolve or create a skill
  async function resolveSkill(skillId?: string, skillName?: string, category?: string) {
    if (skillId) {
      const skill = await prisma.skill.findUnique({ where: { id: skillId } });
      if (skill) return skill;
    }

    if (skillName) {
      const normalized = skillName.trim();
      // Look up case-insensitively
      const existing = await prisma.skill.findFirst({
        where: {
          name: { equals: normalized, mode: 'insensitive' },
        },
      });
      if (existing) return existing;

      // Create new skill in catalog
      return await prisma.skill.create({
        data: {
          name: normalized,
          category: category?.trim() || 'General / Other',
          description: `Custom skill added by student community`,
        },
      });
    }

    return null;
  }

  // GET /api/profile/me - Fetch full user profile with skills
  fastify.get('/me', async (request, reply) => {
    const userId = request.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        semester: true,
        rollNumber: true,
        bio: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        offeredSkills: {
          include: {
            skill: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        wantedSkills: {
          include: {
            skill: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      return reply.status(404).send({
        success: false,
        error: 'Student profile not found',
      });
    }

    return reply.send({
      success: true,
      profile: user,
    });
  });

  // PUT /api/profile/me - Update profile bio and academic details
  fastify.put('/me', async (request, reply) => {
    const userId = request.user.id;
    const parseResult = updateProfileSchema.safeParse(request.body);

    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors.map((e) => e.message).join('; ');
      return reply.status(400).send({
        success: false,
        error: errorMsg,
      });
    }

    const { name, bio, department, semester } = parseResult.data;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio ?? '';
    if (department !== undefined) updateData.department = department;
    if (semester !== undefined) updateData.semester = semester;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        semester: true,
        rollNumber: true,
        bio: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        offeredSkills: {
          include: { skill: true },
        },
        wantedSkills: {
          include: { skill: true },
        },
      },
    });

    return reply.send({
      success: true,
      message: 'Student profile updated successfully',
      profile: updatedUser,
    });
  });

  // POST /api/profile/skills/offered - Add an offered skill
  fastify.post('/skills/offered', async (request, reply) => {
    const userId = request.user.id;
    const parseResult = addOfferedSkillSchema.safeParse(request.body);

    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors.map((e) => e.message).join('; ');
      return reply.status(400).send({
        success: false,
        error: errorMsg,
      });
    }

    const { skillId, skillName, category, proficiency, description } = parseResult.data;

    const skill = await resolveSkill(skillId, skillName, category);
    if (!skill) {
      return reply.status(404).send({
        success: false,
        error: 'Skill could not be found or created',
      });
    }

    // Check if user already offers this skill
    const existing = await prisma.offeredSkill.findUnique({
      where: {
        userId_skillId: {
          userId,
          skillId: skill.id,
        },
      },
      include: {
        skill: true,
      },
    });

    if (existing) {
      // Update proficiency and description
      const updated = await prisma.offeredSkill.update({
        where: { id: existing.id },
        data: {
          proficiency,
          description: description ?? existing.description,
        },
        include: {
          skill: true,
        },
      });

      return reply.send({
        success: true,
        message: `Updated proficiency for ${skill.name}`,
        offeredSkill: updated,
      });
    }

    const newOffered = await prisma.offeredSkill.create({
      data: {
        userId,
        skillId: skill.id,
        proficiency,
        description: description ?? '',
      },
      include: {
        skill: true,
      },
    });

    return reply.status(201).send({
      success: true,
      message: `Added ${skill.name} to skills you teach`,
      offeredSkill: newOffered,
    });
  });

  // DELETE /api/profile/skills/offered/:id - Remove an offered skill
  fastify.delete('/skills/offered/:id', async (request, reply) => {
    const userId = request.user.id;
    const { id } = request.params as { id: string };

    const existing = await prisma.offeredSkill.findUnique({
      where: { id },
    });

    if (!existing) {
      return reply.status(404).send({
        success: false,
        error: 'Offered skill record not found',
      });
    }

    if (existing.userId !== userId) {
      return reply.status(403).send({
        success: false,
        error: 'You do not have permission to delete this skill',
      });
    }

    await prisma.offeredSkill.delete({
      where: { id },
    });

    return reply.send({
      success: true,
      message: 'Offered skill removed successfully',
    });
  });

  // POST /api/profile/skills/wanted - Add a wanted skill
  fastify.post('/skills/wanted', async (request, reply) => {
    const userId = request.user.id;
    const parseResult = addWantedSkillSchema.safeParse(request.body);

    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors.map((e) => e.message).join('; ');
      return reply.status(400).send({
        success: false,
        error: errorMsg,
      });
    }

    const { skillId, skillName, category, priority, notes } = parseResult.data;

    const skill = await resolveSkill(skillId, skillName, category);
    if (!skill) {
      return reply.status(404).send({
        success: false,
        error: 'Skill could not be found or created',
      });
    }

    // Check if user already listed this wanted skill
    const existing = await prisma.wantedSkill.findUnique({
      where: {
        userId_skillId: {
          userId,
          skillId: skill.id,
        },
      },
      include: {
        skill: true,
      },
    });

    if (existing) {
      // Update priority and notes
      const updated = await prisma.wantedSkill.update({
        where: { id: existing.id },
        data: {
          priority,
          notes: notes ?? existing.notes,
        },
        include: {
          skill: true,
        },
      });

      return reply.send({
        success: true,
        message: `Updated priority for ${skill.name}`,
        wantedSkill: updated,
      });
    }

    const newWanted = await prisma.wantedSkill.create({
      data: {
        userId,
        skillId: skill.id,
        priority,
        notes: notes ?? '',
      },
      include: {
        skill: true,
      },
    });

    return reply.status(201).send({
      success: true,
      message: `Added ${skill.name} to skills you want to learn`,
      wantedSkill: newWanted,
    });
  });

  // DELETE /api/profile/skills/wanted/:id - Remove a wanted skill
  fastify.delete('/skills/wanted/:id', async (request, reply) => {
    const userId = request.user.id;
    const { id } = request.params as { id: string };

    const existing = await prisma.wantedSkill.findUnique({
      where: { id },
    });

    if (!existing) {
      return reply.status(404).send({
        success: false,
        error: 'Wanted skill record not found',
      });
    }

    if (existing.userId !== userId) {
      return reply.status(403).send({
        success: false,
        error: 'You do not have permission to delete this skill',
      });
    }

    await prisma.wantedSkill.delete({
      where: { id },
    });

    return reply.send({
      success: true,
      message: 'Wanted skill removed successfully',
    });
  });
};
