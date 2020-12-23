-- CreateTable
CREATE TABLE "results" (
"id" SERIAL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "session_id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "integer_results" INTEGER[],

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "results.submission_id_unique" ON "results"("submission_id");

-- CreateIndex
CREATE INDEX "results.session_id_submission_id_index" ON "results"("session_id", "submission_id");

-- AddForeignKey
ALTER TABLE "results" ADD FOREIGN KEY("session_id")REFERENCES "benchmarking_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "results" ADD FOREIGN KEY("submission_id")REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
