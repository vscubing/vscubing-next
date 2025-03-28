ALTER TABLE "contest_discipline" DROP CONSTRAINT "contest_discipline_contestId_contest_id_fk";
--> statement-breakpoint
ALTER TABLE "contest_discipline" DROP CONSTRAINT "contest_discipline_contestSlug_contest_slug_fk";
--> statement-breakpoint
ALTER TABLE "contest_discipline" ADD CONSTRAINT "contest_discipline_contestSlug_contest_slug_fk" FOREIGN KEY ("contestSlug") REFERENCES "public"."contest"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contest_discipline" DROP COLUMN "contestId";