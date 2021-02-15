/*
  Warnings:

  - You are about to drop the column `inputMatrix` on the `mpc_functions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "mpc_functions" DROP COLUMN "inputMatrix",
ADD COLUMN     "input_matrix" INTEGER[];
