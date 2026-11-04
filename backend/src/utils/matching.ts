import { ProficiencyLevel, PriorityLevel } from '@prisma/client';

export interface SkillItem {
  id: string;
  name: string;
  category: string;
}

export interface UserOfferedSkill {
  id?: string;
  skillId: string;
  proficiency: ProficiencyLevel;
  description?: string | null;
  skill: SkillItem;
}

export interface UserWantedSkill {
  id?: string;
  skillId: string;
  priority: PriorityLevel;
  notes?: string | null;
  skill: SkillItem;
}

export interface MatchingUser {
  id: string;
  name: string;
  department: string;
  semester: number;
  offeredSkills: UserOfferedSkill[];
  wantedSkills: UserWantedSkill[];
}

export interface MatchedSkill {
  skillId: string;
  skillName: string;
  category: string;
  theirProficiency?: ProficiencyLevel;
  yourPriority?: PriorityLevel;
  yourProficiency?: ProficiencyLevel;
  theirPriority?: PriorityLevel;
  description?: string | null;
  notes?: string | null;
}

export interface MatchScoreResult {
  score: number;
  isMutual: boolean;
  theyCanTeachYou: MatchedSkill[];
  youCanTeachThem: MatchedSkill[];
  commonInterests: Array<{ skillId: string; skillName: string; category: string }>;
  reasons: string[];
}

/**
 * Computes mutual and directional skill compatibility between current authenticated user
 * and a peer student candidate.
 */
