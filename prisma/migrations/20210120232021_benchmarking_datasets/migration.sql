-- AlterTable
ALTER TABLE "benchmarking_sessions" ADD COLUMN     "dataset_id" TEXT;

-- CreateTable
CREATE TABLE "datasets" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dataset_dimensions" (
    "dataset_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "integer_values" INTEGER[]
);

-- CreateIndex
CREATE UNIQUE INDEX "dataset_dimensions.dataset_id_name_unique" ON "dataset_dimensions"("dataset_id", "name");

-- AddForeignKey
ALTER TABLE "dataset_dimensions" ADD FOREIGN KEY("dataset_id")REFERENCES "datasets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "benchmarking_sessions" ADD FOREIGN KEY("dataset_id")REFERENCES "datasets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
