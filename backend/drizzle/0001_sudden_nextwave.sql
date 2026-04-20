CREATE TYPE "public"."ProblemStatus" AS ENUM('DRAFT', 'DONE', 'PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TABLE "testcase" (
	"id" text PRIMARY KEY NOT NULL,
	"problem_id" text NOT NULL,
	"s3_key" text NOT NULL,
	"is_sample" boolean DEFAULT false NOT NULL,
	"is_hidden" boolean DEFAULT true NOT NULL,
	"order" smallint DEFAULT 0 NOT NULL,
	"batch" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "testcases" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "testcases" CASCADE;--> statement-breakpoint
ALTER TABLE "execution_result" DROP CONSTRAINT "execution_result_testcase_id_testcases_id_fk";
--> statement-breakpoint
ALTER TABLE "problem" DROP CONSTRAINT "problem_author_id_user_id_fk";
--> statement-breakpoint
DROP INDEX "problem_author_id_idx";--> statement-breakpoint
DROP INDEX "problem_title_idx";--> statement-breakpoint
DROP INDEX "problem_created_at_idx";--> statement-breakpoint
ALTER TABLE "problem" ALTER COLUMN "difficulty" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "problem" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "problem" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "problem" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "problem" ADD COLUMN "input_format" text NOT NULL;--> statement-breakpoint
ALTER TABLE "problem" ADD COLUMN "output_format" text NOT NULL;--> statement-breakpoint
ALTER TABLE "problem" ADD COLUMN "constraints" text NOT NULL;--> statement-breakpoint
ALTER TABLE "problem" ADD COLUMN "status" "ProblemStatus" DEFAULT 'DRAFT' NOT NULL;--> statement-breakpoint
ALTER TABLE "problem" ADD COLUMN "time_limit" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "problem" ADD COLUMN "memory_limit" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "submission" ADD COLUMN "total_testcases" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "submission" ADD COLUMN "passed_testcases" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "submission" ADD COLUMN "failed_testcases" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "submission" ADD COLUMN "time_taken" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "submission" ADD COLUMN "memory_taken" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "testcase" ADD CONSTRAINT "testcase_problem_id_problem_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problem"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "testcase_problem_idx" ON "testcase" USING btree ("problem_id");--> statement-breakpoint
CREATE INDEX "testcase_sample_idx" ON "testcase" USING btree ("is_sample");--> statement-breakpoint
ALTER TABLE "execution_result" ADD CONSTRAINT "execution_result_testcase_id_testcase_id_fk" FOREIGN KEY ("testcase_id") REFERENCES "public"."testcase"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "problem" ADD CONSTRAINT "problem_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "problem_author_idx" ON "problem" USING btree ("author_id");--> statement-breakpoint
ALTER TABLE "problem" DROP COLUMN "is_published";--> statement-breakpoint
ALTER TABLE "problem" DROP COLUMN "updated_at";