-- Custom SQL migration file, put your code below! --
INSERT INTO
  "discipline" ("name")
SELECT
  "name"
FROM
  "legacy_contests_disciplinemodel";

