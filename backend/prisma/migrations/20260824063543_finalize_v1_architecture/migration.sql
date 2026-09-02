/*
  Warnings:

  - You are about to drop the column `description` on the `Class` table. All the data in the column will be lost.
  - You are about to drop the column `medium` on the `Class` table. All the data in the column will be lost.
  - You are about to drop the column `tuitionId` on the `Class` table. All the data in the column will be lost.
  - You are about to drop the column `correctAnswer` on the `Question` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Class` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[classNo]` on the table `Class` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[chapterId,medium,externalId]` on the table `Question` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `classNo` to the `Class` table without a default value. This is not possible if the table is not empty.
  - Added the required column `externalId` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionContent` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tuitionId` to the `QuestionPaper` table without a default value. This is not possible if the table is not empty.
  - Added the required column `marks` to the `QuestionPaperQuestion` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE');

-- CreateEnum
CREATE TYPE "MediaLocation" AS ENUM ('QUESTION', 'ANSWER');

-- DropForeignKey
ALTER TABLE "Class" DROP CONSTRAINT "Class_tuitionId_fkey";

-- DropIndex
DROP INDEX "Class_tuitionId_idx";

-- AlterTable
ALTER TABLE "Class" DROP COLUMN "description",
DROP COLUMN "medium",
DROP COLUMN "tuitionId",
ADD COLUMN     "classNo" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "correctAnswer",
ADD COLUMN     "answerContent" JSONB,
ADD COLUMN     "externalId" TEXT NOT NULL,
ADD COLUMN     "questionContent" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "QuestionPaper" ADD COLUMN     "tuitionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "QuestionPaperQuestion" ADD COLUMN     "marks" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "tuitionId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionClass" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,

    CONSTRAINT "SubscriptionClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionMedia" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "location" "MediaLocation" NOT NULL,
    "storageKey" TEXT NOT NULL,
    "fileName" TEXT,
    "mimeType" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionMedia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_tuitionId_key" ON "Subscription"("tuitionId");

-- CreateIndex
CREATE INDEX "SubscriptionClass_classId_idx" ON "SubscriptionClass"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionClass_subscriptionId_classId_key" ON "SubscriptionClass"("subscriptionId", "classId");

-- CreateIndex
CREATE INDEX "QuestionMedia_questionId_idx" ON "QuestionMedia"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "Class_name_key" ON "Class"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Class_classNo_key" ON "Class"("classNo");

-- CreateIndex
CREATE INDEX "Question_type_idx" ON "Question"("type");

-- CreateIndex
CREATE INDEX "Question_difficulty_idx" ON "Question"("difficulty");

-- CreateIndex
CREATE UNIQUE INDEX "Question_chapterId_medium_externalId_key" ON "Question"("chapterId", "medium", "externalId");

-- CreateIndex
CREATE INDEX "QuestionPaper_tuitionId_idx" ON "QuestionPaper"("tuitionId");

-- CreateIndex
CREATE INDEX "QuestionPaper_subjectId_idx" ON "QuestionPaper"("subjectId");

-- CreateIndex
CREATE INDEX "QuestionPaperQuestion_questionId_idx" ON "QuestionPaperQuestion"("questionId");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_tuitionId_fkey" FOREIGN KEY ("tuitionId") REFERENCES "Tuition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionClass" ADD CONSTRAINT "SubscriptionClass_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionClass" ADD CONSTRAINT "SubscriptionClass_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionMedia" ADD CONSTRAINT "QuestionMedia_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionPaper" ADD CONSTRAINT "QuestionPaper_tuitionId_fkey" FOREIGN KEY ("tuitionId") REFERENCES "Tuition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
