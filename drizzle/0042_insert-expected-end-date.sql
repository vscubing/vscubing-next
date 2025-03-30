-- Custom SQL migration file, put your code below! --
UPDATE contest
SET expected_end_date = b.end_date
FROM contest a
INNER JOIN contest b ON a.slug = b.slug
