/*
  Warnings:

  - Added the required column `classId` to the `QuestionPaper` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "QuestionPaper" ADD COLUMN     "classId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "QuestionPaperQuestion" ADD COLUMN     "sectionName" TEXT;

-- AlterTable
ALTER TABLE "Tuition" ADD COLUMN     "logoFileName" TEXT,
ADD COLUMN     "logoMimeType" TEXT,
ADD COLUMN     "logoStorageKey" TEXT;

-- CreateIndex
CREATE INDEX "QuestionPaper_classId_idx" ON "QuestionPaper"("classId");

-- AddForeignKey
ALTER TABLE "QuestionPaper" ADD CONSTRAINT "QuestionPaper_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
