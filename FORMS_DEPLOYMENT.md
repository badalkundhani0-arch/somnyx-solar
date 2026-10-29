# Contact and RFQ deployment

## Scope and current implementation

The existing app uses Next.js 15 App Router, React 19, TypeScript and Zod.
Contact Us is `src/components/forms/ContactForm.tsx` → `POST /api/contact`.
The four-step quote/specification form is `src/components/forms/RfqForm.tsx` → `POST /api/rfq`.
Both already had libSQL/Turso persistence and Resend integration. This change
hardens those implementations; it does not move hosting or change domain routing.

All contact topics and RFQs now notify **sales@somnyxsolar.com**. The visitor's
validated email is Reply-To, never From. Messages are plain text. Records are
saved before email is attempted. Provider acceptance is recorded as `sent`;
this does not prove inbox delivery. Check Resend logs for bounces and Google
Workspace delivery logs/spam during launch testing.

Protection includes Zod validation and consent, field bounds, single-line header
fields, exact origin allowlisting, a streamed 64 KiB body cap, duplicate/file
field rejection, honeypot, finite minimum/maximum fill time, atomic shared
database rate limits and server-side Turnstile validation including hostname and
action. Production verification fails closed. Vercel requires persistent Turso
and configured email/security keys; missing settings return 503 with a direct
email alternative, rather than accepting enquiries into ephemeral storage.

## Owner setup in the existing Vercel project

1. Create or reuse a production Turso database. Set `TURSO_DATABASE_URL` to its
   `libsql://` URL and `TURSO_AUTH_TOKEN`. Tables initialize automatically. Preserve
   an existing database and its data. Do not point production at a local file.
2. In Resend, verify **notify.somnyxsolar.com** for **sending only**. Add exactly the
   provider-issued DKIM/SPF and return-path records at the new subdomain names.
   Do not enable inbound receiving. Do not replace root Google Workspace MX,
   Google DKIM, SPF or DMARC, or the website's Vercel A/CNAME records. Do not add a
   second root SPF record. No Google password, Gmail OAuth or Workspace API
   credentials are needed for this implementation.
3. Create a Resend sending API key restricted to the verified sending domain.
   Save `RESEND_API_KEY` in Vercel and set
   `EMAIL_FROM=Somnyx Solar Forms <forms@notify.somnyxsolar.com>`.
4. Create a Cloudflare Turnstile widget restricted to `www.somnyxsolar.com` and
   `somnyxsolar.com`. Set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and
   `TURNSTILE_SECRET_KEY`. This does not require moving DNS to Cloudflare.
   Set `FORM_ALLOWED_ORIGINS=https://www.somnyxsolar.com,https://somnyxsolar.com`.
   For preview testing, use a separate database/widget and explicitly add the
   exact preview origin to its allowlist. Never use a wildcard preview hostname.
5. Keep/set `ADMIN_EMAIL`, a strong `ADMIN_PASSWORD` (12+ characters), and a
   random `SESSION_SECRET` of at least 32 characters. This secret also salts rate
   limit identifiers. Set `NEXT_PUBLIC_SITE_URL=https://www.somnyxsolar.com`.
6. Generate an independent random `CRON_SECRET` of at least 32 characters and
   save the same value as a GitHub Actions repository secret named `CRON_SECRET`.
   The included `.github/workflows/form-delivery.yml` invokes the protected
   endpoint every ten minutes without installing dependencies or checking out
   source, and can also be started manually from Actions after merging to main.
   It has no GitHub API permissions. A 503 response makes the run fail so delivery
   problems appear in Actions. GitHub schedules can be delayed and public-repo
   schedules are disabled after 60 days of repository inactivity; monitor them.
   This is the supplied scheduler; do not also enable a second scheduler.
   If you choose another scheduler instead, disable the included workflow and
   configure a scheduler to GET `/api/cron/form-delivery` every ten minutes with
   `Authorization: Bearer <CRON_SECRET>`. The endpoint retries four records per
   run, so monitor the queue and increase capacity if enquiry volume requires it.
   **Scheduling is an owner activation step.** There is no enabled cron entry in
   `vercel.json`, preserving compatibility with the existing Vercel plan.
   On Vercel Pro, add `{"crons":[{"path":"/api/cron/form-delivery","schedule":"*/10 * * * *"}]}`;
   Vercel supplies the bearer secret automatically. Hobby rejects sub-daily cron
   schedules; use an authorized external scheduler or upgrade if needed.
7. Review/apply the supplied patch to the repository and deploy through the
   **existing** Vercel project. Configure secrets before deploying this change.
   Public Turnstile key changes require a rebuild. Confirm inbox delivery with
   one Contact submission and one RFQ and verify Reply-To in each received email.

Only the public site key uses `NEXT_PUBLIC_`. Keep all tokens/passwords in Vercel
environment settings; never commit or paste them into chat. No credentials were
provisioned and no DNS, live deployment or email was changed by this patch.

## Retries and operations

The saved contact/RFQ rows are the durable delivery queue. Initial send and retry
reconstruct the same payload and use a stable Resend idempotency key per record.
Transient failure keeps the enquiry in the admin dashboard. Retries stop after
23 hours, before Resend's 24-hour idempotency retention ends. Older unresolved
records become `manual_review`; check provider logs before resending to avoid
duplicates. Enable scheduler failure alerts, and review failed/pending records
daily. Customer acknowledgement emails are disabled to avoid unsolicited mail to
addresses supplied by visitors. A success page means the enquiry was saved.

The endpoint requires the bearer secret; unauthenticated requests receive 401.
It also prunes stale rate limit rows. Logs omit form contents and credentials.
Set a suitable retention/deletion process for enquiry data and database backups.
The change covers form submission and notification, not a full admin-site audit.

## Attachment security change

The original implementation stored RFQ files in a **public** Vercel Blob store;
an admin proxy did not make those files private. Public RFQ uploads and incoming
attachment references are now refused, and the RFQ file picker is disabled.
Visitors can email drawings to sales with their RFQ reference. Admin product
asset uploads continue as before. Re-enabling RFQ attachments requires a real
private store, authenticated downloads, upload ownership binding and malware
handling. Review previously uploaded RFQ files in the old public store and remove
or migrate sensitive files; this patch does not delete existing data.

## Validation and rollback

Run `npm ci`, `npm test`, `npx tsc --noEmit`, `npm run build` and `npm audit`.
Tests mock email delivery; no real email is sent. Security dependency overrides
update nested PostCSS/Zod versions without changing the framework major version.

On a preview deployment, verify valid forms, invalid email/consent, honeypot,
expired/reused Turnstile token, disallowed origin, oversized request, rate limits,
provider failure with a saved row, authenticated retry, missing configuration and
the disabled attachment control. Check browser console/network on both forms.
After production deployment, verify the actual sales inbox and scheduler once.

Rollback by reverting the source change and redeploying the same Vercel project.
No destructive database migration is included. Preserve the Turso records.

Provider references:
- https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
- https://resend.com/docs/dashboard/domains/introduction
- https://resend.com/docs/dashboard/emails/idempotency-keys
- https://vercel.com/docs/cron-jobs/usage-and-pricing
