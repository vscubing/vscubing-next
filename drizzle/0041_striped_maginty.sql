ALTER TABLE "contest" ALTER COLUMN "end_date" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "contest" ADD COLUMN "expected_end_date" timestamp with time zone;