ALTER TABLE "editorial" ADD COLUMN "content_s3_key" text NOT NULL;--> statement-breakpoint
ALTER TABLE "editorial" ADD COLUMN "solution_s3_key" text NOT NULL;--> statement-breakpoint
ALTER TABLE "editorial" DROP COLUMN "content";--> statement-breakpoint
ALTER TABLE "editorial" DROP COLUMN "solution";