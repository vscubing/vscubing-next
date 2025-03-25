-- Custom SQL migration file, put your code below! --
INSERT INTO
  "contest" ("id", "name", "startDate", "endDate", "isOngoing")
SELECT
  "id",
  "name",
  "start_date",
  "end_date",
  "is_ongoing"
FROM
  "legacy_contests_contestmodel";

--> statement-breakpoint

