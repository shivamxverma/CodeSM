CREATE TYPE "public"."UserStatus" AS ENUM('ACTIVE', 'INACTIVE');--> statement-breakpoint
CREATE TYPE "public"."UserType" AS ENUM('AUTHOR', 'USER', 'ADMIN');--> statement-breakpoint
CREATE TABLE "problems" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"difficulty" integer NOT NULL,
	"author_id" uuid NOT NULL,
	"problemdata" text,
	"tag_id" uuid NOT NULL,
	"editorial" varchar(255) NOT NULL,
	"created_at" timestamp(3) DEFAULT (now() AT TIME ZONE 'UTC'::text) NOT NULL,
	"updated_at" timestamp(3) DEFAULT (now() AT TIME ZONE 'UTC'::text) NOT NULL,
	CONSTRAINT "problems_title_unique" UNIQUE("title"),
	CONSTRAINT "problems_editorial_unique" UNIQUE("editorial")
);
--> statement-breakpoint
CREATE TABLE "tag" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" text,
	"created_at" timestamp(3) DEFAULT (now() AT TIME ZONE 'UTC'::text) NOT NULL,
	CONSTRAINT "tag_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"created_at" timestamp(3) DEFAULT (now() AT TIME ZONE 'UTC'::text) NOT NULL,
	"updated_at" timestamp(3) DEFAULT (now() AT TIME ZONE 'UTC'::text) NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text,
	"display_name" text NOT NULL,
	"avatar_url" text,
	"status" "UserStatus" DEFAULT 'ACTIVE' NOT NULL,
	"type" "UserType" DEFAULT 'USER' NOT NULL,
	"username" text,
	"problemId" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "problems" ADD CONSTRAINT "problems_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problems" ADD CONSTRAINT "problems_tag_id_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_problemId_problems_id_fk" FOREIGN KEY ("problemId") REFERENCES "public"."problems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "difficulty_idx" ON "problems" USING btree ("difficulty");--> statement-breakpoint
CREATE INDEX "title_idx" ON "problems" USING btree ("title");--> statement-breakpoint
CREATE INDEX "author_idx" ON "problems" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "user_status_idx" ON "users" USING btree ("status");