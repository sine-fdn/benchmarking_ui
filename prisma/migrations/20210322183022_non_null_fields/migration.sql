/*
 Warnings:

 - Made the column `coordinator` on table `processing_queue` required. The migration will fail if there are existing NULL values in that column.
 - Made the column `ops` on table `processing_queue` required. The migration will fail if there are existing NULL values in that column.
 */
-- AlterTable
BEGIN;
UPDATE
  "processing_queue"
SET
  "coordinator" = ''
WHERE
  coordinator IS NULL;
UPDATE
  "processing_queue"
SET
  ops = '[]'::jsonb
WHERE
  ops IS NULL;
COMMIT;

ALTER TABLE "processing_queue"
  ALTER COLUMN "coordinator" SET NOT NULL,
  ALTER COLUMN "ops" SET NOT NULL;

