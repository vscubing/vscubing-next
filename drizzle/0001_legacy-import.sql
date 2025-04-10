-- Custom SQL migration file, put your code below! --
INSERT INTO
  "discipline" ("slug")
SELECT
  "name"
FROM
  "contests_disciplinemodel";

-- Custom SQL migration file, put your code below! --
INSERT INTO
  "user" ("id", "name", "email", "created_at", "updated_at", "finished_registration")
SELECT
  "id",
  "username",
  "email",
  "created_at",
  "updated_at",
  "is_verified"
FROM
  accounts_user;

-- Custom SQL migration file, put your code below! --
INSERT INTO
  "contest" ("slug", "start_date", "expected_end_date", "end_date", "is_ongoing", "created_at", "updated_at")
SELECT
  "slug",
  "start_date",
  "end_date",
  "end_date",
  "is_ongoing",
  "created_at",
  "updated_at"
FROM
  "contests_contestmodel";
UPDATE "discipline"
SET
  "created_at" = subquery."created_at",
  "updated_at" = subquery."updated_at"
FROM
  (
    SELECT
      "slug",
      "created_at",
      "updated_at"
    FROM
      "contests_disciplinemodel"
  ) AS subquery
WHERE
  "discipline"."slug" = subquery."slug";
-- Custom SQL migration file, put your code below! --

INSERT INTO
  "round" ("id", "contest_slug", "discipline_slug", "created_at", "updated_at")
SELECT
  t1."id",
  t3."slug",
  t2."slug",
  t2."created_at",
  t2."updated_at"
FROM
  "contests_contestmodel_discipline_set" AS t1
  JOIN "contests_disciplinemodel" AS t2 ON t1."disciplinemodel_id" = t2."id"
  JOIN "contests_contestmodel" AS t3 ON t1."contestmodel_id" = t3."id";

-- Insert into scrambles table with data from legacy table
INSERT INTO "scramble" ("id", "created_at", "updated_at", "position", "moves", "round_id")
SELECT
  lcs."id",
  lcs."created_at",
  lcs."updated_at",
  lcs."position",
  lcs."moves",
  rnd.id --linking the round_id
FROM
  "contests_scramblemodel" lcs
JOIN
  "contests_disciplinemodel" lcd ON lcs.discipline_id = lcd.id
JOIN "contests_contestmodel" AS lcc ON lcs."contest_id" = lcc."id"
JOIN
  "round" rnd ON lcc.slug = rnd."contest_slug" AND lcd.slug = rnd."discipline_slug";

-- Custom SQL migration file, put your code below! --
INSERT INTO "round_session" ("id", "created_at", "updated_at", "avg_ms", "is_dnf", "is_finished", "round_id", "contestant_id")
SELECT
  rsm."id",
  rsm."created_at",
  rsm."updated_at",
  rsm.avg_ms,
  rsm.is_dnf,
  rsm.is_finished,
  rnd.id,
  rsm.user_id
FROM
  "contests_roundsessionmodel" rsm
JOIN
  "contests_disciplinemodel" lcd ON lcd.id = rsm.discipline_id
JOIN "contests_contestmodel" AS lcc ON rsm."contest_id" = lcc."id"
JOIN
  "round" rnd ON rnd."contest_slug" = lcc."slug" AND rnd."discipline_slug" = lcd.slug;

-- Custom SQL migration file, put your code below! --
INSERT INTO "solve" ("created_at", "updated_at", "id", "scramble_id", "round_session_id", "status", "time_ms", "is_dnf", "solution")
SELECT
  created_at,
  updated_at,
  id,
  scramble_id,
  round_session_id,
  submission_state,
  time_ms,
  is_dnf,
  reconstruction
FROM
  "contests_solvemodel";

-- Custom SQL migration file, put your code below! --
SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('"scramble"', 'id')), (SELECT (MAX("id") + 1) FROM "scramble"), FALSE);
SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('"round"', 'id')), (SELECT (MAX("id") + 1) FROM "round"), FALSE);
SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('"round_session"', 'id')), (SELECT (MAX("id") + 1) FROM "round_session"), FALSE);
SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('"solve"', 'id')), (SELECT (MAX("id") + 1) FROM "solve"), FALSE);

INSERT INTO 
	user_simulator_settings (created_at, updated_at, user_id, animation_duration, inspection_voice_alert)
SELECT
	las.created_at, las.updated_at, las.user_id, las.cstimer_animation_duration, las.cstimer_inspection_voice_alert
FROM accounts_settingsmodel as las;

DROP TABLE "contests_solvemodel" CASCADE;
DROP TABLE "contests_tnoodlescramblesmodel" CASCADE;
DROP TABLE "accounts_user" CASCADE;
DROP TABLE "account_emailaddress" CASCADE;
DROP TABLE "account_emailconfirmation" CASCADE;
DROP TABLE "accounts_settingsmodel" CASCADE;
DROP TABLE "auth_group" CASCADE;
DROP TABLE "accounts_user_groups" CASCADE;
DROP TABLE "auth_permission" CASCADE;
DROP TABLE "accounts_user_user_permissions" CASCADE;
DROP TABLE "auth_group_permissions" CASCADE;
DROP TABLE "authtoken_token" CASCADE;
DROP TABLE "contests_contestmodel" CASCADE;
DROP TABLE "contests_contestmodel_discipline_set" CASCADE;
DROP TABLE "contests_disciplinemodel" CASCADE;
DROP TABLE "contests_roundsessionmodel" CASCADE;
DROP TABLE "contests_scramblemodel" CASCADE;
DROP TABLE "contests_singleresultleaderboardmodel" CASCADE;
DROP TABLE "django_migrations" CASCADE;
DROP TABLE "django_session" CASCADE;
DROP TABLE "django_site" CASCADE;
DROP TABLE "django_admin_log" CASCADE;
DROP TABLE "socialaccount_socialaccount" CASCADE;
DROP TABLE "socialaccount_socialapp_sites" CASCADE;
DROP TABLE "django_content_type" CASCADE;
DROP TABLE "socialaccount_socialtoken" CASCADE;
DROP TABLE "socialaccount_socialapp" CASCADE;
