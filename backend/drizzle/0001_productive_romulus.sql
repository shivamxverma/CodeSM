ALTER TABLE "execution_result" DROP CONSTRAINT "execution_result_testcase_id_testcase_id_fk";
--> statement-breakpoint
DROP INDEX "execution_result_testcase_id_idx";--> statement-breakpoint
ALTER TABLE "execution_result" DROP COLUMN "testcase_id";