-- Custom SQL migration file, put your code below! --
UPDATE contest a
SET expected_end_date = b.end_date
FROM contest b
WHERE a.slug = b.slug
