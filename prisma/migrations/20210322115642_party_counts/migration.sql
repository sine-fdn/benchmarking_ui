-- AlterTable
ALTER TABLE "processing_queue" ADD COLUMN     "party_id" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "party_count" INTEGER NOT NULL DEFAULT 2;
