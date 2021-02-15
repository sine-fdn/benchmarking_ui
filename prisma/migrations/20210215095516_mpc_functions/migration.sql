-- CreateTable
CREATE TABLE "mpc_functions" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "inputs" TEXT[],
    "outputs" TEXT[],
    "inputMatrix" INTEGER[],

    PRIMARY KEY ("id")
);
