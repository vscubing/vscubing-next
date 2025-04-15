# 🚧 WIP 🚧  <img src="https://vscubing.com/favicon.svg" width="35px" /> vscubing next

This is a fullstack port of [@vscubing](https://github.com/vscubing) that is meant to replace [@vscubing/vscubing-frontend](https://github.com/vscubing/vscubing-frontend) and [@vscubing/vscubing-backend](https://github.com/vscubing/vscubing-backend).

[vscubing.com](https://vscubing.com): The platform for competing in virtual speedcubing: the art of solving twisty puzzles (like the Rubik's Cube) via a computer emulator controlled from the keyboard as fast as possible. For more detailed information refer to the [landing page](https://vscubing.com/landing).

## Development

### Local setup

1. Add environment variables to `.env` (use `.env.example`, some of the variables are already set there)
2. You need a local DB to run the project locally. Run `bun run db:local` to create a docker container for it. This script automatically sources `.env`. Make sure to have started a docker daemon, e.g. `Docker Desktop`. After spinning up a local database you can run `bun run db:migrate-no-legacy` for the initial migrations.
3. (Optional) Alternatively you can migrate with `bun run db:migrate`, but you would have to import a database backup first:
    ```bash
    pg_restore -d $DATABASE_URL --no-owner path/to/backup.sql
    ```
<!-- 4. (Optional) Scramble generation relies on [tnoodle-cli](https://github.com/SpeedcuberOSS/tnoodle-cli). To be able to generate scrambles locally, you need to install it with `bun run vendor` first. --> <!-- TODO: update with vscubing-tnoodle -->
5. Run the project: `bun run dev`
<!-- TODO: vscubing-cron -->

## Deploying

We deploy on a `DigitalOcean` Droplet with `Dokploy`. 

### Environments

- production: deployed from `main` (pushing directly is restricted, only PRs are allowed, which require CI checks to pass)
    * Next.js app
        + new contests are automatically published weekly via `./github/workflows/contest-management.yaml`
    * postgres db
        + S3 backups (daily)
- staging: deployed from `dev`
    * Next.js app
    * postgres db

### Notes

- apparently, ghcr.io doesn't support fine-grained access tokens, so you have to create a "Classic" token 
- post-deployment: `bun run db:migrate && bun run start`
