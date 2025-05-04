-- Custom SQL migration file, put your code below! --
UPDATE user_simulator_settings SET colorscheme = NULL;
ALTER TABLE "user_simulator_settings" ALTER COLUMN "colorscheme" SET DATA TYPE json USING "colorscheme"::json;
