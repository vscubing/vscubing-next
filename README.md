# <img src="https://vscubing.com/favicon.svg" width="35px" /> vscubing next

This repository is home to [@vscubing](https://github.com/vscubing)'s fullstack app.

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
5. (Optional) [vscubing/vscubing-cron](https://github.com/vscubing/vscubing-cron) is required for cron jobs (e.g. scheduled contest creation).
6. Run the project: `bun run dev`

## Deploying

The application is hosted on Hetzner with `Dokploy`.

### Environments

- production: deployed from `main` (pushing directly is restricted, only PRs are allowed, which require CI checks to pass)
  - Next.js app
  - postgres db
    - S3 backups (daily)
  - [vscubing/vscubing-tnoodle](https://github.com/vscubing/vscubing-tnoodle)
  - [vscubing/vscubing-cron](https://github.com/vscubing/vscubing-cron)
    - automatic publishing of new weekly contests (currently disabled because it doesn't work and doing it by hand is easier than fixing it)

- staging: deployed from `dev`
  - Next.js app
  - postgres db
  - [vscubing/vscubing-tnoodle](https://github.com/vscubing/vscubing-tnoodle)

## Socket-server
- Setup a Domain: Host is same as Next server's, path: /api/socket.io (need the same subdomain for Https Secure cookie, can't use next rewrites because they don't work with sockets)

### Notes

- apparently, ghcr.io doesn't support fine-grained access tokens, so you have to create a "Classic" token
- when setting up a S3 Destination in Dockploy, use the format "region.digitaloceanspaces.com" for the endpoint
- when setting up Provider (docker image) with ghcr in Dockploy, set Docker Image to `ghcr.io/vscubing/vscubing-next` and registry url to `ghcr.io`
- when setting up a staging db next to the production one, make sure to use different ports
- use `ssh -L REMOTE_PORT:localhost:LOCAL_PORT user@remote` to port to local a port from staging/production (for example, to debug a db via drizzle studio)
- to start a local soketi server for live solves, run `docker run -p 6001:6001 -p 9601:9601 quay.io/soketi/soketi:1.4-16-debian`
