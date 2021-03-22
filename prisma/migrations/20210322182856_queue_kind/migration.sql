-- CreateEnum
CREATE TYPE "queue_kind" AS ENUM ('DATASET', 'OTHER');

-- DropIndex
DROP INDEX "processing_queue.status_created_at_index";

-- AlterTable
ALTER TABLE "processing_queue" ADD COLUMN     "qkind" "queue_kind" NOT NULL DEFAULT E'OTHER';

-- CreateIndex
CREATE INDEX "processing_queue.qkind_status_created_at_index" ON "processing_queue"("qkind", "status", "created_at");
