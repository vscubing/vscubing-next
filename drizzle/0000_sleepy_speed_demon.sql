-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
CREATE TABLE "contests_solvemodel" (
	"id" bigint PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "contests_solvemodel_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"time_ms" integer,
	"is_dnf" boolean NOT NULL,
	"extra_id" integer,
	"submission_state" varchar(96) NOT NULL,
	"reconstruction" text,
	"contest_id" bigint NOT NULL,
	"discipline_id" bigint NOT NULL,
	"round_session_id" bigint NOT NULL,
	"scramble_id" bigint NOT NULL,
	"user_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contests_tnoodlescramblesmodel" (
	"id" bigint PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "contests_tnoodlescramblesmodel_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"moves" varchar(150) NOT NULL,
	"is_used" boolean NOT NULL,
	"discipline_id" bigint NOT NULL,
	CONSTRAINT "contests_tnoodlescramblesmodel_moves_key" UNIQUE("moves")
);
--> statement-breakpoint
CREATE TABLE "accounts_user" (
	"id" bigint PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "accounts_user_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"password" varchar(128) NOT NULL,
	"last_login" timestamp with time zone,
	"is_superuser" boolean NOT NULL,
	"username" varchar(20) NOT NULL,
	"email" varchar(255) NOT NULL,
	"is_verified" boolean NOT NULL,
	"is_active" boolean NOT NULL,
	"is_staff" boolean NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "accounts_user_username_key" UNIQUE("username"),
	CONSTRAINT "accounts_user_email_key" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "account_emailaddress" (
	"id" integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "account_emailaddress_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"email" varchar(254) NOT NULL,
	"verified" boolean NOT NULL,
	"primary" boolean NOT NULL,
	"user_id" bigint NOT NULL,
	CONSTRAINT "account_emailaddress_user_id_email_987c8728_uniq" UNIQUE("email","user_id")
);
--> statement-breakpoint
CREATE TABLE "account_emailconfirmation" (
	"id" integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "account_emailconfirmation_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created" timestamp with time zone NOT NULL,
	"sent" timestamp with time zone,
	"key" varchar(64) NOT NULL,
	"email_address_id" integer NOT NULL,
	CONSTRAINT "account_emailconfirmation_key_key" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "accounts_settingsmodel" (
	"id" bigint PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "accounts_settingsmodel_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"cstimer_inspection_voice_alert" varchar(10) NOT NULL,
	"cstimer_animation_duration" integer NOT NULL,
	"user_id" bigint NOT NULL,
	CONSTRAINT "accounts_settingsmodel_user_id_key" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "auth_group" (
	"id" integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "auth_group_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(150) NOT NULL,
	CONSTRAINT "auth_group_name_key" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "accounts_user_groups" (
	"id" bigint PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "accounts_user_groups_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" bigint NOT NULL,
	"group_id" integer NOT NULL,
	CONSTRAINT "accounts_user_groups_user_id_group_id_59c0b32f_uniq" UNIQUE("user_id","group_id")
);
--> statement-breakpoint
CREATE TABLE "auth_permission" (
	"id" integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "auth_permission_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"content_type_id" integer NOT NULL,
	"codename" varchar(100) NOT NULL,
	CONSTRAINT "auth_permission_content_type_id_codename_01ab375a_uniq" UNIQUE("content_type_id","codename")
);
--> statement-breakpoint
CREATE TABLE "accounts_user_user_permissions" (
	"id" bigint PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "accounts_user_user_permissions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" bigint NOT NULL,
	"permission_id" integer NOT NULL,
	CONSTRAINT "accounts_user_user_permi_user_id_permission_id_2ab516c2_uniq" UNIQUE("user_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "auth_group_permissions" (
	"id" bigint PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "auth_group_permissions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"group_id" integer NOT NULL,
	"permission_id" integer NOT NULL,
	CONSTRAINT "auth_group_permissions_group_id_permission_id_0cd325b0_uniq" UNIQUE("group_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "authtoken_token" (
	"key" varchar(40) PRIMARY KEY NOT NULL,
	"created" timestamp with time zone NOT NULL,
	"user_id" bigint NOT NULL,
	CONSTRAINT "authtoken_token_user_id_key" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "contests_contestmodel" (
	"id" bigint PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "contests_contestmodel_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"name" varchar(128) NOT NULL,
	"slug" varchar(128) NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone,
	"is_ongoing" boolean NOT NULL,
	CONSTRAINT "contests_contestmodel_name_key" UNIQUE("name"),
	CONSTRAINT "contests_contestmodel_slug_key" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "contests_contestmodel_discipline_set" (
	"id" bigint PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "contests_contestmodel_discipline_set_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"contestmodel_id" bigint NOT NULL,
	"disciplinemodel_id" bigint NOT NULL,
	CONSTRAINT "contests_contestmodel_di_contestmodel_id_discipli_e92e6323_uniq" UNIQUE("contestmodel_id","disciplinemodel_id")
);
--> statement-breakpoint
CREATE TABLE "contests_disciplinemodel" (
	"id" bigint PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "contests_disciplinemodel_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"name" varchar(128) NOT NULL,
	"slug" varchar(128) NOT NULL,
	CONSTRAINT "contests_disciplinemodel_name_key" UNIQUE("name"),
	CONSTRAINT "contests_disciplinemodel_slug_key" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "contests_roundsessionmodel" (
	"id" bigint PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "contests_roundsessionmodel_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"avg_ms" integer,
	"is_dnf" boolean NOT NULL,
	"is_finished" boolean NOT NULL,
	"contest_id" bigint NOT NULL,
	"discipline_id" bigint NOT NULL,
	"user_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contests_scramblemodel" (
	"id" bigint PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "contests_scramblemodel_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"position" varchar(10) NOT NULL,
	"moves" text NOT NULL,
	"is_extra" boolean NOT NULL,
	"contest_id" bigint NOT NULL,
	"discipline_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contests_singleresultleaderboardmodel" (
	"id" bigint PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "contests_singleresultleaderboardmodel_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"time_ms" integer NOT NULL,
	"solve_id" bigint NOT NULL,
	CONSTRAINT "contests_singleresultleaderboardmodel_solve_id_key" UNIQUE("solve_id")
);
--> statement-breakpoint
CREATE TABLE "django_migrations" (
	"id" bigint PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "django_migrations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"app" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"applied" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "django_session" (
	"session_key" varchar(40) PRIMARY KEY NOT NULL,
	"session_data" text NOT NULL,
	"expire_date" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "django_site" (
	"id" integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "django_site_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"domain" varchar(100) NOT NULL,
	"name" varchar(50) NOT NULL,
	CONSTRAINT "django_site_domain_a2e37b91_uniq" UNIQUE("domain")
);
--> statement-breakpoint
CREATE TABLE "django_admin_log" (
	"id" integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "django_admin_log_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"action_time" timestamp with time zone NOT NULL,
	"object_id" text,
	"object_repr" varchar(200) NOT NULL,
	"action_flag" smallint NOT NULL,
	"change_message" text NOT NULL,
	"content_type_id" integer,
	"user_id" bigint NOT NULL,
	CONSTRAINT "django_admin_log_action_flag_check" CHECK (action_flag >= 0)
);
--> statement-breakpoint
CREATE TABLE "socialaccount_socialaccount" (
	"id" integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "socialaccount_socialaccount_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"provider" varchar(200) NOT NULL,
	"uid" varchar(191) NOT NULL,
	"last_login" timestamp with time zone NOT NULL,
	"date_joined" timestamp with time zone NOT NULL,
	"extra_data" text NOT NULL,
	"user_id" bigint NOT NULL,
	CONSTRAINT "socialaccount_socialaccount_provider_uid_fc810c6e_uniq" UNIQUE("provider","uid")
);
--> statement-breakpoint
CREATE TABLE "socialaccount_socialapp_sites" (
	"id" bigint PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "socialaccount_socialapp_sites_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"socialapp_id" integer NOT NULL,
	"site_id" integer NOT NULL,
	CONSTRAINT "socialaccount_socialapp__socialapp_id_site_id_71a9a768_uniq" UNIQUE("socialapp_id","site_id")
);
--> statement-breakpoint
CREATE TABLE "django_content_type" (
	"id" integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "django_content_type_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"app_label" varchar(100) NOT NULL,
	"model" varchar(100) NOT NULL,
	CONSTRAINT "django_content_type_app_label_model_76bd3d3b_uniq" UNIQUE("app_label","model")
);
--> statement-breakpoint
CREATE TABLE "socialaccount_socialtoken" (
	"id" integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "socialaccount_socialtoken_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"token" text NOT NULL,
	"token_secret" text NOT NULL,
	"expires_at" timestamp with time zone,
	"account_id" integer NOT NULL,
	"app_id" integer,
	CONSTRAINT "socialaccount_socialtoken_app_id_account_id_fca4e0ac_uniq" UNIQUE("account_id","app_id")
);
--> statement-breakpoint
CREATE TABLE "socialaccount_socialapp" (
	"id" integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "socialaccount_socialapp_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"provider" varchar(30) NOT NULL,
	"name" varchar(40) NOT NULL,
	"client_id" varchar(191) NOT NULL,
	"secret" varchar(191) NOT NULL,
	"key" varchar(191) NOT NULL,
	"provider_id" varchar(200) NOT NULL,
	"settings" jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contests_solvemodel" ADD CONSTRAINT "contests_solvemodel_contest_id_98f20926_fk_contests_" FOREIGN KEY ("contest_id") REFERENCES "public"."contests_contestmodel"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contests_solvemodel" ADD CONSTRAINT "contests_solvemodel_discipline_id_cb3f8e9b_fk_contests_" FOREIGN KEY ("discipline_id") REFERENCES "public"."contests_disciplinemodel"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contests_solvemodel" ADD CONSTRAINT "contests_solvemodel_round_session_id_abf6ee3b_fk_contests_" FOREIGN KEY ("round_session_id") REFERENCES "public"."contests_roundsessionmodel"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contests_solvemodel" ADD CONSTRAINT "contests_solvemodel_scramble_id_b21e23aa_fk_contests_" FOREIGN KEY ("scramble_id") REFERENCES "public"."contests_scramblemodel"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contests_solvemodel" ADD CONSTRAINT "contests_solvemodel_user_id_28200dba_fk_accounts_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."accounts_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contests_tnoodlescramblesmodel" ADD CONSTRAINT "contests_tnoodlescra_discipline_id_200a6a3a_fk_contests_" FOREIGN KEY ("discipline_id") REFERENCES "public"."contests_disciplinemodel"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_emailaddress" ADD CONSTRAINT "account_emailaddress_user_id_2c513194_fk_accounts_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."accounts_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_emailconfirmation" ADD CONSTRAINT "account_emailconfirm_email_address_id_5b7f8c58_fk_account_e" FOREIGN KEY ("email_address_id") REFERENCES "public"."account_emailaddress"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts_settingsmodel" ADD CONSTRAINT "accounts_settingsmodel_user_id_b5b21c0f_fk_accounts_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."accounts_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts_user_groups" ADD CONSTRAINT "accounts_user_groups_group_id_bd11a704_fk_auth_group_id" FOREIGN KEY ("group_id") REFERENCES "public"."auth_group"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts_user_groups" ADD CONSTRAINT "accounts_user_groups_user_id_52b62117_fk_accounts_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."accounts_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_permission" ADD CONSTRAINT "auth_permission_content_type_id_2f476e4b_fk_django_co" FOREIGN KEY ("content_type_id") REFERENCES "public"."django_content_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts_user_user_permissions" ADD CONSTRAINT "accounts_user_user_p_permission_id_113bb443_fk_auth_perm" FOREIGN KEY ("permission_id") REFERENCES "public"."auth_permission"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts_user_user_permissions" ADD CONSTRAINT "accounts_user_user_p_user_id_e4f0a161_fk_accounts_" FOREIGN KEY ("user_id") REFERENCES "public"."accounts_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_group_permissions" ADD CONSTRAINT "auth_group_permissio_permission_id_84c5c92e_fk_auth_perm" FOREIGN KEY ("permission_id") REFERENCES "public"."auth_permission"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_group_permissions" ADD CONSTRAINT "auth_group_permissions_group_id_b120cbf9_fk_auth_group_id" FOREIGN KEY ("group_id") REFERENCES "public"."auth_group"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "authtoken_token" ADD CONSTRAINT "authtoken_token_user_id_35299eff_fk_accounts_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."accounts_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contests_contestmodel_discipline_set" ADD CONSTRAINT "contests_contestmode_contestmodel_id_9830ff33_fk_contests_" FOREIGN KEY ("contestmodel_id") REFERENCES "public"."contests_contestmodel"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contests_contestmodel_discipline_set" ADD CONSTRAINT "contests_contestmode_disciplinemodel_id_bb9f5499_fk_contests_" FOREIGN KEY ("disciplinemodel_id") REFERENCES "public"."contests_disciplinemodel"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contests_roundsessionmodel" ADD CONSTRAINT "contests_roundsessio_contest_id_e6fa066d_fk_contests_" FOREIGN KEY ("contest_id") REFERENCES "public"."contests_contestmodel"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contests_roundsessionmodel" ADD CONSTRAINT "contests_roundsessio_discipline_id_0f555c24_fk_contests_" FOREIGN KEY ("discipline_id") REFERENCES "public"."contests_disciplinemodel"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contests_roundsessionmodel" ADD CONSTRAINT "contests_roundsessionmodel_user_id_3b33a5a3_fk_accounts_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."accounts_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contests_scramblemodel" ADD CONSTRAINT "contests_scramblemod_contest_id_d67db4b5_fk_contests_" FOREIGN KEY ("contest_id") REFERENCES "public"."contests_contestmodel"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contests_scramblemodel" ADD CONSTRAINT "contests_scramblemod_discipline_id_7e00f2e1_fk_contests_" FOREIGN KEY ("discipline_id") REFERENCES "public"."contests_disciplinemodel"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contests_singleresultleaderboardmodel" ADD CONSTRAINT "contests_singleresul_solve_id_e45376e5_fk_contests_" FOREIGN KEY ("solve_id") REFERENCES "public"."contests_solvemodel"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "django_admin_log" ADD CONSTRAINT "django_admin_log_content_type_id_c4bce8eb_fk_django_co" FOREIGN KEY ("content_type_id") REFERENCES "public"."django_content_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "django_admin_log" ADD CONSTRAINT "django_admin_log_user_id_c564eba6_fk_accounts_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."accounts_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "socialaccount_socialaccount" ADD CONSTRAINT "socialaccount_social_user_id_8146e70c_fk_accounts_" FOREIGN KEY ("user_id") REFERENCES "public"."accounts_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "socialaccount_socialapp_sites" ADD CONSTRAINT "socialaccount_social_site_id_2579dee5_fk_django_si" FOREIGN KEY ("site_id") REFERENCES "public"."django_site"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "socialaccount_socialapp_sites" ADD CONSTRAINT "socialaccount_social_socialapp_id_97fb6e7d_fk_socialacc" FOREIGN KEY ("socialapp_id") REFERENCES "public"."socialaccount_socialapp"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "socialaccount_socialtoken" ADD CONSTRAINT "socialaccount_social_account_id_951f210e_fk_socialacc" FOREIGN KEY ("account_id") REFERENCES "public"."socialaccount_socialaccount"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "socialaccount_socialtoken" ADD CONSTRAINT "socialaccount_social_app_id_636a42d7_fk_socialacc" FOREIGN KEY ("app_id") REFERENCES "public"."socialaccount_socialapp"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "contests_solvemodel_contest_id_98f20926" ON "contests_solvemodel" USING btree ("contest_id" int8_ops);--> statement-breakpoint
CREATE INDEX "contests_solvemodel_created_at_57193ba0" ON "contests_solvemodel" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "contests_solvemodel_discipline_id_cb3f8e9b" ON "contests_solvemodel" USING btree ("discipline_id" int8_ops);--> statement-breakpoint
CREATE INDEX "contests_solvemodel_round_session_id_abf6ee3b" ON "contests_solvemodel" USING btree ("round_session_id" int8_ops);--> statement-breakpoint
CREATE INDEX "contests_solvemodel_scramble_id_b21e23aa" ON "contests_solvemodel" USING btree ("scramble_id" int8_ops);--> statement-breakpoint
CREATE INDEX "contests_solvemodel_user_id_28200dba" ON "contests_solvemodel" USING btree ("user_id" int8_ops);--> statement-breakpoint
CREATE INDEX "contests_tnoodlescramblesmodel_created_at_6655c02d" ON "contests_tnoodlescramblesmodel" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "contests_tnoodlescramblesmodel_discipline_id_200a6a3a" ON "contests_tnoodlescramblesmodel" USING btree ("discipline_id" int8_ops);--> statement-breakpoint
CREATE INDEX "contests_tnoodlescramblesmodel_moves_35d3f5a9_like" ON "contests_tnoodlescramblesmodel" USING btree ("moves" varchar_pattern_ops);--> statement-breakpoint
CREATE INDEX "accounts_user_email_b2644a56_like" ON "accounts_user" USING btree ("email" varchar_pattern_ops);--> statement-breakpoint
CREATE INDEX "accounts_user_username_6088629e_like" ON "accounts_user" USING btree ("username" varchar_pattern_ops);--> statement-breakpoint
CREATE INDEX "account_emailaddress_upper" ON "account_emailaddress" USING btree (upper((email)::text) text_ops);--> statement-breakpoint
CREATE INDEX "account_emailaddress_user_id_2c513194" ON "account_emailaddress" USING btree ("user_id" int8_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "unique_verified_email" ON "account_emailaddress" USING btree ("email" text_ops) WHERE verified;--> statement-breakpoint
CREATE INDEX "account_emailconfirmation_email_address_id_5b7f8c58" ON "account_emailconfirmation" USING btree ("email_address_id" int4_ops);--> statement-breakpoint
CREATE INDEX "account_emailconfirmation_key_f43612bd_like" ON "account_emailconfirmation" USING btree ("key" varchar_pattern_ops);--> statement-breakpoint
CREATE INDEX "accounts_settingsmodel_created_at_4e1ba83b" ON "accounts_settingsmodel" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "auth_group_name_a6ea08ec_like" ON "auth_group" USING btree ("name" varchar_pattern_ops);--> statement-breakpoint
CREATE INDEX "accounts_user_groups_group_id_bd11a704" ON "accounts_user_groups" USING btree ("group_id" int4_ops);--> statement-breakpoint
CREATE INDEX "accounts_user_groups_user_id_52b62117" ON "accounts_user_groups" USING btree ("user_id" int8_ops);--> statement-breakpoint
CREATE INDEX "auth_permission_content_type_id_2f476e4b" ON "auth_permission" USING btree ("content_type_id" int4_ops);--> statement-breakpoint
CREATE INDEX "accounts_user_user_permissions_permission_id_113bb443" ON "accounts_user_user_permissions" USING btree ("permission_id" int4_ops);--> statement-breakpoint
CREATE INDEX "accounts_user_user_permissions_user_id_e4f0a161" ON "accounts_user_user_permissions" USING btree ("user_id" int8_ops);--> statement-breakpoint
CREATE INDEX "auth_group_permissions_group_id_b120cbf9" ON "auth_group_permissions" USING btree ("group_id" int4_ops);--> statement-breakpoint
CREATE INDEX "auth_group_permissions_permission_id_84c5c92e" ON "auth_group_permissions" USING btree ("permission_id" int4_ops);--> statement-breakpoint
CREATE INDEX "authtoken_token_key_10f0b77e_like" ON "authtoken_token" USING btree ("key" varchar_pattern_ops);--> statement-breakpoint
CREATE INDEX "contests_contestmodel_created_at_fa7b00bb" ON "contests_contestmodel" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "contests_contestmodel_name_b8960dcf_like" ON "contests_contestmodel" USING btree ("name" varchar_pattern_ops);--> statement-breakpoint
CREATE INDEX "contests_contestmodel_slug_dc960f39_like" ON "contests_contestmodel" USING btree ("slug" varchar_pattern_ops);--> statement-breakpoint
CREATE INDEX "contests_contestmodel_disc_disciplinemodel_id_bb9f5499" ON "contests_contestmodel_discipline_set" USING btree ("disciplinemodel_id" int8_ops);--> statement-breakpoint
CREATE INDEX "contests_contestmodel_discipline_set_contestmodel_id_9830ff33" ON "contests_contestmodel_discipline_set" USING btree ("contestmodel_id" int8_ops);--> statement-breakpoint
CREATE INDEX "contests_disciplinemodel_created_at_df13f068" ON "contests_disciplinemodel" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "contests_disciplinemodel_name_dd3cb06b_like" ON "contests_disciplinemodel" USING btree ("name" varchar_pattern_ops);--> statement-breakpoint
CREATE INDEX "contests_disciplinemodel_slug_4a7f3518_like" ON "contests_disciplinemodel" USING btree ("slug" varchar_pattern_ops);--> statement-breakpoint
CREATE INDEX "contests_roundsessionmodel_contest_id_e6fa066d" ON "contests_roundsessionmodel" USING btree ("contest_id" int8_ops);--> statement-breakpoint
CREATE INDEX "contests_roundsessionmodel_created_at_07fea56f" ON "contests_roundsessionmodel" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "contests_roundsessionmodel_discipline_id_0f555c24" ON "contests_roundsessionmodel" USING btree ("discipline_id" int8_ops);--> statement-breakpoint
CREATE INDEX "contests_roundsessionmodel_user_id_3b33a5a3" ON "contests_roundsessionmodel" USING btree ("user_id" int8_ops);--> statement-breakpoint
CREATE INDEX "contests_scramblemodel_contest_id_d67db4b5" ON "contests_scramblemodel" USING btree ("contest_id" int8_ops);--> statement-breakpoint
CREATE INDEX "contests_scramblemodel_created_at_4546f9f0" ON "contests_scramblemodel" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "contests_scramblemodel_discipline_id_7e00f2e1" ON "contests_scramblemodel" USING btree ("discipline_id" int8_ops);--> statement-breakpoint
CREATE INDEX "contests_singleresultleaderboardmodel_time_ms_819a540a" ON "contests_singleresultleaderboardmodel" USING btree ("time_ms" int4_ops);--> statement-breakpoint
CREATE INDEX "django_session_expire_date_a5c62663" ON "django_session" USING btree ("expire_date" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "django_session_session_key_c0390e0f_like" ON "django_session" USING btree ("session_key" varchar_pattern_ops);--> statement-breakpoint
CREATE INDEX "django_site_domain_a2e37b91_like" ON "django_site" USING btree ("domain" varchar_pattern_ops);--> statement-breakpoint
CREATE INDEX "django_admin_log_content_type_id_c4bce8eb" ON "django_admin_log" USING btree ("content_type_id" int4_ops);--> statement-breakpoint
CREATE INDEX "django_admin_log_user_id_c564eba6" ON "django_admin_log" USING btree ("user_id" int8_ops);--> statement-breakpoint
CREATE INDEX "socialaccount_socialaccount_user_id_8146e70c" ON "socialaccount_socialaccount" USING btree ("user_id" int8_ops);--> statement-breakpoint
CREATE INDEX "socialaccount_socialapp_sites_site_id_2579dee5" ON "socialaccount_socialapp_sites" USING btree ("site_id" int4_ops);--> statement-breakpoint
CREATE INDEX "socialaccount_socialapp_sites_socialapp_id_97fb6e7d" ON "socialaccount_socialapp_sites" USING btree ("socialapp_id" int4_ops);--> statement-breakpoint
CREATE INDEX "socialaccount_socialtoken_account_id_951f210e" ON "socialaccount_socialtoken" USING btree ("account_id" int4_ops);--> statement-breakpoint
CREATE INDEX "socialaccount_socialtoken_app_id_636a42d7" ON "socialaccount_socialtoken" USING btree ("app_id" int4_ops);
