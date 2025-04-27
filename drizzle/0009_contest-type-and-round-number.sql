ALTER TABLE "contest" ADD COLUMN "type" text;
UPDATE "contest" SET "type" = 'weekly' WHERE "type" IS NULL;
ALTER TABLE "contest" ALTER COLUMN "type" SET NOT NULL;
ALTER TABLE "round" ADD COLUMN "number" integer;