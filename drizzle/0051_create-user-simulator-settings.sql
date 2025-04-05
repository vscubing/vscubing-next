-- Custom SQL migration file, put your code below! --
WITH inserted_simulator_settings AS (
  INSERT INTO "user_simulator_settings" ("updated_at")
	VALUES(CURRENT_TIMESTAMP)
  RETURNING id
)
UPDATE "user"
SET simulator_settings_id = inserted_simulator_settings.id
FROM inserted_simulator_settings
