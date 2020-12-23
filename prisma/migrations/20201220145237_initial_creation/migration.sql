-- CreateEnum
CREATE TYPE "computation_kind" AS ENUM ('RANKING');

-- CreateTable
CREATE TABLE "benchmarking_sessions" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "num_parties" INTEGER NOT NULL,
    "inputTitles" TEXT[],
    "inputComputations" "computation_kind"[],
    "processorHostnames" TEXT[],

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sessionId" TEXT NOT NULL,
    "submitter" TEXT NOT NULL,
    "integerValues" INTEGER[],

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "submissions" ADD FOREIGN KEY("sessionId")REFERENCES "benchmarking_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
