import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { config } from './config';
import { authRoutes } from './routes/auth';
import { skillsRoutes } from './routes/skills';
import { profileRoutes } from './routes/profile';
import { studentsRoutes } from './routes/students';
import { exchangesRoutes } from './routes/exchanges';
import { prisma } from './db';
import './types';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: config.isDev ? 'info' : 'warn',
    },
  });

  // Enable CORS
  await app.register(cors, {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Enable JWT
  await app.register(jwt, {
    secret: config.jwtSecret,
  });

  // Authentication preHandler hook decorator
  app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      return reply.status(401).send({
        success: false,
        error: 'Unauthorized: Invalid or expired authentication token',
      });
    }
  });

  // Base Health Endpoint
  app.get('/api/health', async () => {
    return {
      status: 'ok',
      service: 'SkillSwap API Gateway',
      timestamp: new Date().toISOString(),
    };
  });

  // Register Auth Routes
  await app.register(authRoutes, { prefix: '/api/auth' });

  // Register Skills Catalog Routes
  await app.register(skillsRoutes, { prefix: '/api/skills' });

  // Register Student Profile & Skills Management Routes
  await app.register(profileRoutes, { prefix: '/api/profile' });

  // Register Student Discovery & Matching Engine Routes
  await app.register(studentsRoutes, { prefix: '/api/students' });

  // Register Skill Exchange Transaction Routes
  await app.register(exchangesRoutes, { prefix: '/api/exchanges' });

  // Custom 404 handler
  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      success: false,
      error: `Endpoint not found: ${request.method} ${request.url}`,
    });
  });

  return app;
}

export async function start() {
  const app = await buildApp();

  try {
    // Test DB connection
    await prisma.$connect();
    app.log.info('Successfully connected to PostgreSQL database');

    await app.listen({
      port: config.port,
      host: config.host,
    });
    console.log(`🚀 SkillSwap Backend running at http://localhost:${config.port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

// Run directly if this is the entry module
if (require.main === module || process.env.NODE_ENV !== 'test') {
  start();
}
