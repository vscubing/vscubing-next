ALTER TABLE "solve" ADD COLUMN "plus_two_included" boolean;

UPDATE solve
SET plus_two_included = false
WHERE plus_two_included IS NULL;
