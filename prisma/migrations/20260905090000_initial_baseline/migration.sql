-- Baseline for the pre-Prisma-Migrate CertiTask PostgreSQL schema.
-- This migration is marked applied for the existing database and is used
-- to bootstrap fresh databases without touching existing data.

CREATE SCHEMA IF NOT EXISTS "public";

CREATE TYPE "Role" AS ENUM ('COMPANY', 'STUDENT');

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'COMPANY',
    "isVerified" BOOLEAN NOT NULL DEFAULT true,
    "domain" TEXT,
    "logoUrl" TEXT,
    "bio" TEXT,
    "website" TEXT,
    "phone" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companySize" TEXT,
    "industry" TEXT,
    "foundedYear" INTEGER,
    "companyDescription" TEXT,
    "companyWebsite" TEXT,
    "linkedinUrl" TEXT,
    "cnicNumber" TEXT,
    "cnicVerified" BOOLEAN NOT NULL DEFAULT false,
    "cnicUploadUrl" TEXT,
    "dateOfBirth" TEXT,
    "gender" TEXT,
    "universityName" TEXT,
    "degreeProgram" TEXT,
    "currentSemester" TEXT,
    "gpa" DOUBLE PRECISION,
    "skillsArray" TEXT,
    "portfolioUrl" TEXT,
    "resumeUrl" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requiredSkills" TEXT NOT NULL,
    "deliverables" TEXT NOT NULL,
    "deadline" TEXT NOT NULL,
    "teamCap" INTEGER NOT NULL DEFAULT 20,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "members" TEXT NOT NULL,
    "pitch" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "projectId" TEXT NOT NULL,
    "studentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "submissions" (
    "id" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "submissionUrl" TEXT NOT NULL,
    "notes" TEXT,
    "feedback" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Submitted',
    "projectId" TEXT NOT NULL,
    "studentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "certificates" (
    "id" TEXT NOT NULL,
    "certId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "studentEmail" TEXT NOT NULL,
    "issueDate" TEXT NOT NULL,
    "expiryDate" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Verified',
    "companyId" TEXT NOT NULL,
    "projectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "contact_messages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'contact',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_cnicNumber_key" ON "users"("cnicNumber");
CREATE UNIQUE INDEX "certificates_certId_key" ON "certificates"("certId");

ALTER TABLE "projects" ADD CONSTRAINT "projects_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "applications" ADD CONSTRAINT "applications_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "applications" ADD CONSTRAINT "applications_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
