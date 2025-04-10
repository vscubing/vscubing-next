-- Custom SQL migration file, put your code below! --
INSERT INTO "roundSession" ("id", "createdAt", "updatedAt", "avgMs", "isDnf", "isFinished", "contestDisciplineId", "contestantId")
SELECT
  rsm."id",
  rsm."created_at",
  rsm."updated_at",
  rsm.avg_ms,
  rsm.is_dnf,
  rsm.is_finished,
  cd.id,
  rsm.user_id
FROM
  "legacy_contests_roundsessionmodel" rsm
JOIN
  "legacy_contests_disciplinemodel" lcd ON lcd.id = rsm.discipline_id
JOIN
  "contest_discipline" cd ON cd."contestId" = rsm."contest_id" AND cd."disciplineSlug" = lcd.slug
