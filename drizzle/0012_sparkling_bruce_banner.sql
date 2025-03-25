ALTER TABLE "discipline" RENAME COLUMN "name" TO "slug";--> statement-breakpoint
ALTER TABLE "contest_discipline" DROP CONSTRAINT "contest_discipline_disciplineName_discipline_name_fk";
--> statement-breakpoint
ALTER TABLE "contest_discipline" ADD CONSTRAINT "contest_discipline_disciplineName_discipline_slug_fk" FOREIGN KEY ("disciplineName") REFERENCES "public"."discipline"("slug") ON DELETE no action ON UPDATE no action;