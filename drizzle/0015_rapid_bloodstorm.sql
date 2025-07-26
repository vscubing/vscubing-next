ALTER TABLE "user_metadata" ADD COLUMN "seenDiscordInvite" boolean;--> statement-breakpoint
ALTER TABLE "user_metadata" ADD CONSTRAINT "user_metadata_user_id_unique" UNIQUE("user_id");