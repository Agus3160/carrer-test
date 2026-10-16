-- CreateEnum
CREATE TYPE "QuestionKind" AS ENUM ('INTEREST', 'SUBJECT', 'STRENGTH', 'WORK_STYLE');

-- CreateEnum
CREATE TYPE "KnowledgeConceptType" AS ENUM ('SUBJECT', 'INTEREST', 'SKILL', 'WORK_ACTIVITY', 'WORK_STYLE', 'WORK_CONTEXT', 'WORK_FIELD');

-- CreateEnum
CREATE TYPE "KnowledgeReviewStatus" AS ENUM ('PRELIMINARY', 'REVIEWED');

-- AlterTable
ALTER TABLE "Assessment" ADD COLUMN     "questionnaireVersion" TEXT NOT NULL DEFAULT 'vocacional-v1',
ADD COLUMN     "recommendationVersion" TEXT NOT NULL DEFAULT 'kb-v1';

-- AlterTable
ALTER TABLE "Candidate" ALTER COLUMN "ci" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "kind" "QuestionKind" NOT NULL DEFAULT 'INTEREST',
ADD COLUMN     "seedKey" TEXT;

-- AlterTable
ALTER TABLE "QuestionOption" ADD COLUMN     "code" TEXT,
ADD COLUMN     "conceptCodes" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Result" ADD COLUMN     "coverage" DOUBLE PRECISION,
ADD COLUMN     "evidence" JSONB,
ADD COLUMN     "gaps" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "matchedConceptCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "rank" INTEGER,
ADD COLUMN     "recommendationVersion" TEXT NOT NULL DEFAULT 'kb-v1',
ALTER COLUMN "score" DROP NOT NULL;

-- CreateTable
CREATE TABLE "KnowledgeConcept" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "KnowledgeConceptType" NOT NULL,
    "description" TEXT,
    "sourceName" TEXT,
    "sourceUrl" TEXT,
    "sourceVersion" TEXT,
    "status" "KnowledgeReviewStatus" NOT NULL DEFAULT 'PRELIMINARY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeConcept_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerKnowledgeLink" (
    "id" SERIAL NOT NULL,
    "careerId" INTEGER NOT NULL,
    "conceptId" INTEGER NOT NULL,
    "relevance" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "rationale" TEXT NOT NULL,
    "sourceName" TEXT,
    "sourceUrl" TEXT,
    "sourceVersion" TEXT,
    "status" "KnowledgeReviewStatus" NOT NULL DEFAULT 'PRELIMINARY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerKnowledgeLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerCourse" (
    "id" SERIAL NOT NULL,
    "careerId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "semester" INTEGER,
    "code" TEXT,
    "conceptCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sourceName" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "sourceVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerCourse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeConcept_code_key" ON "KnowledgeConcept"("code");

-- CreateIndex
CREATE INDEX "KnowledgeConcept_type_status_idx" ON "KnowledgeConcept"("type", "status");

-- CreateIndex
CREATE INDEX "CareerKnowledgeLink_careerId_status_idx" ON "CareerKnowledgeLink"("careerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CareerKnowledgeLink_careerId_conceptId_key" ON "CareerKnowledgeLink"("careerId", "conceptId");

-- CreateIndex
CREATE INDEX "CareerCourse_careerId_semester_idx" ON "CareerCourse"("careerId", "semester");

-- CreateIndex
CREATE UNIQUE INDEX "CareerCourse_careerId_name_key" ON "CareerCourse"("careerId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Question_seedKey_key" ON "Question"("seedKey");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionOption_code_key" ON "QuestionOption"("code");

-- AddForeignKey
ALTER TABLE "CareerKnowledgeLink" ADD CONSTRAINT "CareerKnowledgeLink_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "Career"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerKnowledgeLink" ADD CONSTRAINT "CareerKnowledgeLink_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "KnowledgeConcept"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerCourse" ADD CONSTRAINT "CareerCourse_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "Career"("id") ON DELETE CASCADE ON UPDATE CASCADE;
