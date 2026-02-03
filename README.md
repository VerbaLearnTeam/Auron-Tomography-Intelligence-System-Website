# Auron Intelligence (Prototype)

Single Next.js App Router application that combines the marketing site, invite-only prototype, and admin dashboard.

Prototype platform for research and evaluation. Not medical advice. Not for emergency use.

## Quick start

```bash
npm install
cp .env.example .env
# edit .env
npx prisma migrate dev
npm run dev
```

Open `http://localhost:3000`.

## Environment variables

See `.env.example` for the full list. Required for most functionality:

- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_TRUST_HOST=true`
- `AUTH_RESEND_KEY`
- `EMAIL_FROM`
- `ADMIN_API_KEY`
- `APP_START_URL`
- `UPLOAD_LINK_URL`

## Admin dashboard

Visit `/admin` and enter the `ADMIN_API_KEY` to access pending requests, invites, and allowlist management. Actions send approval/invite emails with a one-click start link when configured with Resend.

## Auth and allowlist

- Auth.js v5 with Resend magic links
- Allowlist enforced in the server-side `signIn` callback
- `/api/allowlist/check` prevents sending emails to non-allowlisted addresses

## Production

Run migrations on deploy:

```bash
npx prisma migrate deploy
```

## Notes

- Contribute scans flow accepts raw DICOM immediately and de-identifies after receipt.
- If accepted for use, contributors receive a prepaid card delivered via email.
