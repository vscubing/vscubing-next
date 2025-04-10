-- Custom SQL migration file, put your code below! --
UPDATE "contest_discipline"
SET
  "contestSlug" = subquery.slug
FROM 
  (
    SELECT "id", "slug" FROM "contest"
  ) AS subquery
WHERE
  "contestId" = subquery.id
