ALTER TYPE "public"."scramblePosition" RENAME TO "scramble_position";--> statement-breakpoint
ALTER TYPE "public"."solveState" RENAME TO "solve_state";--> statement-breakpoint
ALTER TABLE "roundSession" RENAME TO "round_session";--> statement-breakpoint
ALTER TABLE "round_session" DROP CONSTRAINT "roundSession_contestant_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "round_session" DROP CONSTRAINT "roundSession_contest_discipline_id_contest_discipline_id_fk";
--> statement-breakpoint
ALTER TABLE "solve" DROP CONSTRAINT "solve_round_session_id_roundSession_id_fk";
--> statement-breakpoint
ALTER TABLE "round_session" ADD CONSTRAINT "round_session_contestant_id_user_id_fk" FOREIGN KEY ("contestant_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "round_session" ADD CONSTRAINT "round_session_contest_discipline_id_contest_discipline_id_fk" FOREIGN KEY ("contest_discipline_id") REFERENCES "public"."contest_discipline"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solve" ADD CONSTRAINT "solve_round_session_id_round_session_id_fk" FOREIGN KEY ("round_session_id") REFERENCES "public"."round_session"("id") ON DELETE cascade ON UPDATE no action;