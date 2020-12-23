/*
  Warnings:

  - You are about to drop the column `createdAt` on the `benchmarking_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `benchmarking_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `processing_queue` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `processing_queue` table. All the data in the column will be lost.
  - You are about to drop the column `sessionId` on the `processing_queue` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `submissions` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `submissions` table. All the data in the column will be lost.
  - You are about to drop the column `sessionId` on the `submissions` table. All the data in the column will be lost.
  - You are about to drop the column `integerValues` on the `submissions` table. All the data in the column will be lost.
  - The migration will add a unique constraint covering the columns `[session_id]` on the table `processing_queue`. If there are existing duplicate values, the migration will fail.
  - Added the required column `session_id` to the `processing_queue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `session_id` to the `submissions` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "processing_queue.status_createdAt_index";

-- DropIndex
DROP INDEX "processing_queue.sessionId_unique";

-- DropForeignKey
ALTER TABLE "processing_queue" DROP CONSTRAINT "processing_queue_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "submissions" DROP CONSTRAINT "submissions_sessionId_fkey";

-- AlterTable
ALTER TABLE "benchmarking_sessions" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "processing_queue" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
DROP COLUMN "sessionId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3),
ADD COLUMN     "session_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "submissions" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
DROP COLUMN "sessionId",
DROP COLUMN "integerValues",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3),
ADD COLUMN     "session_id" TEXT NOT NULL,
ADD COLUMN     "integer_values" INTEGER[];

-- CreateIndex
CREATE UNIQUE INDEX "processing_queue.session_id_unique" ON "processing_queue"("session_id");

-- CreateIndex
CREATE INDEX "processing_queue.status_created_at_index" ON "processing_queue"("status", "created_at");

-- AddForeignKey
ALTER TABLE "processing_queue" ADD FOREIGN KEY("session_id")REFERENCES "benchmarking_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD FOREIGN KEY("session_id")REFERENCES "benchmarking_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
