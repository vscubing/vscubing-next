ALTER TABLE "user" ALTER COLUMN "name" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "name" DROP NOT NULL;
UPDATE "user" SET "name" = NULL WHERE "name" = '';
CREATE UNIQUE INDEX "user_name_unique_ci" ON "user" USING btree (lower("name"));
