-- Custom SQL migration file, put your code below! --
INSERT INTO
  "contest" ("id", "slug", "startDate", "endDate", "isOngoing", "createdAt", "updatedAt")
SELECT
  "id",
  "slug",
  "start_date",
  "end_date",
  "is_ongoing",
  "created_at",
  "updated_at"
FROM
  "legacy_contests_contestmodel";
