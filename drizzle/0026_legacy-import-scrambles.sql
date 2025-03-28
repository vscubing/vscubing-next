-- -- Custom SQL migration file, put your code below! --
-- INSERT INTO
--   "scrambles" ("id", "createdAt", "updatedAt", "position", "moves")
-- SELECT
--   "id",
--   "created_at",
--   "updated_at",
--   "position",
--   "moves"
-- FROM
--   "legacy_contests_scramblemodel";

-- Insert into scrambles table with data from legacy table
INSERT INTO "scramble" ("id", "createdAt", "updatedAt", "position", "moves", "contestDisciplineId")
SELECT
  lcs."id",
  lcs."created_at",
  lcs."updated_at",
  CAST(lcs."position" as "scramblePosition"),
  lcs."moves",
  cd.id --linking the contestDisciplineId
FROM
  "legacy_contests_scramblemodel" lcs
JOIN
  "legacy_contests_disciplinemodel" lcd ON lcs.discipline_id = lcd.id
JOIN
  "contest_discipline" cd ON lcs.contest_id = cd."contestId" AND lcd.slug = cd."disciplineSlug"
