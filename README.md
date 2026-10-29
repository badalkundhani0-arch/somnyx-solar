> **Form backend update:** See [FORMS_DEPLOYMENT.md](FORMS_DEPLOYMENT.md) for
> required credentials, deployment steps, secure DNS setup and retry scheduling.
> Contact/RFQ email is delivered to sales@somnyxsolar.com. RFQ attachments must
> currently be emailed separately because the old Blob implementation was public.

# Somnyx Solar website

**Engineering a Cleaner Tomorrow.**

Production website for Somnyx Solar: cinematic 3D product storytelling, 14 public pages, a database-backed RFQ system, and a password-protected admin dashboard.

Stack: Next.js 15 (React 19, TypeScript), Tailwind CSS 4, GSAP + ScrollTrigger, Three.js / React Three Fiber, libSQL (Turso) database, Vercel Blob file storage, Resend email.

---

## Run it locally

```bash
npm install
cp .env.example .env.local     # then fill in ADMIN_EMAIL, ADMIN_PASSWORD, SESSION_SECRET
npm run dev                    # http://localhost:3000
```

Locally, no external services are needed: the database is a SQLite file in `./storage/somnyx.db` (created and seeded on first request) and uploads go to `./storage/files`.

Admin: http://localhost:3000/admin

## Deploy to Vercel (recommended)

1. Push this folder to a GitHub repository and import it in Vercel.
2. **Database.** Create a free database at [turso.tech](https://turso.tech), then set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`. Tables are created and the three products seeded automatically. *Without this, form submissions are refused to prevent loss of enquiries.* The admin overview warns you if this is the case.
3. **File storage.** In Vercel → Storage, create a Blob store for admin assets and connect it to the project; this sets `BLOB_READ_WRITE_TOKEN`. Admin asset files (GLB models, datasheets) upload directly from the browser to Blob, so Vercel's 4.5 MB request limit does not apply.
4. **Email and form security.** Follow [FORMS_DEPLOYMENT.md](FORMS_DEPLOYMENT.md): configure a sending-only Resend subdomain, Turnstile and the protected delivery retry scheduler. Both public forms notify sales@somnyxsolar.com. Customer acknowledgement emails are disabled.
5. **Admin.** Set `ADMIN_EMAIL`, `ADMIN_PASSWORD` (12+ characters) and `SESSION_SECRET` (`openssl rand -base64 48`). Until all three are set, the admin stays locked.
6. Set `NEXT_PUBLIC_SITE_URL=https://www.somnyxsolar.com` and add your domain in Vercel.

The admin **Overview** page shows the live status of database, email, storage and admin security, with the exact setting to fix if something is missing.

## What is where

| Area | Location |
|---|---|
| Pages | `src/app/(site)/…` |
| Brand constants, tagline, emails | `src/lib/brand.ts` |
| Editable copy and its defaults | `src/lib/content.ts` |
| Seeded product data | `src/lib/seed.ts` (only used to seed an empty database; edit products in the admin afterwards) |
| Exploded-view part descriptions | `src/lib/parts.ts` |
| Procedural 3D model | `src/components/three/JunctionBoxModel.tsx` |
| Hero scroll sequence | `src/components/Hero.tsx`, `src/components/three/HeroScene.tsx` |
| RFQ / contact APIs | `src/app/api/rfq`, `src/app/api/contact` |
| Admin | `src/app/admin` |

## Admin dashboard

- **Quotation requests:** list, search, filter by status, view all fields, set status (new, in review, quoted, won, lost, archived) and keep internal notes. Every RFQ is stored even if email delivery fails, and each shows its email status.
- **Messages:** contact-form messages with topic labels; all notifications go to sales.
- **Products:** name, description, summary, development status and disclosure, full specification table, and uploads for product image, 3D model (GLB) and datasheet (PDF).
- **Website copy:** edit the main text on every page. The tagline is locked in code.
- **Technical resources:** upload, publish/hide and delete documents for the Technical Resources page.

## Replacing the 3D model

The current model is a procedural 3-split junction box built in code. To use your CAD model instead:

1. Export from CAD/STEP to **GLB** (e.g. via Blender or CAD Exchanger), centred on the origin, Y up, with the enclosure about 2.4 units wide.
2. Name the top-level nodes after the part ids so the exploded view and part selection keep working (group all three split boxes' parts of a kind under one node, e.g. all three covers under `cover`):
   `enclosure`, `cover`, `terminals`, `diodes`, `cablePos`, `cableNeg`, `connectors`, `conductors`, `sealing`.
3. Upload it on any product in **Admin → Products → 3D model**. The product page uses it immediately; the home and technology explorers use the first product that has a model.

Part descriptions in the explorer live in `src/lib/parts.ts`.

## Content notes

- Product specifications, development status and summaries are edited in **Admin → Products**; page copy in **Admin → Website copy**.
- Keep the specifications and the 3.6 GW capacity figure aligned with the datasheets and certificates you share with customers.
- The RFQ form saves to the database before anything else. The success message only mentions a confirmation email if one was actually sent.

## Security notes

- Admin routes are protected by middleware and checked again in every server action and API route. Sessions are signed HTTP-only cookies (8 hours).
- Login and form submissions are rate-limited per connection (IP addresses are only stored as salted hashes).
- Spam protection: server-verified Turnstile, honeypot, fill-time checks, bounded request bodies and exact origin allowlisting.
- Uploads are restricted by extension and size; RFQ uploads are disabled; email drawings separately. Previously uploaded public Blob files require owner review.

## Before going live

- Have the Privacy Policy and Terms of Use reviewed by your lawyer.
- Add real product and factory photography through the admin when available.
- Optional analytics: set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` for cookie-free Plausible analytics.
