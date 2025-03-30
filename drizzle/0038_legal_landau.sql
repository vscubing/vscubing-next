ALTER TABLE "account" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "account" RENAME COLUMN "providerAccountId" TO "provider_account_id";--> statement-breakpoint
ALTER TABLE "session" RENAME COLUMN "sessionToken" TO "session_token";--> statement-breakpoint
ALTER TABLE "session" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "user" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "user" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "user" RENAME COLUMN "emailVerified" TO "email_verified";--> statement-breakpoint
ALTER TABLE "user" RENAME COLUMN "finishedRegistration" TO "finished_registration";--> statement-breakpoint
ALTER TABLE "contest" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "contest" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "contest" RENAME COLUMN "startDate" TO "start_date";--> statement-breakpoint
ALTER TABLE "contest" RENAME COLUMN "endDate" TO "end_date";--> statement-breakpoint
ALTER TABLE "contest" RENAME COLUMN "isOngoing" TO "is_ongoing";--> statement-breakpoint
ALTER TABLE "contest_discipline" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "contest_discipline" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "contest_discipline" RENAME COLUMN "contestSlug" TO "contest_slug";--> statement-breakpoint
ALTER TABLE "contest_discipline" RENAME COLUMN "disciplineSlug" TO "discipline_slug";--> statement-breakpoint
ALTER TABLE "discipline" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "discipline" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "roundSession" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "roundSession" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "roundSession" RENAME COLUMN "contestantId" TO "contestant_id";--> statement-breakpoint
ALTER TABLE "roundSession" RENAME COLUMN "contestDisciplineId" TO "contest_discipline_id";--> statement-breakpoint
ALTER TABLE "roundSession" RENAME COLUMN "avgMs" TO "avg_ms";--> statement-breakpoint
ALTER TABLE "roundSession" RENAME COLUMN "isDnf" TO "is_dnf";--> statement-breakpoint
ALTER TABLE "roundSession" RENAME COLUMN "isFinished" TO "is_finished";--> statement-breakpoint
ALTER TABLE "scramble" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "scramble" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "scramble" RENAME COLUMN "contestDisciplineId" TO "contest_discipline_id";--> statement-breakpoint
ALTER TABLE "scramble" RENAME COLUMN "isExtra" TO "is_extra";--> statement-breakpoint
ALTER TABLE "solve" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "solve" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "solve" RENAME COLUMN "scrambleId" TO "scramble_id";--> statement-breakpoint
ALTER TABLE "solve" RENAME COLUMN "roundSessionId" TO "round_session_id";--> statement-breakpoint
ALTER TABLE "solve" RENAME COLUMN "timeMs" TO "time_ms";--> statement-breakpoint
ALTER TABLE "solve" RENAME COLUMN "isDnf" TO "is_dnf";--> statement-breakpoint
ALTER TABLE "solve" RENAME COLUMN "reconstruction" TO "solution";--> statement-breakpoint
ALTER TABLE "account" DROP CONSTRAINT "account_userId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "session" DROP CONSTRAINT "session_userId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "contest_discipline" DROP CONSTRAINT "contest_discipline_contestSlug_contest_slug_fk";
--> statement-breakpoint
ALTER TABLE "contest_discipline" DROP CONSTRAINT "contest_discipline_disciplineSlug_discipline_slug_fk";
--> statement-breakpoint
ALTER TABLE "roundSession" DROP CONSTRAINT "roundSession_contestantId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "roundSession" DROP CONSTRAINT "roundSession_contestDisciplineId_contest_discipline_id_fk";
--> statement-breakpoint
ALTER TABLE "scramble" DROP CONSTRAINT "scramble_contestDisciplineId_contest_discipline_id_fk";
--> statement-breakpoint
ALTER TABLE "solve" DROP CONSTRAINT "solve_scrambleId_scramble_id_fk";
--> statement-breakpoint
ALTER TABLE "solve" DROP CONSTRAINT "solve_roundSessionId_roundSession_id_fk";
--> statement-breakpoint
DROP INDEX "account_user_id_idx";--> statement-breakpoint
DROP INDEX "t_user_id_idx";--> statement-breakpoint
ALTER TABLE "account" DROP CONSTRAINT "account_provider_providerAccountId_pk";--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id");--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contest_discipline" ADD CONSTRAINT "contest_discipline_contest_slug_contest_slug_fk" FOREIGN KEY ("contest_slug") REFERENCES "public"."contest"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contest_discipline" ADD CONSTRAINT "contest_discipline_discipline_slug_discipline_slug_fk" FOREIGN KEY ("discipline_slug") REFERENCES "public"."discipline"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roundSession" ADD CONSTRAINT "roundSession_contestant_id_user_id_fk" FOREIGN KEY ("contestant_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roundSession" ADD CONSTRAINT "roundSession_contest_discipline_id_contest_discipline_id_fk" FOREIGN KEY ("contest_discipline_id") REFERENCES "public"."contest_discipline"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scramble" ADD CONSTRAINT "scramble_contest_discipline_id_contest_discipline_id_fk" FOREIGN KEY ("contest_discipline_id") REFERENCES "public"."contest_discipline"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solve" ADD CONSTRAINT "solve_scramble_id_scramble_id_fk" FOREIGN KEY ("scramble_id") REFERENCES "public"."scramble"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solve" ADD CONSTRAINT "solve_round_session_id_roundSession_id_fk" FOREIGN KEY ("round_session_id") REFERENCES "public"."roundSession"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "t_user_id_idx" ON "session" USING btree ("user_id");