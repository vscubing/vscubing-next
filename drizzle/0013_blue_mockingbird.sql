ALTER TABLE "contest_discipline" RENAME COLUMN "disciplineName" TO "disciplineSlug";--> statement-breakpoint
ALTER TABLE "contest_discipline" DROP CONSTRAINT "contest_discipline_disciplineName_discipline_slug_fk";
--> statement-breakpoint
ALTER TABLE "contest_discipline" DROP CONSTRAINT "contest_discipline_contestId_contest_id_fk";
--> statement-breakpoint
ALTER TABLE "contest_discipline" ADD CONSTRAINT "contest_discipline_disciplineSlug_discipline_slug_fk" FOREIGN KEY ("disciplineSlug") REFERENCES "public"."discipline"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contest_discipline" ADD CONSTRAINT "contest_discipline_contestId_contest_id_fk" FOREIGN KEY ("contestId") REFERENCES "public"."contest"("id") ON DELETE cascade ON UPDATE no action;