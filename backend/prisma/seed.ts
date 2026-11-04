import { PrismaClient, ProficiencyLevel, PriorityLevel } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const INITIAL_SKILLS = [
  // Programming & Web
  { name: 'JavaScript', category: 'Programming & Web', description: 'Core web scripting and asynchronous programming' },
  { name: 'TypeScript', category: 'Programming & Web', description: 'Static typing and robust enterprise web development' },
  { name: 'Python', category: 'Programming & Web', description: 'General purpose scripting, backend, and data manipulation' },
  { name: 'React', category: 'Programming & Web', description: 'Component-based UI architecture, hooks, and state management' },
  { name: 'Node.js', category: 'Programming & Web', description: 'Server-side runtime, REST APIs, and microservices' },
  { name: 'Next.js', category: 'Programming & Web', description: 'Full-stack React framework with SSR and App Router' },
  { name: 'C++', category: 'Programming & Web', description: 'Systems programming, memory management, and OOP fundamentals' },
  { name: 'Java', category: 'Programming & Web', description: 'Object-oriented application building, Spring, and enterprise code' },
  { name: 'Django', category: 'Programming & Web', description: 'Python full-stack web framework with ORM and security built-in' },
  { name: 'Flutter', category: 'Programming & Web', description: 'Cross-platform mobile development using Dart' },
  { name: 'Go (Golang)', category: 'Programming & Web', description: 'High-concurrency backend services and tooling' },
  { name: 'Rust', category: 'Programming & Web', description: 'Memory-safe systems programming and high performance' },

  // Data & AI
  { name: 'Machine Learning', category: 'Data & AI', description: 'Supervised, unsupervised models and Scikit-Learn' },
  { name: 'Deep Learning', category: 'Data & AI', description: 'Neural networks, PyTorch, and TensorFlow architectures' },
  { name: 'Data Structures & Algorithms', category: 'Data & AI', description: 'Problem solving, leetcode, trees, graphs, and dynamic programming' },
  { name: 'Computer Vision', category: 'Data & AI', description: 'OpenCV, image processing, object detection, and CNNs' },
  { name: 'Natural Language Processing', category: 'Data & AI', description: 'Text processing, LLMs, embeddings, and tokenization' },
  { name: 'SQL & Database Design', category: 'Data & AI', description: 'Relational querying, schema indexing, and optimization' },

  // UI/UX & Design
  { name: 'UI/UX Design', category: 'Design & Creative', description: 'User flow wireframing, usability heuristics, and interface architecture' },
  { name: 'Figma', category: 'Design & Creative', description: 'Auto-layout, design systems, interactive prototyping, and handoff' },
  { name: 'Graphic Design', category: 'Design & Creative', description: 'Visual branding, typography, posters, and Adobe Illustrator' },
  { name: 'Video Editing', category: 'Design & Creative', description: 'Premiere Pro / DaVinci Resolve color grading and timeline storytelling' },
  { name: '3D Modeling & Blender', category: 'Design & Creative', description: 'Polygon modeling, materials, lighting, and animation' },

  // Engineering & Hardware
  { name: 'Arduino & Embedded C', category: 'Core Engineering', description: 'Microcontroller programming, sensors, and circuit breadboarding' },
  { name: 'Internet of Things (IoT)', category: 'Core Engineering', description: 'ESP32, MQTT communication, cloud telemetry, and sensor arrays' },
  { name: 'MATLAB & Simulink', category: 'Core Engineering', description: 'Matrix computation, mathematical modeling, and signal processing' },
  { name: 'AutoCAD', category: 'Core Engineering', description: '2D & 3D computer-aided engineering drafting' },
  { name: 'Robotics & ROS', category: 'Core Engineering', description: 'Robot Operating System, kinematics, and actuator control' },

  // DevOps & Tools
  { name: 'Git & GitHub', category: 'DevOps & Tools', description: 'Version control, branching strategies, and open-source workflows' },
  { name: 'Docker & Containers', category: 'DevOps & Tools', description: 'Containerizing applications, Docker Compose, and environment parity' },
  { name: 'Linux / Bash Scripting', category: 'DevOps & Tools', description: 'Shell automation, terminal administration, and server management' },

  // Professional & Academics
  { name: 'Technical Writing & Documentation', category: 'Professional & Academics', description: 'Clear API documentation, research papers, and technical blogs' },
  { name: 'Public Speaking & Presentations', category: 'Professional & Academics', description: 'Slide deck design, speech delivery, and project viva pitching' },
  { name: 'Resume & Interview Prep', category: 'Professional & Academics', description: 'Portfolio reviews, mock interviews, and tech resume tailoring' }
];

