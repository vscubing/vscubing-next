ALTER TABLE "legacy_accounts_user" DROP CONSTRAINT "accounts_user_username_key";--> statement-breakpoint
DROP INDEX "accounts_user_username_6088629e_like";--> statement-breakpoint
ALTER TABLE "legacy_accounts_user" DROP COLUMN "last_login";--> statement-breakpoint
ALTER TABLE "legacy_accounts_user" DROP COLUMN "is_superuser";--> statement-breakpoint
ALTER TABLE "legacy_accounts_user" DROP COLUMN "is_active";--> statement-breakpoint
ALTER TABLE "legacy_accounts_user" DROP COLUMN "is_staff";--> statement-breakpoint
ALTER TABLE "legacy_accounts_user" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "legacy_accounts_user" ADD CONSTRAINT "accounts_user_name_key" UNIQUE("username");