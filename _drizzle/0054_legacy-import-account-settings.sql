-- Custom SQL migration file, put your code below! --
INSERT INTO 
	user_simulator_settings (created_at, updated_at, user_id, animation_duration, inspection_voice_alert)
SELECT
	las.created_at, las.updated_at, las.user_id, las.cstimer_animation_duration, las.cstimer_inspection_voice_alert
FROM legacy_accounts_settingsmodel as las
