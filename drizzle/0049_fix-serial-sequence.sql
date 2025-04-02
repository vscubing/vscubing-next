-- Custom SQL migration file, put your code below! --
SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('"round_session"', 'id')), (SELECT (MAX("id") + 1) FROM "round_session"), FALSE);
SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('"solve"', 'id')), (SELECT (MAX("id") + 1) FROM "solve"), FALSE);
