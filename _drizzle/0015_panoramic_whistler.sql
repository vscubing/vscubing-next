ALTER TABLE "user" RENAME COLUMN "isVerified" TO "finishedRegistration";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "name" SET NOT NULL;