ALTER TYPE "public"."solve_state" RENAME TO "solve_status";--> statement-breakpoint
ALTER TABLE "solve" RENAME COLUMN "state" TO "status";--> statement-breakpoint
ALTER TABLE "scramble" DROP CONSTRAINT "contest_discipline_position_unique";--> statement-breakpoint
ALTER TABLE "scramble" ADD CONSTRAINT "round_position_unique" UNIQUE("round_id","position");