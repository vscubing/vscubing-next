ALTER TABLE "contest_discipline" RENAME TO "round";--> statement-breakpoint
ALTER TABLE "round_session" RENAME COLUMN "contest_discipline_id" TO "round_id";--> statement-breakpoint
ALTER TABLE "scramble" RENAME COLUMN "contest_discipline_id" TO "round_id";--> statement-breakpoint
ALTER TABLE "scramble" DROP CONSTRAINT "contest_discipline_position_unique";--> statement-breakpoint
ALTER TABLE "round" DROP CONSTRAINT "contest_discipline_contest_slug_contest_slug_fk";
--> statement-breakpoint
ALTER TABLE "round" DROP CONSTRAINT "contest_discipline_discipline_slug_discipline_slug_fk";
--> statement-breakpoint
ALTER TABLE "round_session" DROP CONSTRAINT "round_session_contest_discipline_id_contest_discipline_id_fk";
--> statement-breakpoint
ALTER TABLE "scramble" DROP CONSTRAINT "scramble_contest_discipline_id_contest_discipline_id_fk";
--> statement-breakpoint
ALTER TABLE "round" ADD CONSTRAINT "round_contest_slug_contest_slug_fk" FOREIGN KEY ("contest_slug") REFERENCES "public"."contest"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "round" ADD CONSTRAINT "round_discipline_slug_discipline_slug_fk" FOREIGN KEY ("discipline_slug") REFERENCES "public"."discipline"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "round_session" ADD CONSTRAINT "round_session_round_id_round_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."round"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scramble" ADD CONSTRAINT "scramble_round_id_round_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."round"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scramble" ADD CONSTRAINT "contest_discipline_position_unique" UNIQUE("round_id","position");