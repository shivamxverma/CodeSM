CREATE TYPE "public"."AuthProvider" AS ENUM('GOOGLE_OAUTH', 'EMAIL_PASSWORD');--> statement-breakpoint
CREATE TYPE "public"."Difficulty" AS ENUM('EASY', 'MEDIUM', 'HARD', 'EXPERT');--> statement-breakpoint
CREATE TYPE "public"."JobStatus" AS ENUM('PENDING', 'RUNNING', 'FAILED', 'COMPLETED');--> statement-breakpoint
CREATE TYPE "public"."Language" AS ENUM('CPP', 'JAVA', 'PYTHON', 'JAVASCRIPT', 'C', 'CSHARP');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('ADMIN', 'AUTHOR', 'USER');--> statement-breakpoint
CREATE TYPE "public"."Verdict" AS ENUM('PENDING', 'ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'MEMORY_LIMIT_EXCEEDED', 'RUNTIME_ERROR', 'COMPILE_ERROR');--> statement-breakpoint
CREATE TABLE "auth_method" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"provider" "AuthProvider" NOT NULL,
	"google_sub" text,
	"google_email" text,
	"email" text,
	"password_hash" text,
	"created_at" timestamp(3) DEFAULT (now() AT TIME ZONE 'UTC'::text) NOT NULL,
	"updated_at" timestamp(3) DEFAULT (now() AT TIME ZONE 'UTC'::text) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "editorial" (
	"id" text PRIMARY KEY NOT NULL,
	"problem_id" text NOT NULL,
	"content" text NOT NULL,
	"editorial_link" text,
	"solution" text,
	"created_at" timestamp(3) DEFAULT (now() AT TIME ZONE 'UTC'::text) NOT NULL,
	"updated_at" timestamp(3) DEFAULT (now() AT TIME ZONE 'UTC'::text) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "execution_result" (
	"id" text PRIMARY KEY NOT NULL,
	"submission_id" text NOT NULL,
	"testcase_id" text NOT NULL,
	"verdict" "Verdict" DEFAULT 'PENDING' NOT NULL,
	"execution_time_ms" integer,
	"memory_used_kb" integer,
	"stdout" text,
	"stderr" text,
	"created_at" timestamp(3) DEFAULT (now() AT TIME ZONE 'UTC'::text) NOT NULL,
	"updated_at" timestamp(3) DEFAULT (now() AT TIME ZONE 'UTC'::text) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hints" (
	"id" text PRIMARY KEY NOT NULL,
	"problem_id" text NOT NULL,
	"order" smallint DEFAULT 0 NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp(3) DEFAULT (now() AT TIME ZONE 'UTC'::text) NOT NULL,
	"updated_at" timestamp(3) DEFAULT (now() AT TIME ZONE 'UTC'::text) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "problem" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"difficulty" "Difficulty" DEFAULT 'EASY' NOT NULL,
	"description" text NOT NULL,
	"author_id" text NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp(3) DEFAULT (now() AT TIME ZONE 'UTC'::text) NOT NULL,
	"updated_at" timestamp(3) DEFAULT (now() AT TIME ZONE 'UTC'::text) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "problem_tags" (
	"problem_id" text NOT NULL,
	"tag_id" text NOT NULL,
	CONSTRAINT "problem_tags_problem_id_tag_id_pk" PRIMARY KEY("problem_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"session_token" text NOT NULL,
	"expires" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submission" (
	"id" text PRIMARY KEY NOT NULL,
	"problem_id" text NOT NULL,
	"user_id" text NOT NULL,
	"code" text NOT NULL,
	"language" "Language" DEFAULT 'CPP' NOT NULL,
	"status" "JobStatus" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp(3) DEFAULT (now() AT TIME ZONE 'UTC'::text) NOT NULL,
	"updated_at" timestamp(3) DEFAULT (now() AT TIME ZONE 'UTC'::text) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tag" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "testcases" (
	"id" text PRIMARY KEY NOT NULL,
	"problem_id" text NOT NULL,
	"input" text,
	"output" text,
	"is_sample" boolean DEFAULT false NOT NULL,
	"created_at" timestamp(3) DEFAULT (now() AT TIME ZONE 'UTC'::text) NOT NULL,
	"updated_at" timestamp(3) DEFAULT (now() AT TIME ZONE 'UTC'::text) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text,
	"display_name" text NOT NULL,
	"avatar_url" text,
	"username" text NOT NULL,
	"role" "role" DEFAULT 'USER' NOT NULL,
	"is2fa_auth_enabled" boolean DEFAULT false NOT NULL,
	"is_banned" boolean DEFAULT false NOT NULL,
	"is_email_verified" boolean DEFAULT false NOT NULL,
	"verification_token" text,
	"created_at" timestamp(3) DEFAULT (now() AT TIME ZONE 'UTC'::text) NOT NULL,
	"updated_at" timestamp(3) DEFAULT (now() AT TIME ZONE 'UTC'::text) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "auth_method" ADD CONSTRAINT "auth_method_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "editorial" ADD CONSTRAINT "editorial_problem_id_problem_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problem"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "execution_result" ADD CONSTRAINT "execution_result_submission_id_submission_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submission"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "execution_result" ADD CONSTRAINT "execution_result_testcase_id_testcases_id_fk" FOREIGN KEY ("testcase_id") REFERENCES "public"."testcases"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "hints" ADD CONSTRAINT "hints_problem_id_problem_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problem"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "problem" ADD CONSTRAINT "problem_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "problem_tags" ADD CONSTRAINT "problem_tags_problem_id_problem_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problem"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "problem_tags" ADD CONSTRAINT "problem_tags_tag_id_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "submission" ADD CONSTRAINT "submission_problem_id_problem_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problem"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "submission" ADD CONSTRAINT "submission_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "testcases" ADD CONSTRAINT "testcases_problem_id_problem_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problem"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "auth_method_google_email_key" ON "auth_method" USING btree ("google_email");--> statement-breakpoint
CREATE UNIQUE INDEX "auth_method_google_sub_key" ON "auth_method" USING btree ("google_sub");--> statement-breakpoint
CREATE INDEX "auth_method_provider_idx" ON "auth_method" USING btree ("provider");--> statement-breakpoint
CREATE UNIQUE INDEX "auth_method_user_id_key" ON "auth_method" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "editorial_problem_id_key" ON "editorial" USING btree ("problem_id");--> statement-breakpoint
CREATE INDEX "execution_result_submission_verdict_idx" ON "execution_result" USING btree ("submission_id","verdict");--> statement-breakpoint
CREATE INDEX "execution_result_submission_id_idx" ON "execution_result" USING btree ("submission_id");--> statement-breakpoint
CREATE INDEX "execution_result_testcase_id_idx" ON "execution_result" USING btree ("testcase_id");--> statement-breakpoint
CREATE INDEX "hints_problem_id_idx" ON "hints" USING btree ("problem_id");--> statement-breakpoint
CREATE INDEX "problem_author_id_idx" ON "problem" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "problem_title_idx" ON "problem" USING btree ("title");--> statement-breakpoint
CREATE INDEX "problem_difficulty_idx" ON "problem" USING btree ("difficulty");--> statement-breakpoint
CREATE INDEX "problem_created_at_idx" ON "problem" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "submission_user_problem_idx" ON "submission" USING btree ("user_id","problem_id");--> statement-breakpoint
CREATE INDEX "submission_problem_id_idx" ON "submission" USING btree ("problem_id");--> statement-breakpoint
CREATE INDEX "submission_user_id_idx" ON "submission" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "submission_status_idx" ON "submission" USING btree ("status");--> statement-breakpoint
CREATE INDEX "submission_created_at_idx" ON "submission" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "tag_name_key" ON "tag" USING btree ("name");--> statement-breakpoint
CREATE INDEX "testcases_problem_id_idx" ON "testcases" USING btree ("problem_id");--> statement-breakpoint
CREATE INDEX "testcases_is_sample_idx" ON "testcases" USING btree ("is_sample");--> statement-breakpoint
CREATE UNIQUE INDEX "user_email_key" ON "user" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "user_username_key" ON "user" USING btree ("username");