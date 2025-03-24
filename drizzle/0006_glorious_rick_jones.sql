ALTER TABLE "legacy_accounts_user" RENAME COLUMN "username" TO "name";--> statement-breakpoint
ALTER TABLE "legacy_accounts_user" DROP CONSTRAINT "accounts_user_name_key";--> statement-breakpoint
ALTER TABLE "legacy_accounts_user" ADD CONSTRAINT "accounts_user_name_key" UNIQUE("name");