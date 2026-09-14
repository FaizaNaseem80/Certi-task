const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

function loadEnvFile() {
  const envPath = path.resolve(__dirname, "../.env");
  const localEnvPath = path.resolve(__dirname, "../.env.local");

  [envPath, localEnvPath].forEach((filePath) => {
    if (!fs.existsSync(filePath)) return;

    const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

      const separatorIndex = trimmed.indexOf("=");
      const key = trimmed.slice(0, separatorIndex).trim();
      let value = trimmed.slice(separatorIndex + 1).trim();

      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

loadEnvFile();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: true },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

const defaultPassword = "Password123!";

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function upsertCompany({ email, name, industry, location, companySize, description }) {
  const hashedPassword = await hashPassword(defaultPassword);

  const company = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      role: "COMPANY",
      industry,
      location,
      companySize,
      companyDescription: description,
      isVerified: true,
      password: hashedPassword,
    },
    create: {
      email,
      name,
      password: hashedPassword,
      role: "COMPANY",
      industry,
      location,
      companySize,
      companyDescription: description,
      isVerified: true,
    },
  });

  return company;
}

async function upsertProject(companyId, title, details) {
  const existing = await prisma.project.findFirst({
    where: { companyId, title },
  });

  if (existing) {
    return prisma.project.update({
      where: { id: existing.id },
      data: {
        description: details.description,
        requiredSkills: details.requiredSkills,
        deliverables: details.deliverables,
        deadline: details.deadline,
        teamCap: details.teamCap,
        status: "Active",
      },
    });
  }

  return prisma.project.create({
    data: {
      companyId,
      title,
      description: details.description,
      requiredSkills: details.requiredSkills,
      deliverables: details.deliverables,
      deadline: details.deadline,
      teamCap: details.teamCap,
      status: "Active",
    },
  });
}

async function main() {
  const companySeed = [
    {
      email: "hiring@codecraftlabs.com",
      name: "CodeCraft Labs",
      industry: "Software Development",
      location: "Lahore, Pakistan",
      companySize: "51-200",
      description: "Builds software products and digital experiences for startups and enterprise clients.",
      jobs: [
        {
          title: "Computer Science Intern",
          description: "Work on full-stack product development, debugging, testing, and feature delivery for a customer-facing platform.",
          requiredSkills: "JavaScript, TypeScript, React, Node.js, problem solving, backend APIs",
          deliverables: "Build feature modules, improve code quality, document technical decisions, and ship demos.",
          deadline: "2026-10-15",
          teamCap: 6,
        },
        {
          title: "Marketing Campaign Analyst",
          description: "Support acquisition campaigns, landing pages, user research, and conversion optimization for product launches.",
          requiredSkills: "Digital marketing, analytics, SEO, content strategy, funnel optimization",
          deliverables: "Create campaign plan, analyze metrics, propose loops, and draft weekly performance reports.",
          deadline: "2026-10-20",
          teamCap: 5,
        },
      ],
    },
    {
      email: "careers@northstarhq.com",
      name: "NorthStar HQ",
      industry: "Marketing & Growth",
      location: "Karachi, Pakistan",
      companySize: "201-500",
      description: "A growth-focused team helping brands scale across digital channels and customer experience journeys.",
      jobs: [
        {
          title: "Growth Marketing Intern",
          description: "Assist in campaign planning, paid media analysis, segmented customer outreach, and retention experimentation.",
          requiredSkills: "Marketing automation, CRM, funnel tracking, copywriting, analytics",
          deliverables: "Prepare campaign briefs, report insights, and optimize landing page conversion flows.",
          deadline: "2026-10-18",
          teamCap: 4,
        },
        {
          title: "Product Marketing Associate",
          description: "Translate product value into positioning, launch assets, and go-to-market messaging for new features.",
          requiredSkills: "Brand messaging, market research, presentation skills, product storytelling",
          deliverables: "Build launch messaging, customer personas, and feature adoption plans.",
          deadline: "2026-10-25",
          teamCap: 5,
        },
      ],
    },
    {
      email: "hello@pixelnest.io",
      name: "PixelNest Studio",
      industry: "Design & Product",
      location: "Islamabad, Pakistan",
      companySize: "11-50",
      description: "Design-first digital studio creating user experiences, prototypes, and product systems for startups.",
      jobs: [
        {
          title: "UI/UX Product Designer",
          description: "Create prototypes, user flows, and polished screens for new product experiences across web and mobile clients.",
          requiredSkills: "Figma, UX writing, user research, design systems, wireframing",
          deliverables: "Prepare concept directions, interface prototypes, and usability recommendations.",
          deadline: "2026-10-22",
          teamCap: 3,
        },
        {
          title: "Data Analyst Intern",
          description: "Analyze product and customer metrics to support product decisions, A/B testing, and cohort reporting.",
          requiredSkills: "SQL, Excel, dashboards, statistics, data storytelling",
          deliverables: "Create dashboard summaries, performance insights, and retention trend reports.",
          deadline: "2026-10-28",
          teamCap: 4,
        },
      ],
    },
  ];

  for (const company of companySeed) {
    const createdCompany = await upsertCompany(company);

    for (const job of company.jobs) {
      await upsertProject(createdCompany.id, job.title, job);
    }
  }

  console.log("Seed data inserted successfully for initial company jobs.");
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
