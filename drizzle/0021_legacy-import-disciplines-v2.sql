UPDATE "discipline"
SET
  "createdAt" = subquery."created_at",
  "updatedAt" = subquery."updated_at"
FROM
  (
    SELECT
      "slug",
      "created_at",
      "updated_at"
    FROM
      "legacy_contests_disciplinemodel"
  ) AS subquery
WHERE
  "discipline"."slug" = subquery."slug";
