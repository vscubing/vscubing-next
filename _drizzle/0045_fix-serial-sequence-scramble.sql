-- Custom SQL migration file, put your code below! --
SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('"scramble"', 'id')), (SELECT (MAX("id") + 1) FROM "scramble"), FALSE);