export const MOCK_STUDENTS = [
  {
    name: 'Aarav Patel',
    email: 'aarav.patel@gec.ac.in',
    password: 'Password123!',
    department: 'Computer Science',
    semester: 6,
    rollNumber: '22CS008',
    bio: 'AI & ML enthusiast. Working on PyTorch, computer vision, and neural style transfer. Looking to learn React to build clean frontends for my models.',
    offered: [
      { name: 'Machine Learning', proficiency: 'EXPERT' as ProficiencyLevel, description: 'Built CNN and vision models; can teach feature engineering and model training' },
      { name: 'Deep Learning', proficiency: 'ADVANCED' as ProficiencyLevel, description: 'PyTorch, Transformers, neural network math' },
      { name: 'Python', proficiency: 'EXPERT' as ProficiencyLevel, description: 'Advanced Python, NumPy, Pandas, Scikit-Learn' },
    ],
    wanted: [
      { name: 'React', priority: 'HIGH' as PriorityLevel, notes: 'Want to build modern React dashboards for my AI pipelines' },
      { name: 'Next.js', priority: 'MEDIUM' as PriorityLevel, notes: 'SSR and full-stack React' },
    ],
  },
  {
    name: 'Ananya Iyer',
    email: 'ananya.iyer@college.edu',
    password: 'Password123!',
    department: 'Design & Media Systems',
    semester: 4,
    rollNumber: '23DS019',
    bio: 'UI/UX Designer who loves crafting accessible, delightful user journeys in Figma. Want to learn Python & Data Science to understand user analytics.',
    offered: [
      { name: 'UI/UX Design', proficiency: 'EXPERT' as ProficiencyLevel, description: 'Wireframing, UX heuristics, user research & usability testing' },
      { name: 'Figma', proficiency: 'EXPERT' as ProficiencyLevel, description: 'Component variants, auto-layout, interactive prototypes, design systems' },
      { name: 'Graphic Design', proficiency: 'ADVANCED' as ProficiencyLevel, description: 'Typography, visual hierarchy, branding' },
    ],
    wanted: [
      { name: 'Python', priority: 'HIGH' as PriorityLevel, notes: 'Want to learn Python for data analysis and automating design metrics' },
      { name: 'React', priority: 'MEDIUM' as PriorityLevel, notes: 'Want to bridge the gap between design and frontend code' },
    ],
  },
  {
    name: 'Rohan Mehta',
    email: 'rohan.mehta@gec.ac.in',
    password: 'Password123!',
    department: 'Information Technology',
    semester: 6,
    rollNumber: '22IT042',
    bio: 'Competitive programmer and backend developer. 500+ LeetCode solved. Happy to teach DSA & C++ in exchange for Web & Cloud skills.',
    offered: [
      { name: 'Data Structures & Algorithms', proficiency: 'EXPERT' as ProficiencyLevel, description: 'Graph algorithms, DP, tree problems, interview patterns' },
      { name: 'C++', proficiency: 'ADVANCED' as ProficiencyLevel, description: 'Modern C++20, STL, memory optimization' },
      { name: 'SQL & Database Design', proficiency: 'ADVANCED' as ProficiencyLevel, description: 'Schema normalization, indexing, query execution plans' },
    ],
    wanted: [
      { name: 'React', priority: 'HIGH' as PriorityLevel, notes: 'Need to build UI for my final year capstone project' },
      { name: 'Docker & Containers', priority: 'MEDIUM' as PriorityLevel, notes: 'Containerization and microservice deployment' },
    ],
  },
  {
    name: 'Priya Nair',
    email: 'priya.nair@gec.ac.in',
    password: 'Password123!',
    department: 'Mechanical Engineering',
    semester: 4,
    rollNumber: '23ME011',
    bio: 'Mechanical engineering student building autonomous rovers. Experienced with AutoCAD and ROS. Looking for Embedded C and IoT mentors.',
    offered: [
      { name: 'AutoCAD', proficiency: 'EXPERT' as ProficiencyLevel, description: '2D precision drafting and 3D mechanical modeling' },
      { name: 'Robotics & ROS', proficiency: 'INTERMEDIATE' as ProficiencyLevel, description: 'ROS2 nodes, kinematics, navigation stack' },
    ],
    wanted: [
      { name: 'Arduino & Embedded C', priority: 'HIGH' as PriorityLevel, notes: 'Need microcontrollers to interface sensors with rover chassis' },
      { name: 'Internet of Things (IoT)', priority: 'MEDIUM' as PriorityLevel, notes: 'Telemetry sending over MQTT' },
    ],
  },
  {
    name: 'Vikram Singh',
    email: 'vikram.singh@campus.edu',
    password: 'Password123!',
    department: 'Electrical & Electronics',
    semester: 5,
    rollNumber: '22EE028',
    bio: 'Hardware hacker, circuit designer, and IoT enthusiast. Love building smart hardware. Looking for C++ systems programming guidance.',
    offered: [
      { name: 'Arduino & Embedded C', proficiency: 'EXPERT' as ProficiencyLevel, description: 'STM32, AVR, hardware registers, interrupt-driven programming' },
      { name: 'Internet of Things (IoT)', proficiency: 'ADVANCED' as ProficiencyLevel, description: 'ESP32, MQTT, BLE beacons, Home Assistant integration' },
    ],
    wanted: [
      { name: 'C++', priority: 'HIGH' as PriorityLevel, notes: 'Want to write modern C++ for high performance embedded systems' },
      { name: 'Data Structures & Algorithms', priority: 'MEDIUM' as PriorityLevel, notes: 'Preparing for campus placements' },
    ],
  },
  {
    name: 'Dev Kapoor',
    email: 'dev.kapoor@college.edu',
    password: 'Password123!',
    department: 'Computer Science',
    semester: 6,
    rollNumber: '22CS087',
    bio: 'DevOps and cloud infrastructure geek. Love Docker, Linux terminals, and CI/CD pipelines. Looking to learn Flutter for mobile apps.',
    offered: [
      { name: 'Docker & Containers', proficiency: 'EXPERT' as ProficiencyLevel, description: 'Multi-stage builds, container security, compose orchestrations' },
      { name: 'Linux / Bash Scripting', proficiency: 'EXPERT' as ProficiencyLevel, description: 'Systemd services, shell pipelines, automation' },
      { name: 'Git & GitHub', proficiency: 'ADVANCED' as ProficiencyLevel, description: 'Git rebase, trunk-based development, GitHub Actions CI/CD' },
    ],
    wanted: [
      { name: 'Flutter', priority: 'HIGH' as PriorityLevel, notes: 'Building a cross-platform mobile client for home cloud' },
      { name: 'UI/UX Design', priority: 'MEDIUM' as PriorityLevel, notes: 'Mobile interface heuristics' },
    ],
  },
];

