import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import bcrypt from 'bcryptjs';
import { prisma } from '../db';
import { registerSchema, loginSchema } from '../utils/validation';

export const authRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // POST /api/auth/register
  fastify.post('/register', async (request, reply) => {
    const parseResult = registerSchema.safeParse(request.body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors.map((e) => e.message).join('; ');
      return reply.status(400).send({
        success: false,
        error: errorMsg,
        details: parseResult.error.flatten(),
      });
    }

    const { name, email, password, department, semester, rollNumber } = parseResult.data;
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedRollNumber = rollNumber.toUpperCase().trim();

    // Check duplicate email
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingUser) {
      return reply.status(409).send({
        success: false,
        error: 'An account with this email address already exists',
      });
    }

    // Check duplicate roll number
    const existingRoll = await prisma.user.findUnique({
      where: { rollNumber: normalizedRollNumber },
    });
    if (existingRoll) {
      return reply.status(409).send({
        success: false,
        error: 'An account with this roll number already exists',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        department,
        semester,
        rollNumber: normalizedRollNumber,
      },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        semester: true,
        rollNumber: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const token = fastify.jwt.sign({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      rollNumber: user.rollNumber,
      department: user.department,
      semester: user.semester,
    });

    return reply.status(201).send({
      success: true,
      message: 'Student account registered successfully',
      token,
      user,
    });
  });

  // POST /api/auth/login
  fastify.post('/login', async (request, reply) => {
    const parseResult = loginSchema.safeParse(request.body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors.map((e) => e.message).join('; ');
      return reply.status(400).send({
        success: false,
        error: errorMsg,
      });
    }

    const { email, password } = parseResult.data;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return reply.status(401).send({
        success: false,
        error: 'Invalid college email or password',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return reply.status(401).send({
        success: false,
        error: 'Invalid college email or password',
      });
    }

    const token = fastify.jwt.sign({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      rollNumber: user.rollNumber,
      department: user.department,
      semester: user.semester,
    });

    return reply.send({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        department: user.department,
        semester: user.semester,
        rollNumber: user.rollNumber,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  });

  // GET /api/auth/me (Protected)
  fastify.get(
    '/me',
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const user = await prisma.user.findUnique({
        where: { id: request.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          department: true,
          semester: true,
          rollNumber: true,
          role: true,
          createdAt: true,
        },
      });

      if (!user) {
        return reply.status(404).send({
          success: false,
          error: 'User not found or deactivated',
        });
      }

      return reply.send({
        success: true,
        user,
      });
    }
  );
};
