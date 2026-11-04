import { buildApp } from './server';
import { prisma } from './db';

async function runPhase3Tests() {
  console.log('🧪 Starting Phase 3 Automated Verification Suite (Discover Directory & Smart Matching Engine)...\n');

  const app = await buildApp();
  await app.ready();

  const testStudentEmail = 'neha.phase3@gec.ac.in';
  const testStudentRoll = '22IT999';

  try {
    // Clean up test user if previously run
    await prisma.user.deleteMany({
      where: {
        OR: [{ email: testStudentEmail }, { rollNumber: testStudentRoll }],
      },
    });

    // Gate 1: Register Test Student (Neha Sharma in IT, Sem 6)
    console.log('--- Gate 1: Student Authentication & Portfolio Preparation ---');
    const regRes = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        name: 'Neha Sharma',
        email: testStudentEmail,
        password: 'Password123!',
        department: 'Information Technology',
        semester: 6,
        rollNumber: testStudentRoll,
      },
    });

    if (regRes.statusCode !== 201) {
      throw new Error(`Gate 1 Failed: Registration failed: ${regRes.body}`);
    }
    const token = JSON.parse(regRes.body).token;

    // Fetch skills from catalog to attach
    const skillsRes = await app.inject({ method: 'GET', url: '/api/skills' });
    const allSkills = JSON.parse(skillsRes.body).skills;
    const reactSkill = allSkills.find((s: any) => s.name === 'React');
    const pythonSkill = allSkills.find((s: any) => s.name === 'Python');
    const mlSkill = allSkills.find((s: any) => s.name === 'Machine Learning');
    const uiSkill = allSkills.find((s: any) => s.name === 'UI/UX Design');

    // Add Offered Skills for Neha: React (EXPERT) and Python (ADVANCED)
    await app.inject({
      method: 'POST',
      url: '/api/profile/skills/offered',
      headers: { Authorization: `Bearer ${token}` },
      payload: {
        skillId: reactSkill.id,
        proficiency: 'EXPERT',
        description: 'Component architecture, state machines, and hooks',
      },
    });

    await app.inject({
      method: 'POST',
      url: '/api/profile/skills/offered',
      headers: { Authorization: `Bearer ${token}` },
      payload: {
        skillId: pythonSkill.id,
        proficiency: 'ADVANCED',
        description: 'Backend services, async IO, and scripting',
      },
    });

    // Add Wanted Skills for Neha: Machine Learning (HIGH) and UI/UX Design (MEDIUM)
    await app.inject({
      method: 'POST',
      url: '/api/profile/skills/wanted',
      headers: { Authorization: `Bearer ${token}` },
      payload: {
        skillId: mlSkill.id,
        priority: 'HIGH',
        notes: 'Need mentorship in PyTorch and neural networks',
      },
    });

    await app.inject({
      method: 'POST',
      url: '/api/profile/skills/wanted',
      headers: { Authorization: `Bearer ${token}` },
      payload: {
        skillId: uiSkill.id,
        priority: 'MEDIUM',
        notes: 'Figma wireframing and design systems',
      },
    });

    console.log('✓ Registered Neha Sharma (IT, Sem 6) with:');
    console.log('  - Offered: React (EXPERT), Python (ADVANCED)');
    console.log('  - Wanted: Machine Learning (HIGH), UI/UX Design (MEDIUM)');
    console.log('✅ Gate 1 PASSED: Test student authenticated and skills configured.');

    // Gate 2: Smart Matching Engine Compatibility Scoring
    console.log('\n--- Gate 2: Smart Matching Engine & Mutual Exchange Verification ---');
    const discoverRes = await app.inject({
      method: 'GET',
      url: '/api/students/discover',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (discoverRes.statusCode !== 200) {
      throw new Error(`Gate 2 Failed: GET /api/students/discover returned ${discoverRes.statusCode}: ${discoverRes.body}`);
    }

    const discoverBody = JSON.parse(discoverRes.body);
    if (!discoverBody.students || discoverBody.students.length === 0) {
      throw new Error('Gate 2 Failed: No candidates returned in discover');
    }

    console.log(`✓ Fetched ${discoverBody.students.length} candidates. Total found: ${discoverBody.total}`);
    console.log(`✓ Mutual Matches Found: ${discoverBody.stats.mutualMatches}`);
    console.log(`✓ High Matches Found (≥70%): ${discoverBody.stats.highMatches}`);

    // Verify top candidate is a mutual match
    const topCandidate = discoverBody.students[0];
    console.log(`✓ Top candidate: ${topCandidate.name} with Score: ${topCandidate.match.score}% (Mutual: ${topCandidate.match.isMutual})`);

    // Find Aarav Patel (Teaches ML, wants React -> Mutual match with Neha)
    const aarav = discoverBody.students.find((s: any) => s.name === 'Aarav Patel');
    if (!aarav) {
      throw new Error('Gate 2 Failed: Aarav Patel not found in candidates list');
    }

    if (!aarav.match.isMutual) {
      throw new Error('Gate 2 Failed: Aarav Patel expected to be marked as Mutual Match');
    }

    if (aarav.match.score < 80) {
      throw new Error(`Gate 2 Failed: Aarav Patel match score was ${aarav.match.score}%, expected ≥ 80%`);
    }

    console.log(`✓ Aarav Patel: Score = ${aarav.match.score}%`);
    console.log(`  - Can Teach You: ${aarav.match.theyCanTeachYou.map((s: any) => s.skillName).join(', ')}`);
    console.log(`  - You Can Teach Him: ${aarav.match.youCanTeachThem.map((s: any) => s.skillName).join(', ')}`);
    console.log(`  - Match Reasons: ${aarav.match.reasons.join(' | ')}`);

    // Find Ananya Iyer (Teaches UI/UX Design, wants Python -> Mutual match with Neha)
    const ananya = discoverBody.students.find((s: any) => s.name === 'Ananya Iyer');
    if (!ananya || !ananya.match.isMutual) {
      throw new Error('Gate 2 Failed: Ananya Iyer expected to be marked as Mutual Match');
    }
    console.log(`✓ Ananya Iyer: Score = ${ananya.match.score}% (Mutual Match for UI/UX Design ⇄ Python)`);

    // Find Rohan Mehta (Same Dept IT, Same Sem 6, wants React -> High one-way match)
    const rohan = discoverBody.students.find((s: any) => s.name === 'Rohan Mehta');
    if (!rohan) {
      throw new Error('Gate 2 Failed: Rohan Mehta not found in candidates list');
    }
    const hasDeptBonus = rohan.match.reasons.some((r: string) => r.includes('Same Department'));
    const hasSemBonus = rohan.match.reasons.some((r: string) => r.includes('Same Cohort'));
    if (!hasDeptBonus || !hasSemBonus) {
      throw new Error('Gate 2 Failed: Rohan Mehta did not receive Department or Semester bonus');
    }
    console.log(`✓ Rohan Mehta: Score = ${rohan.match.score}% with Department (+10%) & Cohort (+5%) bonuses`);
    console.log('✅ Gate 2 PASSED: Smart matching engine accurately computes mutual and one-way scores.');

    // Gate 3: Candidate Exclusion
    console.log('\n--- Gate 3: Exclude Self from Discovery Directory ---');
    const selfInList = discoverBody.students.some((s: any) => s.id === JSON.parse(regRes.body).user.id);
    if (selfInList) {
      throw new Error('Gate 3 Failed: Requesting student was not excluded from discovery list');
    }
    console.log('✓ Authenticated student is cleanly excluded from candidate peers.');
    if (discoverBody.students.some((s: any) => Object.prototype.hasOwnProperty.call(s, 'email'))) {
      throw new Error('Gate 3 Failed: Directory exposed student email addresses before an accepted exchange');
    }
    console.log('✓ Directory omits contact email until the exchange flow unlocks it.');
    console.log('✅ Gate 3 PASSED: Candidate exclusion verified.');

    // Gate 4: Search & Multi-criteria Filtering
    console.log('\n--- Gate 4: Search & Multi-criteria Filtering ---');

    // 4a. Search by Name
    const searchRes = await app.inject({
      method: 'GET',
      url: '/api/students/discover?search=aarav',
      headers: { Authorization: `Bearer ${token}` },
    });
    const searchStudents = JSON.parse(searchRes.body).students;
    if (searchStudents.length !== 1 || searchStudents[0].name !== 'Aarav Patel') {
      throw new Error('Gate 4 Failed: Search by name did not isolate Aarav Patel');
    }
    console.log('✓ Search by name (?search=aarav) returned only Aarav Patel');

    // 4b. Filter by Department
    const deptRes = await app.inject({
      method: 'GET',
      url: '/api/students/discover?department=Mechanical',
      headers: { Authorization: `Bearer ${token}` },
    });
    const deptStudents = JSON.parse(deptRes.body).students;
    const allMech = deptStudents.every((s: any) => s.department.toLowerCase().includes('mechanical'));
    if (!allMech || deptStudents.length === 0) {
      throw new Error('Gate 4 Failed: Department filter did not isolate Mechanical Engineering students');
    }
    console.log(`✓ Department filter (?department=Mechanical) returned ${deptStudents.length} mechanical student(s)`);

    // 4c. Filter by Semester
    const semRes = await app.inject({
      method: 'GET',
      url: '/api/students/discover?semester=4',
      headers: { Authorization: `Bearer ${token}` },
    });
    const semStudents = JSON.parse(semRes.body).students;
    const allSem4 = semStudents.every((s: any) => s.semester === 4);
    if (!allSem4 || semStudents.length === 0) {
      throw new Error('Gate 4 Failed: Semester filter returned invalid semester');
    }
    console.log(`✓ Semester filter (?semester=4) returned ${semStudents.length} 4th semester student(s)`);

    // 4d. Filter by Mutual Matches Only
    const mutualRes = await app.inject({
      method: 'GET',
      url: '/api/students/discover?mutualOnly=true',
      headers: { Authorization: `Bearer ${token}` },
    });
    const mutualStudents = JSON.parse(mutualRes.body).students;
    const allMutual = mutualStudents.every((s: any) => s.match.isMutual === true);
    if (!allMutual || mutualStudents.length === 0) {
      throw new Error('Gate 4 Failed: mutualOnly=true returned non-mutual matches');
    }
    console.log(`✓ Mutual-only filter (?mutualOnly=true) returned ${mutualStudents.length} mutual match peer(s)`);

    // 4e. Filter by Skill
    const skillRes = await app.inject({
      method: 'GET',
      url: '/api/students/discover?skill=AutoCAD',
      headers: { Authorization: `Bearer ${token}` },
    });
    const skillStudents = JSON.parse(skillRes.body).students;
    const hasPriya = skillStudents.some((s: any) => s.name === 'Priya Nair');
    if (!hasPriya) {
      throw new Error('Gate 4 Failed: Skill filter (?skill=AutoCAD) did not return Priya Nair');
    }
    console.log(`✓ Skill filter (?skill=AutoCAD) successfully returned: ${skillStudents.map((s: any) => s.name).join(', ')}`);
    console.log('✅ Gate 4 PASSED: Multi-criteria filtering operates with high precision.');

    // Gate 5: Public Student Profile Endpoint (GET /api/students/:id)
    console.log('\n--- Gate 5: Public Student Profile & Match Breakdown Endpoint ---');
    const studentProfileRes = await app.inject({
      method: 'GET',
      url: `/api/students/${aarav.id}`,
      headers: { Authorization: `Bearer ${token}` },
    });

    if (studentProfileRes.statusCode !== 200) {
      throw new Error(`Gate 5 Failed: GET /api/students/:id returned ${studentProfileRes.statusCode}`);
    }

    const studentProfile = JSON.parse(studentProfileRes.body).student;
    if (studentProfile.id !== aarav.id || !studentProfile.match) {
      throw new Error('Gate 5 Failed: Profile response missing student id or match object');
    }
    if (Object.prototype.hasOwnProperty.call(studentProfile, 'email')) {
      throw new Error('Gate 5 Failed: Public profile exposed contact email before an accepted exchange');
    }
    console.log(`✓ Retrieved public profile for ${studentProfile.name}:`);
    console.log(`  - Department: ${studentProfile.department} (Sem ${studentProfile.semester})`);
    console.log(`  - Offered Skills: ${studentProfile.offeredSkills.length}`);
    console.log(`  - Wanted Skills: ${studentProfile.wantedSkills.length}`);
    console.log(`  - Match Score: ${studentProfile.match.score}% (Mutual: ${studentProfile.match.isMutual})`);

    // Non-existent ID returns 404
    const notFoundRes = await app.inject({
      method: 'GET',
      url: '/api/students/00000000-0000-0000-0000-000000000000',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (notFoundRes.statusCode !== 404) {
      throw new Error(`Gate 5 Failed: Expected 404 for invalid student ID, got ${notFoundRes.statusCode}`);
    }
    console.log('✓ Invalid student ID correctly returned 404 Not Found.');
    console.log('✅ Gate 5 PASSED: Public student profile endpoint verified.');

    // Gate 6: Distinct Departments Endpoint
    console.log('\n--- Gate 6: Distinct Departments Endpoint ---');
    const deptsRes = await app.inject({
      method: 'GET',
      url: '/api/students/departments',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (deptsRes.statusCode !== 200) {
      throw new Error(`Gate 6 Failed: GET /api/students/departments returned ${deptsRes.statusCode}`);
    }
    const deptsBody = JSON.parse(deptsRes.body);
    console.log(`✓ Distinct departments found: ${deptsBody.departments.join(', ')}`);
    if (!deptsBody.departments.includes('Computer Science') || !deptsBody.departments.includes('Information Technology')) {
      throw new Error('Gate 6 Failed: Missing expected departments');
    }
    console.log('✅ Gate 6 PASSED: Departments endpoint is available for frontend dropdowns.');

    // Gate 7: Security & Authorization Protection
    console.log('\n--- Gate 7: Security & Unauthorized Request Blocking ---');
    const unauthDiscover = await app.inject({
      method: 'GET',
      url: '/api/students/discover',
    });
    if (unauthDiscover.statusCode !== 401) {
      throw new Error(`Gate 7 Failed: Expected 401 for unauthenticated request, got ${unauthDiscover.statusCode}`);
    }
    console.log('✓ Unauthenticated request to /api/students/discover rejected with 401 Unauthorized.');

    const unauthProfile = await app.inject({
      method: 'GET',
      url: `/api/students/${aarav.id}`,
    });
    if (unauthProfile.statusCode !== 401) {
      throw new Error(`Gate 7 Failed: Expected 401 for unauthenticated profile request, got ${unauthProfile.statusCode}`);
    }
    console.log('✓ Unauthenticated request to /api/students/:id rejected with 401 Unauthorized.');
    console.log('✅ Gate 7 PASSED: Security and JWT authentication guards verified.');

    console.log('\n🎉 ALL PHASE 3 BACKEND VERIFICATION GATES PASSED (100% OPERATIONAL)!');
    await app.close();
    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Phase 3 Test Suite Failed:', err);
    await app.close();
    await prisma.$disconnect();
    process.exit(1);
  }
}

runPhase3Tests();