async function main() {
  console.log('🌱 Starting SkillSwap Master Skills Catalog Seeding...');

  let createdSkillCount = 0;
  for (const skill of INITIAL_SKILLS) {
    const existing = await prisma.skill.findUnique({
      where: { name: skill.name },
    });

    if (!existing) {
      await prisma.skill.create({
        data: skill,
      });
      createdSkillCount++;
    }
  }

  const totalSkills = await prisma.skill.count();
  console.log(`✅ Seeded ${createdSkillCount} new skills. Total skills in catalog: ${totalSkills}`);

  console.log('\n👥 Seeding Mock Campus Students for Discovery & Matching Engine...');
  const salt = await bcrypt.genSalt(10);
  const defaultHashedPassword = await bcrypt.hash('Password123!', salt);

  for (const studentData of MOCK_STUDENTS) {
    // Upsert User
    const user = await prisma.user.upsert({
      where: { email: studentData.email },
      update: {
        name: studentData.name,
        department: studentData.department,
        semester: studentData.semester,
        rollNumber: studentData.rollNumber,
        bio: studentData.bio,
      },
      create: {
        name: studentData.name,
        email: studentData.email,
        password: defaultHashedPassword,
        department: studentData.department,
        semester: studentData.semester,
        rollNumber: studentData.rollNumber,
        bio: studentData.bio,
      },
    });

    // Populate offered skills
    for (const item of studentData.offered) {
      const skill = await prisma.skill.findUnique({ where: { name: item.name } });
      if (skill) {
        await prisma.offeredSkill.upsert({
          where: {
            userId_skillId: {
              userId: user.id,
              skillId: skill.id,
            },
          },
          update: {
            proficiency: item.proficiency,
            description: item.description,
          },
          create: {
            userId: user.id,
            skillId: skill.id,
            proficiency: item.proficiency,
            description: item.description,
          },
        });
      }
    }

    // Populate wanted skills
    for (const item of studentData.wanted) {
      const skill = await prisma.skill.findUnique({ where: { name: item.name } });
      if (skill) {
        await prisma.wantedSkill.upsert({
          where: {
            userId_skillId: {
              userId: user.id,
              skillId: skill.id,
            },
          },
          update: {
            priority: item.priority,
            notes: item.notes,
          },
          create: {
            userId: user.id,
            skillId: skill.id,
            priority: item.priority,
            notes: item.notes,
          },
        });
      }
    }
    console.log(`✓ Seeded student profile: ${user.name} (${user.department}, Sem ${user.semester})`);
  }

  const totalUsers = await prisma.user.count();
  console.log(`\n🎉 Seeding Complete! Total Users in Database: ${totalUsers}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
