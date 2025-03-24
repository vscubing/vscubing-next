ALTER TABLE "account_emailaddress" RENAME TO "legacy_account_emailaddress";--> statement-breakpoint
ALTER TABLE "account_emailconfirmation" RENAME TO "legacy_account_emailconfirmation";--> statement-breakpoint
ALTER TABLE "accounts_settingsmodel" RENAME TO "legacy_accounts_settingsmodel";--> statement-breakpoint
ALTER TABLE "accounts_user" RENAME TO "legacy_accounts_user";--> statement-breakpoint
ALTER TABLE "accounts_user_groups" RENAME TO "legacy_accounts_user_groups";--> statement-breakpoint
ALTER TABLE "accounts_user_user_permissions" RENAME TO "legacy_accounts_user_user_permissions";--> statement-breakpoint
ALTER TABLE "auth_group" RENAME TO "legacy_auth_group";--> statement-breakpoint
ALTER TABLE "auth_group_permissions" RENAME TO "legacy_auth_group_permissions";--> statement-breakpoint
ALTER TABLE "auth_permission" RENAME TO "legacy_auth_permission";--> statement-breakpoint
ALTER TABLE "authtoken_token" RENAME TO "legacy_authtoken_token";--> statement-breakpoint
ALTER TABLE "contests_contestmodel" RENAME TO "legacy_contests_contestmodel";--> statement-breakpoint
ALTER TABLE "contests_contestmodel_discipline_set" RENAME TO "legacy_contests_contestmodel_discipline_set";--> statement-breakpoint
ALTER TABLE "contests_disciplinemodel" RENAME TO "legacy_contests_disciplinemodel";--> statement-breakpoint
ALTER TABLE "contests_roundsessionmodel" RENAME TO "legacy_contests_roundsessionmodel";--> statement-breakpoint
ALTER TABLE "contests_scramblemodel" RENAME TO "legacy_contests_scramblemodel";--> statement-breakpoint
ALTER TABLE "contests_singleresultleaderboardmodel" RENAME TO "legacy_contests_singleresultleaderboardmodel";--> statement-breakpoint
ALTER TABLE "contests_solvemodel" RENAME TO "legacy_contests_solvemodel";--> statement-breakpoint
ALTER TABLE "contests_tnoodlescramblesmodel" RENAME TO "legacy_contests_tnoodlescramblesmodel";--> statement-breakpoint
ALTER TABLE "django_admin_log" RENAME TO "legacy_django_admin_log";--> statement-breakpoint
ALTER TABLE "django_content_type" RENAME TO "legacy_django_content_type";--> statement-breakpoint
ALTER TABLE "django_migrations" RENAME TO "legacy_django_migrations";--> statement-breakpoint
ALTER TABLE "django_session" RENAME TO "legacy_django_session";--> statement-breakpoint
ALTER TABLE "django_site" RENAME TO "legacy_django_site";--> statement-breakpoint
ALTER TABLE "socialaccount_socialaccount" RENAME TO "legacy_socialaccount_socialaccount";--> statement-breakpoint
ALTER TABLE "socialaccount_socialapp" RENAME TO "legacy_socialaccount_socialapp";--> statement-breakpoint
ALTER TABLE "socialaccount_socialapp_sites" RENAME TO "legacy_socialaccount_socialapp_sites";--> statement-breakpoint
ALTER TABLE "socialaccount_socialtoken" RENAME TO "legacy_socialaccount_socialtoken";--> statement-breakpoint
ALTER TABLE "legacy_account_emailaddress" DROP CONSTRAINT "account_emailaddress_user_id_2c513194_fk_accounts_user_id";
--> statement-breakpoint
ALTER TABLE "legacy_account_emailconfirmation" DROP CONSTRAINT "account_emailconfirm_email_address_id_5b7f8c58_fk_account_e";
--> statement-breakpoint
ALTER TABLE "legacy_accounts_settingsmodel" DROP CONSTRAINT "accounts_settingsmodel_user_id_b5b21c0f_fk_accounts_user_id";
--> statement-breakpoint
ALTER TABLE "legacy_accounts_user_groups" DROP CONSTRAINT "accounts_user_groups_group_id_bd11a704_fk_auth_group_id";
--> statement-breakpoint
ALTER TABLE "legacy_accounts_user_groups" DROP CONSTRAINT "accounts_user_groups_user_id_52b62117_fk_accounts_user_id";
--> statement-breakpoint
ALTER TABLE "legacy_accounts_user_user_permissions" DROP CONSTRAINT "accounts_user_user_p_permission_id_113bb443_fk_auth_perm";
--> statement-breakpoint
ALTER TABLE "legacy_accounts_user_user_permissions" DROP CONSTRAINT "accounts_user_user_p_user_id_e4f0a161_fk_accounts_";
--> statement-breakpoint
ALTER TABLE "legacy_auth_group_permissions" DROP CONSTRAINT "auth_group_permissio_permission_id_84c5c92e_fk_auth_perm";
--> statement-breakpoint
ALTER TABLE "legacy_auth_group_permissions" DROP CONSTRAINT "auth_group_permissions_group_id_b120cbf9_fk_auth_group_id";
--> statement-breakpoint
ALTER TABLE "legacy_auth_permission" DROP CONSTRAINT "auth_permission_content_type_id_2f476e4b_fk_django_co";
--> statement-breakpoint
ALTER TABLE "legacy_authtoken_token" DROP CONSTRAINT "authtoken_token_user_id_35299eff_fk_accounts_user_id";
--> statement-breakpoint
ALTER TABLE "legacy_contests_contestmodel_discipline_set" DROP CONSTRAINT "contests_contestmode_contestmodel_id_9830ff33_fk_contests_";
--> statement-breakpoint
ALTER TABLE "legacy_contests_contestmodel_discipline_set" DROP CONSTRAINT "contests_contestmode_disciplinemodel_id_bb9f5499_fk_contests_";
--> statement-breakpoint
ALTER TABLE "legacy_contests_roundsessionmodel" DROP CONSTRAINT "contests_roundsessio_contest_id_e6fa066d_fk_contests_";
--> statement-breakpoint
ALTER TABLE "legacy_contests_roundsessionmodel" DROP CONSTRAINT "contests_roundsessio_discipline_id_0f555c24_fk_contests_";
--> statement-breakpoint
ALTER TABLE "legacy_contests_roundsessionmodel" DROP CONSTRAINT "contests_roundsessionmodel_user_id_3b33a5a3_fk_accounts_user_id";
--> statement-breakpoint
ALTER TABLE "legacy_contests_scramblemodel" DROP CONSTRAINT "contests_scramblemod_contest_id_d67db4b5_fk_contests_";
--> statement-breakpoint
ALTER TABLE "legacy_contests_scramblemodel" DROP CONSTRAINT "contests_scramblemod_discipline_id_7e00f2e1_fk_contests_";
--> statement-breakpoint
ALTER TABLE "legacy_contests_singleresultleaderboardmodel" DROP CONSTRAINT "contests_singleresul_solve_id_e45376e5_fk_contests_";
--> statement-breakpoint
ALTER TABLE "legacy_contests_solvemodel" DROP CONSTRAINT "contests_solvemodel_contest_id_98f20926_fk_contests_";
--> statement-breakpoint
ALTER TABLE "legacy_contests_solvemodel" DROP CONSTRAINT "contests_solvemodel_discipline_id_cb3f8e9b_fk_contests_";
--> statement-breakpoint
ALTER TABLE "legacy_contests_solvemodel" DROP CONSTRAINT "contests_solvemodel_round_session_id_abf6ee3b_fk_contests_";
--> statement-breakpoint
ALTER TABLE "legacy_contests_solvemodel" DROP CONSTRAINT "contests_solvemodel_scramble_id_b21e23aa_fk_contests_";
--> statement-breakpoint
ALTER TABLE "legacy_contests_solvemodel" DROP CONSTRAINT "contests_solvemodel_user_id_28200dba_fk_accounts_user_id";
--> statement-breakpoint
ALTER TABLE "legacy_contests_tnoodlescramblesmodel" DROP CONSTRAINT "contests_tnoodlescra_discipline_id_200a6a3a_fk_contests_";
--> statement-breakpoint
ALTER TABLE "legacy_django_admin_log" DROP CONSTRAINT "django_admin_log_content_type_id_c4bce8eb_fk_django_co";
--> statement-breakpoint
ALTER TABLE "legacy_django_admin_log" DROP CONSTRAINT "django_admin_log_user_id_c564eba6_fk_accounts_user_id";
--> statement-breakpoint
ALTER TABLE "legacy_socialaccount_socialaccount" DROP CONSTRAINT "socialaccount_social_user_id_8146e70c_fk_accounts_";
--> statement-breakpoint
ALTER TABLE "legacy_socialaccount_socialapp_sites" DROP CONSTRAINT "socialaccount_social_site_id_2579dee5_fk_django_si";
--> statement-breakpoint
ALTER TABLE "legacy_socialaccount_socialapp_sites" DROP CONSTRAINT "socialaccount_social_socialapp_id_97fb6e7d_fk_socialacc";
--> statement-breakpoint
ALTER TABLE "legacy_socialaccount_socialtoken" DROP CONSTRAINT "socialaccount_social_account_id_951f210e_fk_socialacc";
--> statement-breakpoint
ALTER TABLE "legacy_socialaccount_socialtoken" DROP CONSTRAINT "socialaccount_social_app_id_636a42d7_fk_socialacc";
--> statement-breakpoint
ALTER TABLE "legacy_account_emailaddress" ADD CONSTRAINT "account_emailaddress_user_id_2c513194_fk_accounts_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."legacy_accounts_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legacy_account_emailconfirmation" ADD CONSTRAINT "account_emailconfirm_email_address_id_5b7f8c58_fk_account_e" FOREIGN KEY ("email_address_id") REFERENCES "public"."legacy_account_emailaddress"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legacy_accounts_settingsmodel" ADD CONSTRAINT "accounts_settingsmodel_user_id_b5b21c0f_fk_accounts_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."legacy_accounts_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legacy_accounts_user_groups" ADD CONSTRAINT "accounts_user_groups_group_id_bd11a704_fk_auth_group_id" FOREIGN KEY ("group_id") REFERENCES "public"."legacy_auth_group"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legacy_accounts_user_groups" ADD CONSTRAINT "accounts_user_groups_user_id_52b62117_fk_accounts_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."legacy_accounts_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legacy_accounts_user_user_permissions" ADD CONSTRAINT "accounts_user_user_p_permission_id_113bb443_fk_auth_perm" FOREIGN KEY ("permission_id") REFERENCES "public"."legacy_auth_permission"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legacy_accounts_user_user_permissions" ADD CONSTRAINT "accounts_user_user_p_user_id_e4f0a161_fk_accounts_" FOREIGN KEY ("user_id") REFERENCES "public"."legacy_accounts_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legacy_auth_group_permissions" ADD CONSTRAINT "auth_group_permissio_permission_id_84c5c92e_fk_auth_perm" FOREIGN KEY ("permission_id") REFERENCES "public"."legacy_auth_permission"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legacy_auth_group_permissions" ADD CONSTRAINT "auth_group_permissions_group_id_b120cbf9_fk_auth_group_id" FOREIGN KEY ("group_id") REFERENCES "public"."legacy_auth_group"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legacy_auth_permission" ADD CONSTRAINT "auth_permission_content_type_id_2f476e4b_fk_django_co" FOREIGN KEY ("content_type_id") REFERENCES "public"."legacy_django_content_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legacy_authtoken_token" ADD CONSTRAINT "authtoken_token_user_id_35299eff_fk_accounts_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."legacy_accounts_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legacy_contests_contestmodel_discipline_set" ADD CONSTRAINT "contests_contestmode_contestmodel_id_9830ff33_fk_contests_" FOREIGN KEY ("contestmodel_id") REFERENCES "public"."legacy_contests_contestmodel"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legacy_contests_contestmodel_discipline_set" ADD CONSTRAINT "contests_contestmode_disciplinemodel_id_bb9f5499_fk_contests_" FOREIGN KEY ("disciplinemodel_id") REFERENCES "public"."legacy_contests_disciplinemodel"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legacy_contests_roundsessionmodel" ADD CONSTRAINT "contests_roundsessio_contest_id_e6fa066d_fk_contests_" FOREIGN KEY ("contest_id") REFERENCES "public"."legacy_contests_contestmodel"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legacy_contests_roundsessionmodel" ADD CONSTRAINT "contests_roundsessio_discipline_id_0f555c24_fk_contests_" FOREIGN KEY ("discipline_id") REFERENCES "public"."legacy_contests_disciplinemodel"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legacy_contests_roundsessionmodel" ADD CONSTRAINT "contests_roundsessionmodel_user_id_3b33a5a3_fk_accounts_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."legacy_accounts_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legacy_contests_scramblemodel" ADD CONSTRAINT "contests_scramblemod_contest_id_d67db4b5_fk_contests_" FOREIGN KEY ("contest_id") REFERENCES "public"."legacy_contests_contestmodel"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legacy_contests_scramblemodel" ADD CONSTRAINT "contests_scramblemod_discipline_id_7e00f2e1_fk_contests_" FOREIGN KEY ("discipline_id") REFERENCES "public"."legacy_contests_disciplinemodel"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legacy_contests_singleresultleaderboardmodel" ADD CONSTRAINT "contests_singleresul_solve_id_e45376e5_fk_contests_" FOREIGN KEY ("solve_id") REFERENCES "public"."legacy_contests_solvemodel"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legacy_contests_solvemodel" ADD CONSTRAINT "contests_solvemodel_contest_id_98f20926_fk_contests_" FOREIGN KEY ("contest_id") REFERENCES "public"."legacy_contests_contestmodel"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legacy_contests_solvemodel" ADD CONSTRAINT "contests_solvemodel_discipline_id_cb3f8e9b_fk_contests_" FOREIGN KEY ("discipline_id") REFERENCES "public"."legacy_contests_disciplinemodel"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legacy_contests_solvemodel" ADD CONSTRAINT "contests_solvemodel_round_session_id_abf6ee3b_fk_contests_" FOREIGN KEY ("round_session_id") REFERENCES "public"."legacy_contests_roundsessionmodel"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legacy_contests_solvemodel" ADD CONSTRAINT "contests_solvemodel_scramble_id_b21e23aa_fk_contests_" FOREIGN KEY ("scramble_id") REFERENCES "public"."legacy_contests_scramblemodel"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legacy_contests_solvemodel" ADD CONSTRAINT "contests_solvemodel_user_id_28200dba_fk_accounts_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."legacy_accounts_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legacy_contests_tnoodlescramblesmodel" ADD CONSTRAINT "contests_tnoodlescra_discipline_id_200a6a3a_fk_contests_" FOREIGN KEY ("discipline_id") REFERENCES "public"."legacy_contests_disciplinemodel"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legacy_django_admin_log" ADD CONSTRAINT "django_admin_log_content_type_id_c4bce8eb_fk_django_co" FOREIGN KEY ("content_type_id") REFERENCES "public"."legacy_django_content_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legacy_django_admin_log" ADD CONSTRAINT "django_admin_log_user_id_c564eba6_fk_accounts_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."legacy_accounts_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legacy_socialaccount_socialaccount" ADD CONSTRAINT "socialaccount_social_user_id_8146e70c_fk_accounts_" FOREIGN KEY ("user_id") REFERENCES "public"."legacy_accounts_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legacy_socialaccount_socialapp_sites" ADD CONSTRAINT "socialaccount_social_site_id_2579dee5_fk_django_si" FOREIGN KEY ("site_id") REFERENCES "public"."legacy_django_site"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legacy_socialaccount_socialapp_sites" ADD CONSTRAINT "socialaccount_social_socialapp_id_97fb6e7d_fk_socialacc" FOREIGN KEY ("socialapp_id") REFERENCES "public"."legacy_socialaccount_socialapp"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legacy_socialaccount_socialtoken" ADD CONSTRAINT "socialaccount_social_account_id_951f210e_fk_socialacc" FOREIGN KEY ("account_id") REFERENCES "public"."legacy_socialaccount_socialaccount"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legacy_socialaccount_socialtoken" ADD CONSTRAINT "socialaccount_social_app_id_636a42d7_fk_socialacc" FOREIGN KEY ("app_id") REFERENCES "public"."legacy_socialaccount_socialapp"("id") ON DELETE no action ON UPDATE no action;