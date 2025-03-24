ALTER TABLE "legacy_accounts_user" RENAME TO "user";--> statement-breakpoint
ALTER TABLE "legacy_accounts_settingsmodel" DROP CONSTRAINT "accounts_settingsmodel_user_id_b5b21c0f_fk_accounts_user_id";
--> statement-breakpoint
ALTER TABLE "legacy_contests_roundsessionmodel" DROP CONSTRAINT "contests_roundsessionmodel_user_id_3b33a5a3_fk_accounts_user_id";
--> statement-breakpoint
ALTER TABLE "legacy_contests_solvemodel" DROP CONSTRAINT "contests_solvemodel_user_id_28200dba_fk_accounts_user_id";
--> statement-breakpoint
ALTER TABLE "legacy_accounts_settingsmodel" ADD CONSTRAINT "accounts_settingsmodel_user_id_b5b21c0f_fk_accounts_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legacy_contests_roundsessionmodel" ADD CONSTRAINT "contests_roundsessionmodel_user_id_3b33a5a3_fk_accounts_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legacy_contests_solvemodel" ADD CONSTRAINT "contests_solvemodel_user_id_28200dba_fk_accounts_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;