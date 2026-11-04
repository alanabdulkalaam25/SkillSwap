import { buildApp } from './server';
import { prisma } from './db';

async function runPhase2Tests() {
  console.log('🧪 Starting Phase 2 Automated Verification Suite (Profile & Skills Catalog)...\n');

  const app = await buildApp();
  await app.ready();

  const studentAEmail = 'neha.sharma@gec.ac.in';
  const studentARoll = '22IT015';

  const studentBEmail = 'rohit.verma@campus.edu';
  const studentBRoll = '22ME044';

  try {
    // 0. Cleanup any prior test run records
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: studentAEmail },
          { rollNumber: studentARoll },
          { email: studentBEmail },
          { rollNumber: studentBRoll },
        ],
      },
    });

    console.log('✓ Cleanup of existing Phase 2 test records completed.');

    // Gate 1: Master Skills Catalog Verification
    console.log('\n--- Gate 1: Master Skills Catalog Availability & Search ---');
    const skillsRes = await app.inject({
      method: 'GET',
      url: '/api/skills',
    });
    if (skillsRes.statusCode !== 200) {
      throw new Error(`Gate 1 Failed: GET /api/skills returned status ${skillsRes.statusCode}`);
    }
    const skillsBody = JSON.parse(skillsRes.body);
    if (!skillsBody.skills || skillsBody.skills.length < 20) {
      throw new Error(`Gate 1 Failed: Expected at least 20 skills, received ${skillsBody.skills?.length}`);
    }
    console.log(`✓ Fetched ${skillsBody.skills.length} skills from catalog.`);

    // Search filter test
    const searchRes = await app.inject({
      method: 'GET',
      url: '/api/skills?search=react',
    });
    const searchBody = JSON.parse(searchRes.body);
    const hasReact = searchBody.skills.some((s: any) => s.name.toLowerCase().includes('react'));
    if (!hasReact) {
      throw new Error(`Gate 1 Failed: Search for 'react' did not return React skill`);
    }
    console.log(`✓ Search filter (?search=react) found: ${searchBody.skills.map((s: any) => s.name).join(', ')}`);

    // Categories endpoint
    const catRes = await app.inject({
      method: 'GET',
      url: '/api/skills/categories',
    });
    const catBody = JSON.parse(catRes.body);
    if (!catBody.categories || catBody.categories.length === 0) {
      throw new Error('Gate 1 Failed: Categories list is empty');
    }
    console.log(`✓ Categories found: ${catBody.categories.map((c: any) => `${c.name} (${c.count})`).join(', ')}`);
    console.log('✅ Gate 1 PASSED: Master skills catalog is operational and searchable.');

    // Gate 2: Student Registration & Authentication
    console.log('\n--- Gate 2: Student Account Setup & Profile Hydration ---');
    const regRes = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        name: 'Neha Sharma',
        email: studentAEmail,
        password: 'Password123!',
        department: 'Information Technology',
        semester: 4,
        rollNumber: studentARoll,
      },
    });
    if (regRes.statusCode !== 201) {
      throw new Error(`Registration failed: ${regRes.body}`);
    }
    const regBody = JSON.parse(regRes.body);
    const tokenA = regBody.token;

    // Fetch initial profile
    const profileRes = await app.inject({
      method: 'GET',
      url: '/api/profile/me',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    if (profileRes.statusCode !== 200) {
      throw new Error(`Gate 2 Failed: GET /api/profile/me returned ${profileRes.statusCode}`);
    }
    const profileBody = JSON.parse(profileRes.body);
    if (profileBody.profile.email !== studentAEmail) {
      throw new Error(`Gate 2 Failed: Profile email mismatch`);
    }
    console.log(`✓ Retrieved profile for ${profileBody.profile.name} (${profileBody.profile.rollNumber})`);
    console.log('✅ Gate 2 PASSED: Student authenticated and profile retrieved.');

    // Gate 3: Profile Academic & Bio Details Update
    console.log('\n--- Gate 3: Update Profile Bio, Department, and Semester ---');
    const updateBioRes = await app.inject({
      method: 'PUT',
      url: '/api/profile/me',
      headers: { Authorization: `Bearer ${tokenA}` },
      payload: {
        bio: 'Full-stack engineering student passionate about open source and distributed systems. Looking to swap web dev skills for AI/ML.',
        department: 'Information Technology & Data Systems',
        semester: 6,
      },
    });
    if (updateBioRes.statusCode !== 200) {
      throw new Error(`Gate 3 Failed: PUT /api/profile/me returned ${updateBioRes.statusCode}: ${updateBioRes.body}`);
    }
    const updatedBody = JSON.parse(updateBioRes.body);
    if (
      updatedBody.profile.semester !== 6 ||
      !updatedBody.profile.bio.includes('Full-stack engineering') ||
      updatedBody.profile.department !== 'Information Technology & Data Systems'
    ) {
      throw new Error(`Gate 3 Failed: Profile fields were not updated properly`);
    }
    console.log(`✓ Updated Bio: "${updatedBody.profile.bio.slice(0, 50)}..."`);
    console.log(`✓ Updated Academic: ${updatedBody.profile.department} | Sem ${updatedBody.profile.semester}`);
    console.log('✅ Gate 3 PASSED: Student bio and academic information successfully updated.');

    // Gate 4: Add Offered Skills (Skills I Can Teach)
    console.log('\n--- Gate 4: Add Offered Skills with Proficiency ---');
    // Find skill ID for React
    const reactSkill = skillsBody.skills.find((s: any) => s.name === 'React');
    const pythonSkill = skillsBody.skills.find((s: any) => s.name === 'Python');

    const addOffered1 = await app.inject({
      method: 'POST',
      url: '/api/profile/skills/offered',
      headers: { Authorization: `Bearer ${tokenA}` },
      payload: {
        skillId: reactSkill.id,
        proficiency: 'ADVANCED',
        description: 'Built 4 production web apps; can teach React hooks, custom state management and component architecture',
      },
    });
    if (addOffered1.statusCode !== 201) {
      throw new Error(`Gate 4 Failed: Could not add offered skill: ${addOffered1.body}`);
    }
    const offered1Body = JSON.parse(addOffered1.body);
    console.log(`✓ Added Offered Skill: ${offered1Body.offeredSkill.skill.name} (${offered1Body.offeredSkill.proficiency})`);

    // Add second offered skill using name
    const addOffered2 = await app.inject({
      method: 'POST',
      url: '/api/profile/skills/offered',
      headers: { Authorization: `Bearer ${tokenA}` },
      payload: {
        skillId: pythonSkill.id,
        proficiency: 'INTERMEDIATE',
        description: 'Proficient in Python scripting, FastAPI, and data manipulation with Pandas',
      },
    });
    if (addOffered2.statusCode !== 201) {
      throw new Error(`Gate 4 Failed: Could not add second offered skill: ${addOffered2.body}`);
    }

    // Add a custom skill not in initial catalog
    const addOfferedCustom = await app.inject({
      method: 'POST',
      url: '/api/profile/skills/offered',
      headers: { Authorization: `Bearer ${tokenA}` },
      payload: {
        skillName: 'Tailwind CSS',
        category: 'Programming & Web',
        proficiency: 'EXPERT',
        description: 'Advanced responsive design, arbitrary values, and design system configuration',
      },
    });
    if (addOfferedCustom.statusCode !== 201) {
      throw new Error(`Gate 4 Failed: Could not add custom offered skill: ${addOfferedCustom.body}`);
    }
    console.log(`✓ Added Custom Offered Skill: Tailwind CSS (EXPERT)`);

    // Test duplicate offered skill update (upsert)
    const updateOfferedRes = await app.inject({
      method: 'POST',
      url: '/api/profile/skills/offered',
      headers: { Authorization: `Bearer ${tokenA}` },
      payload: {
        skillId: reactSkill.id,
        proficiency: 'EXPERT',
        description: 'Upgraded to Expert: React 19 concurrent features and architecture',
      },
    });
    if (updateOfferedRes.statusCode !== 200) {
      throw new Error(`Gate 4 Failed: Duplicate update failed: ${updateOfferedRes.body}`);
    }
    const updatedOfferedBody = JSON.parse(updateOfferedRes.body);
    if (updatedOfferedBody.offeredSkill.proficiency !== 'EXPERT') {
      throw new Error(`Gate 4 Failed: Expected proficiency EXPERT, got ${updatedOfferedBody.offeredSkill.proficiency}`);
    }
    console.log(`✓ Updated existing offered skill proficiency to EXPERT`);
    console.log('✅ Gate 4 PASSED: Student can add offered skills and update proficiencies.');

    // Gate 5: Add Wanted Skills (Skills I Want to Learn)
    console.log('\n--- Gate 5: Add Wanted Skills with Priority ---');
    const mlSkill = skillsBody.skills.find((s: any) => s.name === 'Machine Learning');
    const uiSkill = skillsBody.skills.find((s: any) => s.name === 'UI/UX Design');

    const addWanted1 = await app.inject({
      method: 'POST',
      url: '/api/profile/skills/wanted',
      headers: { Authorization: `Bearer ${tokenA}` },
      payload: {
        skillId: mlSkill.id,
        priority: 'HIGH',
        notes: 'Need mentorship for college minor project using deep learning and PyTorch',
      },
    });
    if (addWanted1.statusCode !== 201) {
      throw new Error(`Gate 5 Failed: Could not add wanted skill: ${addWanted1.body}`);
    }
    const wanted1Body = JSON.parse(addWanted1.body);
    console.log(`✓ Added Wanted Skill: ${wanted1Body.wantedSkill.skill.name} (Priority: ${wanted1Body.wantedSkill.priority})`);

    const addWanted2 = await app.inject({
      method: 'POST',
      url: '/api/profile/skills/wanted',
      headers: { Authorization: `Bearer ${tokenA}` },
      payload: {
        skillId: uiSkill.id,
        priority: 'MEDIUM',
        notes: 'Want to learn Figma prototyping and modern design principles',
      },
    });
    if (addWanted2.statusCode !== 201) {
      throw new Error(`Gate 5 Failed: Could not add second wanted skill: ${addWanted2.body}`);
    }
    console.log(`✓ Added Wanted Skill: UI/UX Design (Priority: MEDIUM)`);
    console.log('✅ Gate 5 PASSED: Student can add wanted skills with priorities.');

    // Gate 6: Complete Profile Hydration & Skill Count
    console.log('\n--- Gate 6: Hydrated Profile with Full Skill Relations ---');
    const fullProfileRes = await app.inject({
      method: 'GET',
      url: '/api/profile/me',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const fullProfile = JSON.parse(fullProfileRes.body).profile;
    console.log(`✓ Total Offered Skills: ${fullProfile.offeredSkills.length}`);
    console.log(`✓ Total Wanted Skills: ${fullProfile.wantedSkills.length}`);
    if (fullProfile.offeredSkills.length !== 3 || fullProfile.wantedSkills.length !== 2) {
      throw new Error(`Gate 6 Failed: Expected 3 offered and 2 wanted skills`);
    }
    console.log('✅ Gate 6 PASSED: Profile response accurately aggregates all skills.');

    // Gate 7: Skill Deletion & Authorization Protection
    console.log('\n--- Gate 7: Delete Skill and Verify Permissions ---');
    // Register Student B
    const regBRes = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        name: 'Rohit Verma',
        email: studentBEmail,
        password: 'Password123!',
        department: 'Mechanical Engineering',
        semester: 4,
        rollNumber: studentBRoll,
      },
    });
    const tokenB = JSON.parse(regBRes.body).token;

    // Student B tries to delete Student A's offered skill
    const skillToDelete = fullProfile.offeredSkills[0];
    const unauthorizedDelete = await app.inject({
      method: 'DELETE',
      url: `/api/profile/skills/offered/${skillToDelete.id}`,
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    if (unauthorizedDelete.statusCode !== 403) {
      throw new Error(`Gate 7 Failed: Expected 403 Forbidden when another student deletes skill, got ${unauthorizedDelete.statusCode}`);
    }
    console.log('✓ Unauthorized deletion attempt blocked with 403 Forbidden.');

    // Student A deletes her own skill
    const authorizedDelete = await app.inject({
      method: 'DELETE',
      url: `/api/profile/skills/offered/${skillToDelete.id}`,
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    if (authorizedDelete.statusCode !== 200) {
      throw new Error(`Gate 7 Failed: Legitimate deletion failed with ${authorizedDelete.statusCode}`);
    }
    console.log(`✓ Successfully deleted offered skill (${skillToDelete.skill.name}).`);

    // Verify deletion persists
    const verifyDeleteRes = await app.inject({
      method: 'GET',
      url: '/api/profile/me',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const verifyBody = JSON.parse(verifyDeleteRes.body).profile;
    if (verifyBody.offeredSkills.some((s: any) => s.id === skillToDelete.id)) {
      throw new Error('Gate 7 Failed: Deleted skill is still present in profile');
    }
    console.log('✅ Gate 7 PASSED: Skill deletion works and is guarded against unauthorized access.');

    // Gate 8: Database Direct Verification
    console.log('\n--- Gate 8: PostgreSQL Direct Database Verification ---');
    const dbUser = await prisma.user.findUnique({
      where: { email: studentAEmail },
      include: {
        offeredSkills: { include: { skill: true } },
        wantedSkills: { include: { skill: true } },
      },
    });
    if (!dbUser || dbUser.offeredSkills.length !== 2 || dbUser.wantedSkills.length !== 2) {
      throw new Error('Gate 8 Failed: Direct PostgreSQL query does not match expected state');
    }
    console.log(`✓ Direct DB Query verified for ${dbUser.name}:`);
    console.log(`  - Database Bio: "${dbUser.bio}"`);
    console.log(`  - Database Offered: ${dbUser.offeredSkills.map((s) => s.skill.name).join(', ')}`);
    console.log(`  - Database Wanted: ${dbUser.wantedSkills.map((s) => s.skill.name).join(', ')}`);
    console.log('✅ Gate 8 PASSED: PostgreSQL database transactions verified with 100% integrity.');

    console.log('\n🎉 ALL PHASE 2 BACKEND VERIFICATION GATES PASSED (100% OPERATIONAL)!');
    await app.close();
    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Phase 2 Test Suite Failed:', err);
    await app.close();
    await prisma.$disconnect();
    process.exit(1);
  }
}

runPhase2Tests();
