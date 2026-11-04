import { buildApp } from './server';
import { prisma } from './db';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function runPhase4Tests() {
  console.log('🧪 Starting Phase 4 Verification Suite (Skill Exchange Requests)...\n');
  const app = await buildApp();
  await app.ready();

  const sender = { email: 'phase4.sender@gec.ac.in', rollNumber: 'P4SENDER999' };
  const receiver = { email: 'phase4.receiver@gec.ac.in', rollNumber: 'P4RECEIVER999' };

  try {
    await prisma.user.deleteMany({ where: { OR: [sender, receiver] } });

    const register = async (student: typeof sender, name: string) => {
      const response = await app.inject({
        method: 'POST', url: '/api/auth/register',
        payload: {
          name, email: student.email, password: 'Password123!',
          department: 'Information Technology', semester: 6, rollNumber: student.rollNumber,
        },
      });
      assert(response.statusCode === 201, `Could not register fixture student: ${response.body}`);
      return JSON.parse(response.body) as { token: string; user: { id: string; email: string } };
    };

    const senderAuth = await register(sender, 'Phase Four Sender');
    const receiverAuth = await register(receiver, 'Phase Four Receiver');
    const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

    const catalogResponse = await app.inject({ method: 'GET', url: '/api/skills' });
    assert(catalogResponse.statusCode === 200, 'Skill catalog is unavailable');
    const skills = JSON.parse(catalogResponse.body).skills as Array<{ id: string; name: string }>;
    const react = skills.find((skill) => skill.name === 'React');
    const python = skills.find((skill) => skill.name === 'Python');
    assert(react && python, 'React and Python must exist in the master catalog');

    const addOffered = async (token: string, skillId: string) => {
      const response = await app.inject({
        method: 'POST', url: '/api/profile/skills/offered', headers: auth(token),
        payload: { skillId, proficiency: 'ADVANCED' },
      });
      assert(response.statusCode === 201, `Could not create offered skill: ${response.body}`);
      return JSON.parse(response.body).offeredSkill.id as string;
    };
    const addWanted = async (token: string, skillId: string) => {
      const response = await app.inject({
        method: 'POST', url: '/api/profile/skills/wanted', headers: auth(token),
        payload: { skillId, priority: 'HIGH' },
      });
      assert(response.statusCode === 201, `Could not create wanted skill: ${response.body}`);
      return JSON.parse(response.body).wantedSkill.id as string;
    };

    const senderReact = await addOffered(senderAuth.token, react.id);
    const senderPython = await addOffered(senderAuth.token, python.id);
    const receiverPython = await addOffered(receiverAuth.token, python.id);
    await addOffered(receiverAuth.token, react.id);
    const senderWantsPython = await addWanted(senderAuth.token, python.id);
    const senderWantsReact = await addWanted(senderAuth.token, react.id);

    console.log('✓ Created two isolated students with matching offered and wanted skills.');

    const createRequest = async (offeredSkillId: string, wantedSkillId: string) => app.inject({
      method: 'POST', url: '/api/exchanges', headers: auth(senderAuth.token),
      payload: { receiverId: receiverAuth.user.id, offeredSkillId, wantedSkillId, message: 'Happy to arrange a study session.' },
    });

    const invalidOwnership = await createRequest(receiverPython, senderWantsPython);
    assert(invalidOwnership.statusCode === 400, 'Sender must not be allowed to offer another student’s skill');
    const created = await createRequest(senderReact, senderWantsPython);
    assert(created.statusCode === 201, `Exchange request creation failed: ${created.body}`);
    const pendingRequest = JSON.parse(created.body).request;
    assert(pendingRequest.status === 'PENDING', 'New exchange request should be pending');
    assert(!('contactEmail' in pendingRequest), 'Pending request must not expose contact details');
    console.log('✓ Sender-owned skills are enforced and a new request is stored as pending without contact details.');

    const incoming = await app.inject({ method: 'GET', url: '/api/exchanges/incoming', headers: auth(receiverAuth.token) });
    const sent = await app.inject({ method: 'GET', url: '/api/exchanges/sent', headers: auth(senderAuth.token) });
    assert(JSON.parse(incoming.body).requests.some((item: any) => item.id === pendingRequest.id), 'Receiver cannot see incoming request');
    assert(JSON.parse(sent.body).requests.some((item: any) => item.id === pendingRequest.id), 'Sender cannot see sent request');
    const wrongParty = await app.inject({
      method: 'PATCH', url: `/api/exchanges/${pendingRequest.id}/status`, headers: auth(senderAuth.token),
      payload: { status: 'ACCEPTED' },
    });
    assert(wrongParty.statusCode === 403, 'Only the recipient should be allowed to accept');
    console.log('✓ Incoming and sent lists are scoped to their participant; unauthorized transitions are blocked.');

    const accepted = await app.inject({
      method: 'PATCH', url: `/api/exchanges/${pendingRequest.id}/status`, headers: auth(receiverAuth.token),
      payload: { status: 'ACCEPTED' },
    });
    assert(accepted.statusCode === 200, `Recipient could not accept request: ${accepted.body}`);
    assert(JSON.parse(accepted.body).request.contactEmail === sender.email, 'Recipient should receive sender contact on acceptance');

    const acceptedSent = await app.inject({ method: 'GET', url: '/api/exchanges/sent', headers: auth(senderAuth.token) });
    const senderView = JSON.parse(acceptedSent.body).requests.find((item: any) => item.id === pendingRequest.id);
    assert(senderView?.status === 'ACCEPTED', 'Sender should see accepted status');
    assert(senderView.contactEmail === receiver.email, 'Sender should receive recipient contact on acceptance');
    console.log('✓ Recipient acceptance updates sender status and unlocks contact email to both participants.');

    const rejectedRequest = await createRequest(senderPython, senderWantsReact);
    assert(rejectedRequest.statusCode === 201, `Could not create second request: ${rejectedRequest.body}`);
    const rejectedId = JSON.parse(rejectedRequest.body).request.id;
    const rejected = await app.inject({
      method: 'PATCH', url: `/api/exchanges/${rejectedId}/status`, headers: auth(receiverAuth.token),
      payload: { status: 'REJECTED' },
    });
    assert(rejected.statusCode === 200 && JSON.parse(rejected.body).request.status === 'REJECTED', 'Recipient could not reject request');

    const canceledRequest = await createRequest(senderPython, senderWantsReact);
    assert(canceledRequest.statusCode === 201, `Could not create cancellable request: ${canceledRequest.body}`);
    const canceledId = JSON.parse(canceledRequest.body).request.id;
    const canceled = await app.inject({
      method: 'PATCH', url: `/api/exchanges/${canceledId}/status`, headers: auth(senderAuth.token),
      payload: { status: 'CANCELED' },
    });
    assert(canceled.statusCode === 200 && JSON.parse(canceled.body).request.status === 'CANCELED', 'Sender could not cancel pending request');

    const invalidTransition = await app.inject({
      method: 'PATCH', url: `/api/exchanges/${canceledId}/status`, headers: auth(receiverAuth.token),
      payload: { status: 'ACCEPTED' },
    });
    assert(invalidTransition.statusCode === 409, 'Terminal request status should not be changeable');
    console.log('✓ Recipient rejection, sender cancellation, and terminal-state protections work.');

    const unauthenticated = await app.inject({ method: 'GET', url: '/api/exchanges/incoming' });
    assert(unauthenticated.statusCode === 401, 'Exchange endpoints must require authentication');
    console.log('✓ Exchange endpoints require authentication.');
    console.log('\n🎉 ALL PHASE 4 VERIFICATION GATES PASSED!');
  } finally {
    await prisma.user.deleteMany({ where: { OR: [sender, receiver] } });
    await app.close();
    await prisma.$disconnect();
  }
}

runPhase4Tests().catch((error) => {
  console.error('\n❌ Phase 4 Verification Failed:', error);
  process.exitCode = 1;
});
