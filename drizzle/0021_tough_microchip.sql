ALTER TABLE "user" ALTER COLUMN "name" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "solve" ADD COLUMN "extra_reason" text;