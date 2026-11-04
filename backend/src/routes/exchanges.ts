import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { ExchangeStatus } from '@prisma/client';
import { prisma } from '../db';
import { createExchangeSchema, exchangeStatusSchema } from '../utils/validation';

const exchangeInclude = {
  sender: { select: { id: true, name: true, email: true, department: true, semester: true } },
  receiver: { select: { id: true, name: true, email: true, department: true, semester: true } },
  offeredSkill: { include: { skill: true } },
  wantedSkill: { include: { skill: true } },
} as const;

function toExchangeView(exchange: any, viewerId: string) {
  const { email: senderEmail, ...sender } = exchange.sender;
  const { email: receiverEmail, ...receiver } = exchange.receiver;

  return {
    ...exchange,
    sender,
    receiver,
    ...(exchange.status === ExchangeStatus.ACCEPTED
      ? { contactEmail: viewerId === exchange.senderId ? receiverEmail : senderEmail }
      : {}),
  };
}

function validationMessage(error: { errors: Array<{ message: string }> }) {
  return error.errors.map((item) => item.message).join('; ');
}

export const exchangesRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.addHook('preHandler', fastify.authenticate);

  // POST /api/exchanges - Propose an exchange to a student.
  fastify.post('/', async (request, reply) => {
    const parsed = createExchangeSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ success: false, error: validationMessage(parsed.error) });
    }

    const senderId = request.user.id;
    const { receiverId, offeredSkillId, wantedSkillId, message } = parsed.data;
    if (senderId === receiverId) {
      return reply.status(400).send({ success: false, error: 'You cannot send an exchange request to yourself' });
    }

    const [receiver, offeredSkill, wantedSkill] = await Promise.all([
      prisma.user.findUnique({ where: { id: receiverId }, select: { id: true, role: true } }),
      prisma.offeredSkill.findUnique({ where: { id: offeredSkillId }, include: { skill: true } }),
      prisma.wantedSkill.findUnique({ where: { id: wantedSkillId }, include: { skill: true } }),
    ]);

    if (!receiver || receiver.role !== 'STUDENT') {
      return reply.status(404).send({ success: false, error: 'Student recipient not found' });
    }
    if (!offeredSkill || offeredSkill.userId !== senderId) {
      return reply.status(400).send({ success: false, error: 'Choose a skill from your own offered skills' });
    }
    if (!wantedSkill || wantedSkill.userId !== senderId) {
      return reply.status(400).send({ success: false, error: 'Choose a skill from your own wanted skills' });
    }

    const recipientCanTeach = await prisma.offeredSkill.findFirst({
      where: { userId: receiverId, skillId: wantedSkill.skillId },
      select: { id: true },
    });
    if (!recipientCanTeach) {
      return reply.status(400).send({
        success: false,
        error: 'The recipient does not currently offer the skill you want to learn',
      });
    }

    const duplicate = await prisma.exchangeRequest.findFirst({
      where: {
        senderId,
        receiverId,
        offeredSkillId,
        wantedSkillId,
        status: ExchangeStatus.PENDING,
      },
      select: { id: true },
    });
    if (duplicate) {
      return reply.status(409).send({ success: false, error: 'You already have a pending request for this skill exchange' });
    }

    const exchange = await prisma.exchangeRequest.create({
      data: { senderId, receiverId, offeredSkillId, wantedSkillId, message },
      include: exchangeInclude,
    });
    return reply.status(201).send({ success: true, request: toExchangeView(exchange, senderId) });
  });

  // GET /api/exchanges/incoming - Requests addressed to the authenticated student.
  fastify.get('/incoming', async (request, reply) => {
    const viewerId = request.user.id;
    const requests = await prisma.exchangeRequest.findMany({
      where: { receiverId: viewerId },
      include: exchangeInclude,
      orderBy: { createdAt: 'desc' },
    });
    return reply.send({ success: true, requests: requests.map((item) => toExchangeView(item, viewerId)) });
  });

  // GET /api/exchanges/sent - Requests created by the authenticated student.
  fastify.get('/sent', async (request, reply) => {
    const viewerId = request.user.id;
    const requests = await prisma.exchangeRequest.findMany({
      where: { senderId: viewerId },
      include: exchangeInclude,
      orderBy: { createdAt: 'desc' },
    });
    return reply.send({ success: true, requests: requests.map((item) => toExchangeView(item, viewerId)) });
  });

  // PATCH /api/exchanges/:id/status - Receiver accepts/rejects; sender cancels pending requests.
  fastify.patch('/:id/status', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = exchangeStatusSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ success: false, error: validationMessage(parsed.error) });
    }

    const viewerId = request.user.id;
    const { status } = parsed.data;
    const existing = await prisma.exchangeRequest.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ success: false, error: 'Exchange request not found' });
    }
    if (existing.status !== ExchangeStatus.PENDING) {
      return reply.status(409).send({ success: false, error: 'This request is no longer pending' });
    }

    const isReceiverAction = status === ExchangeStatus.ACCEPTED || status === ExchangeStatus.REJECTED;
    if (isReceiverAction && existing.receiverId !== viewerId) {
      return reply.status(403).send({ success: false, error: 'Only the recipient can accept or reject this request' });
    }
    if (status === ExchangeStatus.CANCELED && existing.senderId !== viewerId) {
      return reply.status(403).send({ success: false, error: 'Only the sender can cancel this request' });
    }

    const changed = await prisma.exchangeRequest.updateMany({
      where: { id, status: ExchangeStatus.PENDING },
      data: { status },
    });
    if (changed.count !== 1) {
      return reply.status(409).send({ success: false, error: 'This request was updated by another action' });
    }

    const updated = await prisma.exchangeRequest.findUnique({ where: { id }, include: exchangeInclude });
    return reply.send({ success: true, request: toExchangeView(updated, viewerId) });
  });
};
