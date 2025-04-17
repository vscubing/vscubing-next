# 🚧 WIP 🚧  <img src="https://vscubing.com/favicon.svg" width="35px" /> vscubing next

This is a fullstack port of [@vscubing](https://github.com/vscubing) that is meant to replace [@vscubing/vscubing-frontend](https://github.com/vscubing/vscubing-frontend) and [@vscubing/vscubing-backend](https://github.com/vscubing/vscubing-backend).

[vscubing.com](https://vscubing.com): The platform for competing in virtual speedcubing: the art of solving twisty puzzles (like the Rubik's Cube) via a computer emulator controlled from the keyboard as fast as possible. For more detailed information refer to the [landing page](https://vscubing.com/landing).

## Development

### Local setup

1. Add environment variables to `.env` (see `.env.example`)
2. You need a local DB to run the project locally. Run `bun run db:local` to create a docker container for it. This script automatically sources `.env`. Make sure to have started a docker daemon, e.g. `Docker Desktop`. After spinning up a local database you can run `bun run db:migrate-no-legacy` for the initial migrations.
3. (Optional) Alternatively you can migrate with `bun run db:migrate`, but you would have to import a database backup first:
    ```bash
    psql $DATABASE_URL -f path/to/backup.sql
    ```
4. (Optional) [vscubing/vscubing-tnoodle](https://github.com/vscubing/vscubing-tnoodle) is required for scramble generation. Alternatively, you could opt into "easy scrambles" on scramble creation
4. (Optional) [vscubing/vscubing-cron](https://github.com/vscubing/vscubing-cron) is required for cron jobs (e.g. scheduled contest creation).
5. Run the project: `bun run dev`

## Deploying

The application is hosted on a `DigitalOcean` Droplet with `Dokploy`. 

### Environments

- production: deployed from `main` (pushing directly is restricted, only PRs are allowed, which require CI checks to pass)
    * Next.js app
        + new contests are automatically published weekly via `./github/workflows/contest-management.yaml`
    * postgres db
        + S3 backups (daily)
    * [vscubing/vscubing-tnoodle](https://github.com/vscubing/vscubing-tnoodle)
    * [vscubing/vscubing-cron](https://github.com/vscubing/vscubing-cron)

- staging: deployed from `dev`
    * Next.js app
    * postgres db
    * [vscubing/vscubing-tnoodle](https://github.com/vscubing/vscubing-tnoodle)

### Notes

- apparently, ghcr.io doesn't support fine-grained access tokens, so you have to create a "Classic" token 
- when setting up a S3 Destination in Dockploy, use the format "region.digitaloceanspaces.com" for the endpoint
- when setting up Provider(docker image) with ghcr in Dockploy, set Docker Image to "ghcr.io/vscubing/vscubing-next" and registry url to "ghcr.io"
- when setting up a staging db next to the production one, make sure to use different ports
