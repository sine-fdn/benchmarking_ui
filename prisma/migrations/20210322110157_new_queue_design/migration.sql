-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "computation_kind" ADD VALUE 'RANKING_DATASET';
ALTER TYPE "computation_kind" ADD VALUE 'RANKING_DATASET_DELEGATED';
ALTER TYPE "computation_kind" ADD VALUE 'FUNCTION_CALL_DELEGATED';

-- AlterTable
ALTER TABLE "processing_queue" ADD COLUMN     "coordinator" TEXT,
ADD COLUMN     "ops" JSONB;
