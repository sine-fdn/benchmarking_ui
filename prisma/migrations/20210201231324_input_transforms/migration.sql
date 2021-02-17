-- AlterTable
ALTER TABLE "dataset_dimensions" ADD COLUMN     "input_transform" INTEGER[];

-- AlterTable
ALTER TABLE "datasets" ADD COLUMN     "input_dimensions" TEXT[];
