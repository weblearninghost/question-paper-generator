/*
  Warnings:

  - You are about to drop the column `ownerId` on the `Class` table. All the data in the column will be lost.
  - Added the required column `tuitionId` to the `Class` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Class" DROP CONSTRAINT "Class_ownerId_fkey";

-- DropIndex
DROP INDEX "Class_ownerId_idx";

-- AlterTable
ALTER TABLE "Class" DROP COLUMN "ownerId",
ADD COLUMN     "tuitionId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Tuition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tuition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tuition_ownerId_key" ON "Tuition"("ownerId");

-- CreateIndex
CREATE INDEX "Class_tuitionId_idx" ON "Class"("tuitionId");

-- AddForeignKey
ALTER TABLE "Tuition" ADD CONSTRAINT "Tuition_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_tuitionId_fkey" FOREIGN KEY ("tuitionId") REFERENCES "Tuition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
