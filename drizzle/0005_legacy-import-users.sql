-- Custom SQL migration file, put your code below! --
INSERT INTO
  "user" ("id", "name", "email", "createdAt", "isVerified")
SELECT
  "id",
  "username",
  "email",
  "created_at",
  "is_verified"
FROM
  legacy_accounts_user;
