-- 1. Add the column without NOT NULL
ALTER TABLE "contest"
ADD COLUMN "type" text;

-- 2. Backfill existing rows
UPDATE "contest"
SET "type" = 'weekly'
WHERE "type" IS NULL;

-- 3. Add the NOT NULL constraint
ALTER TABLE "contest"
ALTER COLUMN "type" SET NOT NULL;