export function calculateMatchScore(
  currentUser: MatchingUser,
  candidate: MatchingUser
): MatchScoreResult {
  // If comparing user to themselves, compatibility is not applicable
  if (currentUser.id === candidate.id) {
    return {
      score: 0,
      isMutual: false,
      theyCanTeachYou: [],
      youCanTeachThem: [],
      commonInterests: [],
      reasons: ['Self comparison'],
    };
  }

  // 1. Identify skills Candidate can teach Current User
  // (Candidate offers what Current User wants)
  const theyCanTeachYou: MatchedSkill[] = [];
  for (const candidateOffered of candidate.offeredSkills) {
    const userWanted = currentUser.wantedSkills.find(
      (w) =>
        w.skillId === candidateOffered.skillId ||
        w.skill.name.toLowerCase() === candidateOffered.skill.name.toLowerCase()
    );

    if (userWanted) {
      theyCanTeachYou.push({
        skillId: candidateOffered.skillId,
        skillName: candidateOffered.skill.name,
        category: candidateOffered.skill.category,
        theirProficiency: candidateOffered.proficiency,
        yourPriority: userWanted.priority,
        description: candidateOffered.description,
        notes: userWanted.notes,
      });
    }
  }

  // 2. Identify skills Current User can teach Candidate
  // (Current User offers what Candidate wants)
  const youCanTeachThem: MatchedSkill[] = [];
  for (const userOffered of currentUser.offeredSkills) {
    const candidateWanted = candidate.wantedSkills.find(
      (w) =>
        w.skillId === userOffered.skillId ||
        w.skill.name.toLowerCase() === userOffered.skill.name.toLowerCase()
    );

    if (candidateWanted) {
      youCanTeachThem.push({
        skillId: userOffered.skillId,
        skillName: userOffered.skill.name,
        category: userOffered.skill.category,
        yourProficiency: userOffered.proficiency,
        theirPriority: candidateWanted.priority,
        description: userOffered.description,
        notes: candidateWanted.notes,
      });
    }
  }

  // 3. Identify common learning interests (Study Buddy synergy)
  const commonInterests: Array<{ skillId: string; skillName: string; category: string }> = [];
  for (const userWanted of currentUser.wantedSkills) {
    const candidateWanted = candidate.wantedSkills.find(
      (w) =>
        w.skillId === userWanted.skillId ||
        w.skill.name.toLowerCase() === userWanted.skill.name.toLowerCase()
    );
    if (candidateWanted) {
      commonInterests.push({
        skillId: userWanted.skillId,
        skillName: userWanted.skill.name,
        category: userWanted.skill.category,
      });
    }
  }

  const isMutual = theyCanTeachYou.length > 0 && youCanTeachThem.length > 0;
  const hasOneWay = theyCanTeachYou.length > 0 || youCanTeachThem.length > 0;
  const reasons: string[] = [];

  let rawScore = 0;

  // --- Skill Matching Weights ---
  if (isMutual) {
    // 1. Base Mutual Exchange Guarantee: +50%
    rawScore += 50;
    reasons.push(
      `Mutual Exchange Opportunity (+50%): ${theyCanTeachYou.map((s) => s.skillName).join(', ')} ⇄ ${youCanTeachThem.map((s) => s.skillName).join(', ')}`
    );

    // 2. Incoming Skill Value (What candidate teaches you): Base +15%
    rawScore += 15;
    const hasHighPriority = theyCanTeachYou.some((s) => s.yourPriority === 'HIGH');
    const hasExpertOrAdv = theyCanTeachYou.some(
      (s) => s.theirProficiency === 'EXPERT' || s.theirProficiency === 'ADVANCED'
    );

    if (hasHighPriority) {
      rawScore += 5;
      reasons.push('Teaches a skill you marked as High Priority (+5%)');
    }
    if (hasExpertOrAdv) {
      rawScore += 5;
      reasons.push('Candidate holds Advanced or Expert proficiency (+5%)');
    }

    // 3. Outgoing Skill Value (What you teach candidate): Base +10%
    rawScore += 10;
    const candidateHasHighPriority = youCanTeachThem.some((s) => s.theirPriority === 'HIGH');
    if (candidateHasHighPriority) {
      rawScore += 5;
      reasons.push('You offer a skill candidate marked as High Priority (+5%)');
    }

    // 4. Multi-skill mutual bonus
    const mutualPairsCount = Math.min(theyCanTeachYou.length, youCanTeachThem.length);
    if (mutualPairsCount > 1) {
      const extraPairsBonus = Math.min(10, (mutualPairsCount - 1) * 5);
      rawScore += extraPairsBonus;
      reasons.push(`Multiple skill exchange matches (+${extraPairsBonus}%)`);
    }
  } else if (theyCanTeachYou.length > 0) {
    // Candidate can mentor current user: Base +25%
    rawScore += 25;
    reasons.push(`Peer can teach you (+25%): ${theyCanTeachYou.map((s) => s.skillName).join(', ')}`);

    const hasHighPriority = theyCanTeachYou.some((s) => s.yourPriority === 'HIGH');
    if (hasHighPriority) {
      rawScore += 5;
      reasons.push('Matches high priority learning target (+5%)');
    }

    const hasExpert = theyCanTeachYou.some((s) => s.theirProficiency === 'EXPERT');
    if (hasExpert) {
      rawScore += 5;
      reasons.push('Peer has Expert proficiency (+5%)');
    }

    if (theyCanTeachYou.length > 1) {
      const extraBonus = Math.min(10, (theyCanTeachYou.length - 1) * 5);
      rawScore += extraBonus;
      reasons.push(`Teaches ${theyCanTeachYou.length} skills you want (+${extraBonus}%)`);
    }
  } else if (youCanTeachThem.length > 0) {
    // Current user can mentor candidate: Base +25%
    rawScore += 25;
    reasons.push(`You can teach this peer (+25%): ${youCanTeachThem.map((s) => s.skillName).join(', ')}`);

    const candidateHasHighPriority = youCanTeachThem.some((s) => s.theirPriority === 'HIGH');
    if (candidateHasHighPriority) {
      rawScore += 5;
      reasons.push('Candidate strongly seeks your skill (+5%)');
    }

    if (youCanTeachThem.length > 1) {
      const extraBonus = Math.min(10, (youCanTeachThem.length - 1) * 5);
      rawScore += extraBonus;
      reasons.push(`Peer wants ${youCanTeachThem.length} skills you teach (+${extraBonus}%)`);
    }
  }

  // --- Department Affinity Bonus (+10%) ---
  const isSameDept =
    currentUser.department &&
    candidate.department &&
    currentUser.department.trim().toLowerCase() === candidate.department.trim().toLowerCase();

  if (isSameDept) {
    rawScore += 10;
    reasons.push(`Same Department affinity (+10%): ${candidate.department}`);
  }

  // --- Semester Proximity Bonus (+5% or +3%) ---
  if (currentUser.semester && candidate.semester) {
    const semDiff = Math.abs(currentUser.semester - candidate.semester);
    if (semDiff === 0) {
      rawScore += 5;
      reasons.push(`Same Cohort / Semester ${candidate.semester} (+5%)`);
    } else if (semDiff === 1) {
      rawScore += 3;
      reasons.push(`Adjacent Semester peer (Sem ${candidate.semester}) (+3%)`);
    }
  }

  // --- Study Buddy Bonus (Shared Learning Goals) ---
  if (commonInterests.length > 0 && !isMutual) {
    const buddyBonus = Math.min(8, commonInterests.length * 4);
    rawScore += buddyBonus;
    reasons.push(
      `Study Buddy: Both want to learn ${commonInterests.map((s) => s.skillName).join(', ')} (+${buddyBonus}%)`
    );
  }

  // If there is zero skill overlap, cap the maximum academic bonus at 15%
  // so someone with no skill match can never appear as a high skill-exchange match.
  let finalScore = rawScore;
  if (!hasOneWay) {
    finalScore = Math.min(15, rawScore);
    if (finalScore === 0) {
      reasons.push('No mutual skill match or academic affinity detected');
    }
  }

  // Final Clamping to [0, 100]
  finalScore = Math.min(100, Math.max(0, Math.round(finalScore)));

  return {
    score: finalScore,
    isMutual,
    theyCanTeachYou,
    youCanTeachThem,
    commonInterests,
    reasons,
  };
}
