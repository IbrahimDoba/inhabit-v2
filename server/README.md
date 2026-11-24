# DragonDen Garden API

The backend for the DragonDen Garden app: accounts (sign in with a 6-digit email code) and a
cloud save per account. Node 22, Hono, Better Auth, Drizzle, Postgres.

## Endpoints

| Method | Path | What it does |
| --- | --- | --- |
| GET | `/health` | `{"ok":true}` when the server and database are up |
| POST | `/api/auth/email-otp/send-verification-otp` | Emails a sign-in code (`{"email","type":"sign-in"}`) |
| POST | `/api/auth/sign-in/email-otp` | Signs in with the code (`{"email","otp"}`); creates the account the first time |
| * | `/api/auth/*` | Everything else from Better Auth: session, sign-out, delete account |
| GET | `/v1/me` | The signed-in account |
| GET | `/v1/save` | The account's cloud save: `{data, version, updatedAt}` (`data: null` before the first) |
| PUT | `/v1/save` | Saves `{data, baseVersion}`. Answers 409 with the newer copy if another phone saved since `baseVersion` |

`/v1/*` needs a signed-in session (the app sends Better Auth's cookie).

## Deploy on Dokploy

1. **Project**: create a project, e.g. "DragonDen Garden".
2. **Database**: in the project, *Create Service → Database → PostgreSQL*. Name it
   `inhabit-db`, database name `inhabit`, pick a user and a strong password, then
   *Deploy*. Copy its **Internal Connection URL** (starts with `postgresql://`).
3. **Application**: *Create Service → Application*, name it `inhabit-api`.
   - *Provider*: GitHub, repository `IbrahimDoba/inhabit-v2`, branch `main`.
   - *Build Path*: `/server`
   - *Build Type*: Dockerfile, Docker File `Dockerfile`.
4. **Environment** (the app's *Environment* tab):

   ```
   NODE_ENV=production
   DATABASE_URL=<Internal Connection URL from step 2>
   BETTER_AUTH_SECRET=<output of: openssl rand -base64 32>
   BETTER_AUTH_URL=https://api.yourdomain.com
   APP_SCHEME=inhabit
   # Optional until real emails are needed; without it codes appear in the app's logs.
   SMTP_URL=smtps://user:password@smtp.yourmail.com:465
   MAIL_FROM=DragonDen Garden <no-reply@yourdomain.com>
   ```

5. **Domain**: *Domains → Add Domain*, host `api.yourdomain.com`, container port
   `3000`, HTTPS on, certificate *Let's Encrypt*. At your DNS provider, add an `A`
   record for `api` pointing to the VPS's IP address.
6. **Deploy**, then open `https://api.yourdomain.com/health`. It should say
   `{"ok":true}`. The database tables are created on first start.
7. Optional: turn on *Autodeploy* so every push to `main` redeploys.

Sign-in codes without SMTP: open the application's *Logs* in Dokploy and look for
`Sign-in code for you@example.com: 123456`.

## Developing locally

```
cd server
pnpm install
cp .env.example .env   # then fill it in
pnpm dev               # http://localhost:3000
pnpm db:generate       # after changing src/db/schema.ts: writes a new migration in drizzle/
```

Migrations in `drizzle/` run automatically when the server starts.
