# 🚧 WIP 🚧  <img src="https://vscubing.com/favicon.svg" width="35px" /> vscubing next

This is a fullstack port of [@vscubing](https://github.com/vscubing) that is meant to replace [@vscubing/vscubing-frontend](https://github.com/vscubing/vscubing-frontend) and [@vscubing/vscubing-backend](https://github.com/vscubing/vscubing-backend).

Vscubing is contest platform to compete in virtual speedcubing: the art of solving twisty puzzles (like the Rubik's Cube) via a computer emulator controlled from the keyboard as fast as possible. For more detailed information refer to the [landing page](https://vscubing.com/landing).

## Development

### Local setup

- Add environment variables to `.env` (use `.env.example`, some of the variables are already set there)
- You need a local DB to run the project locally. Run `./start-database.sh` to create a docker container for it. This script automatically sources `.env`. Make sure to have a docker daemon, e.g. `Docker Desktop`. After creating a database you have to temporarily uncomment the initial migration in `./drizzle/0000_sleepy_speed_demon.sql`, run `bun run db:migrate` once and then comment the initial migration out again.
- (Optional) Import a database backup:
    ```bash
    pg_restore -d $DATABASE_URL --verbose --no-owner ~/temp/vscubing-21.03.2025.sql 
    ```
- (Optional) Scramble generation relies on [tnoodle-cli](https://github.com/SpeedcuberOSS/tnoodle-cli). To be able to generate scrambles locally, you need to install it with `bun run vendor` first. Note: the script was only tested on WSL.
- Run the project: `bun run dev`

### Deploying

- apparently, ghcr.io doesn't support fine-grained access tokens, so you have to create a "Classic" token and [manually login in the ssh](https://coolify.io/docs/knowledge-base/docker/registry#docker-credentials). also see this [issue](https://github.com/docker/docker-credential-helpers/issues/182#issuecomment-1898955055).
- `pg_restore --no-owner -d 'CONNECTION_STRING' BACKUP_PATH` to import the db backup
- post-deployment: `bun run db:migrate`
