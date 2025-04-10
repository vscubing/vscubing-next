-- Custom SQL migration file, put your code below! --
INSERT INTO
  "contest_discipline" ("id", "contestId", "disciplineSlug", "createdAt", "updatedAt")
SELECT
  t1."id",
  t1."contestmodel_id",
  t2."slug",
  t2."created_at",
  t2."updated_at"
FROM
  "legacy_contests_contestmodel_discipline_set" AS t1
  JOIN "legacy_contests_disciplinemodel" AS t2 ON t1."disciplinemodel_id" = t2."id";

