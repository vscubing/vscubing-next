-- Custom SQL migration file, put your code below! --
SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('"contest_discipline"', 'id')), (SELECT (MAX("id") + 1) FROM "contest_discipline"), FALSE);
