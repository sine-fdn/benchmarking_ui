/*
  Warnings:

  - You are about to drop the column `status` on the `benchmarking_sessions` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "processing_status" AS ENUM ('PENDING', 'PROCESSING', 'FINISHED', 'FINISHED_WITH_ERROR');

-- AlterTable
ALTER TABLE "benchmarking_sessions" DROP COLUMN "status";

-- DropEnum
DROP TYPE "session_status";

-- CreateTable
CREATE TABLE "processing_queue" (
"id" SERIAL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sessionId" TEXT NOT NULL,
    "status" "processing_status" NOT NULL DEFAULT E'PENDING',

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "processing_queue.sessionId_unique" ON "processing_queue"("sessionId");

-- CreateIndex
CREATE INDEX "processing_queue.status_createdAt_index" ON "processing_queue"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "processing_queue" ADD FOREIGN KEY("sessionId")REFERENCES "benchmarking_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
