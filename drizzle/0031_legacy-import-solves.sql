-- Custom SQL migration file, put your code below! --
INSERT INTO "solve" ("createdAt", "updatedAt", "id", "scrambleId", "roundSessionId", "state", "timeMs", "isDnf", "reconstruction")
SELECT
  created_at,
  updated_at,
  id,
  scramble_id,
  round_session_id,
  CAST(submission_state as "solveState"),
  time_ms,
  is_dnf,
  reconstruction
FROM
  "legacy_contests_solvemodel"
