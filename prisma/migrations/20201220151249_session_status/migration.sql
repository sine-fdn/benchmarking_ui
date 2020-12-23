/*
  Warnings:

  - You are about to drop the column `inputTitles` on the `benchmarking_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `inputComputations` on the `benchmarking_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `processorHostnames` on the `benchmarking_sessions` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `benchmarking_sessions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "session_status" AS ENUM ('PENDING', 'QUEUED', 'FINISHED', 'FINISHED_WITH_ERROR');

-- AlterTable
ALTER TABLE "benchmarking_sessions" DROP COLUMN "inputTitles",
DROP COLUMN "inputComputations",
DROP COLUMN "processorHostnames",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "input_titles" TEXT[],
ADD COLUMN     "input_computations" "computation_kind"[],
ADD COLUMN     "processor_hostnames" TEXT[],
ADD COLUMN     "status" "session_status" NOT NULL DEFAULT E'PENDING';
