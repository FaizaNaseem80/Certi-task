-- AlterTable
ALTER TABLE "users" ADD COLUMN     "idType" TEXT;

-- CreateTable
CREATE TABLE "certificate_holds" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "talentId" TEXT NOT NULL,
    "teamId" TEXT,
    "submissionId" TEXT,
    "approvedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certificate_holds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_blobs" (
    "key" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_blobs_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "certificate_holds_talentId_idx" ON "certificate_holds"("talentId");

-- CreateIndex
CREATE UNIQUE INDEX "certificate_holds_projectId_talentId_key" ON "certificate_holds"("projectId", "talentId");

-- AddForeignKey
ALTER TABLE "certificate_holds" ADD CONSTRAINT "certificate_holds_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate_holds" ADD CONSTRAINT "certificate_holds_talentId_fkey" FOREIGN KEY ("talentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
