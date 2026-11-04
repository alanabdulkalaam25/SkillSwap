import { buildApp } from './server';
import { prisma } from './db';

async function runTests() {
  console.log('🧪 Starting Phase 1 Automated Verification Suite...\n');

  const app = await buildApp();
  await app.ready();

  const testEmail = 'arjun.patel@gec.ac.in';
  const testRoll = '21CS042';

  try {
    // Cleanup prior test run
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: testEmail },
          { rollNumber: testRoll },
          { email: 'invalid@gmail.com' }
        ]
      }
    });

    console.log('✓ Cleanup of existing test records completed.');

    // Gate 1: Non-college email blocked
    console.log('\n--- Gate 1: Enforce College Email Domain Restriction ---');
    const invalidEmailRes = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        name: 'John Doe',
        email: 'invalid@gmail.com',
        password: 'password123',
        department: 'Computer Science',
        semester: 4,
        rollNumber: 'ROLL999'
      }
    });
    console.log(`Response Status: ${invalidEmailRes.statusCode}`);
    const invalidEmailBody = JSON.parse(invalidEmailRes.body);
    console.log(`Error Response:`, invalidEmailBody.error);
    if (invalidEmailRes.statusCode !== 400 || invalidEmailBody.success !== false) {
      throw new Error(`Gate 1 Failed: Expected 400 for non-college email, got ${invalidEmailRes.statusCode}`);
    }
    console.log('✅ Gate 1 PASSED: Non-college email domain successfully rejected.');

    // Gate 2: Valid college registration
    console.log('\n--- Gate 2: Register Student with College Email & Roll Number ---');
    const validRegisterRes = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        name: 'Arjun Patel',
        email: testEmail,
        password: 'SecurePassword123!',
        department: 'Computer Science & Engineering',
        semester: 6,
        rollNumber: testRoll
      }
    });
    console.log(`Response Status: ${validRegisterRes.statusCode}`);
    const validRegisterBody = JSON.parse(validRegisterRes.body);
    if (validRegisterRes.statusCode !== 201 || !validRegisterBody.token || !validRegisterBody.user) {
      throw new Error(`Gate 2 Failed: Registration failed with status ${validRegisterRes.statusCode}: ${validRegisterRes.body}`);
    }
    console.log(`Registered User: ${validRegisterBody.user.name} (${validRegisterBody.user.email})`);
    console.log(`JWT Token issued: ${validRegisterBody.token.slice(0, 25)}...`);
    console.log('✅ Gate 2 PASSED: Valid student registration succeeded with JWT.');

    // Gate 3: Duplicate Email Prevention
    console.log('\n--- Gate 3: Duplicate Email Check ---');
    const duplicateEmailRes = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        name: 'Arjun Duplicate',
        email: testEmail,
        password: 'SecurePassword123!',
        department: 'Information Technology',
        semester: 6,
        rollNumber: '21IT099'
      }
    });
    if (duplicateEmailRes.statusCode !== 409) {
      throw new Error(`Gate 3 Failed: Expected 409 for duplicate email, got ${duplicateEmailRes.statusCode}`);
    }
    console.log('✅ Gate 3 PASSED: Duplicate college email rejected with 409 Conflict.');

    // Gate 4: Duplicate Roll Number Prevention
    console.log('\n--- Gate 4: Duplicate Roll Number Check ---');
    const duplicateRollRes = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        name: 'Arjun Duplicate Roll',
        email: 'another.student@gec.ac.in',
        password: 'SecurePassword123!',
        department: 'Information Technology',
        semester: 6,
        rollNumber: testRoll
      }
    });
    if (duplicateRollRes.statusCode !== 409) {
      throw new Error(`Gate 4 Failed: Expected 409 for duplicate roll number, got ${duplicateRollRes.statusCode}`);
    }
    console.log('✅ Gate 4 PASSED: Duplicate roll number rejected with 409 Conflict.');

    // Gate 5: Student Login
    console.log('\n--- Gate 5: Student Login & Token Generation ---');
    const loginRes = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: testEmail,
        password: 'SecurePassword123!'
      }
    });
    console.log(`Response Status: ${loginRes.statusCode}`);
    const loginBody = JSON.parse(loginRes.body);
    if (loginRes.statusCode !== 200 || !loginBody.token || !loginBody.user) {
      throw new Error(`Gate 5 Failed: Login failed with status ${loginRes.statusCode}`);
    }
    const authToken = loginBody.token;
    console.log(`Login succeeded for: ${loginBody.user.name}`);
    console.log('✅ Gate 5 PASSED: Valid credentials login returned new JWT token.');

    // Gate 6: Invalid Password Login
    console.log('\n--- Gate 6: Invalid Password Rejection ---');
    const badLoginRes = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: testEmail,
        password: 'WrongPassword999'
      }
    });
    if (badLoginRes.statusCode !== 401) {
      throw new Error(`Gate 6 Failed: Expected 401 for wrong password, got ${badLoginRes.statusCode}`);
    }
    console.log('✅ Gate 6 PASSED: Bad password rejected with 401 Unauthorized.');

    // Gate 7: Protected Route Without Token
    console.log('\n--- Gate 7: Protected Route Unauthenticated Access ---');
    const unauthRes = await app.inject({
      method: 'GET',
      url: '/api/auth/me'
    });
    if (unauthRes.statusCode !== 401) {
      throw new Error(`Gate 7 Failed: Expected 401 for missing token, got ${unauthRes.statusCode}`);
    }
    console.log('✅ Gate 7 PASSED: Protected route blocked unauthenticated request with 401.');

    // Gate 8: Protected Route Session Hydration (GET /api/auth/me)
    console.log('\n--- Gate 8: Session Persistence via GET /api/auth/me ---');
    const authMeRes = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    console.log(`Response Status: ${authMeRes.statusCode}`);
    const authMeBody = JSON.parse(authMeRes.body);
    if (authMeRes.statusCode !== 200 || authMeBody.user.email !== testEmail || authMeBody.user.rollNumber !== testRoll) {
      throw new Error(`Gate 8 Failed: Session verification failed: ${authMeRes.body}`);
    }
    console.log(`Hydrated Session: ${authMeBody.user.name} | ${authMeBody.user.department} | Sem ${authMeBody.user.semester}`);
    console.log('✅ Gate 8 PASSED: GET /api/auth/me validated token and hydrated user profile.');

    // Gate 9: Gateway Health check
    console.log('\n--- Gate 9: API Gateway Health Check ---');
    const healthRes = await app.inject({
      method: 'GET',
      url: '/api/health'
    });
    if (healthRes.statusCode !== 200) {
      throw new Error(`Gate 9 Failed: Health check returned ${healthRes.statusCode}`);
    }
    console.log('✅ Gate 9 PASSED: Health endpoint is 200 OK.');

    console.log('\n🎉 ALL PHASE 1 VERIFICATION GATES PASSED (100% OPERATIONAL)!');
    await app.close();
    await prisma.$disconnect();
    process.exit(0);
  } finally {
    await app.close();
    await prisma.$disconnect();
  }
}

runTests().catch((err) => {
  console.error('\n❌ Test Suite Failed:', err);
  process.exit(1);
});
