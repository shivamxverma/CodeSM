CREATE TYPE "public"."SubmissionMode" AS ENUM('SUBMIT', 'RUN');--> statement-breakpoint
ALTER TABLE "submission" ADD COLUMN "mode" "SubmissionMode" NOT NULL;--> statement-breakpoint
ALTER TABLE "execution_result" DROP COLUMN "execution_time_ms";--> statement-breakpoint
ALTER TABLE "execution_result" DROP COLUMN "memory_used_kb";