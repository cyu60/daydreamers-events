# PRD: DayDreamers Workshops Platform

**URL:** workshops.daydreameracademy.com
**Repo:** daydreamers-workshops
**Stack:** Next.js (App Router), TypeScript, Tailwind CSS, Stripe, Notion API
**Status:** Draft

---

## 1. Problem

DayDreamers runs workshops but has no centralized place for potential attendees to browse available workshops, see who's teaching, and pay directly. Currently this is handled manually through emails and forms.

## 2. Goal

A public-facing website where visitors can:
1. Browse all available workshops
2. View workshop details (description, instructor, schedule, price)
3. Click into a workshop and pay via Stripe Checkout
4. See instructor/facilitator profiles

## 3. Data Source

Workshop and instructor data lives in a **Notion database**. The site fetches from Notion at build time (ISR/SSG) so pages are fast and data stays in sync without redeploys.

### Notion Workshop Database Schema (expected fields)
| Property | Type | Description |
|----------|------|-------------|
| Name | Title | Workshop title |
| Slug | Rich Text | URL slug |
| Description | Rich Text | Short description for cards |
| Full Description | Rich Text | Detailed workshop page content |
| Instructor | Relation → People DB | Who teaches it |
| Date | Date | Workshop date/time |
| Duration | Rich Text | e.g. "2 hours" |
| Price | Number | Price in USD (cents) |
| Capacity | Number | Max attendees |
| Spots Remaining | Number | Available spots |
| Cover Image | Files & Media | Hero image for the workshop |
| Tags | Multi-select | e.g. "AI", "No-Code", "Design" |
| Status | Select | "Published" / "Draft" / "Sold Out" |
| Stripe Price ID | Rich Text | Stripe Price ID for checkout |

### Notion People Database Schema (expected fields)
| Property | Type | Description |
|----------|------|-------------|
| Name | Title | Full name |
| Slug | Rich Text | URL slug |
| Role | Rich Text | e.g. "AI Workshop Lead" |
| Bio | Rich Text | Short bio |
| Photo | Files & Media | Headshot |
| LinkedIn | URL | LinkedIn profile |

## 4. Pages & Routes

### 4.1 Home / Workshop Listing (`/`)
- Hero section with DayDreamers branding and tagline
- Filter/sort by tags, date, price
- Grid of workshop cards showing: cover image, title, instructor name + photo, date, price, spots remaining
- "Sold Out" badge when applicable
- CTA button per card → links to workshop detail page

### 4.2 Workshop Detail (`/workshops/[slug]`)
- Hero with cover image
- Title, date, duration, price
- Full description (rendered from Notion rich text)
- Instructor card (photo, name, role, bio snippet) → links to instructor page
- "Register & Pay" button → Stripe Checkout
- Spots remaining indicator
- Related workshops section

### 4.3 Instructor Page (`/instructors/[slug]`)
- Photo, name, role, full bio
- LinkedIn link
- List of workshops they teach

### 4.4 Success Page (`/checkout/success`)
- Confirmation message after Stripe payment
- Workshop details recap
- "Add to Calendar" link (Google Calendar / .ics)

### 4.5 Cancelled Page (`/checkout/cancelled`)
- "Payment cancelled" message
- Link back to workshops

## 5. Stripe Integration

### Checkout Flow
1. User clicks "Register & Pay" on workshop detail page
2. Client calls `/api/checkout` with workshop ID
3. API route creates a Stripe Checkout Session using the workshop's Stripe Price ID
4. User is redirected to Stripe-hosted checkout
5. On success → redirect to `/checkout/success?session_id={CHECKOUT_SESSION_ID}`
6. Stripe webhook (`/api/webhooks/stripe`) handles `checkout.session.completed` to:
   - Decrement spots remaining in Notion
   - Send confirmation (future: email via Resend)

### Required Stripe Setup
- Stripe account with Products/Prices created per workshop
- Webhook endpoint configured for `checkout.session.completed`
- Environment variables: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`

## 6. Brand & Design

Consistent with existing DayDreamers brand:

| Token | Value |
|-------|-------|
| Background | `#f4efe8` (cream) |
| Card BG | `#fbf7f1` |
| Ink / Foreground | `#10111a` |
| Ink Soft | `#23263a` |
| Accent (Cobalt) | `#2652e6` |
| Accent Light | `#dfe7ff` |
| Gold | `#d3a14a` |
| Muted | `#70675f` |
| Border Radius | `14px` |
| Heading Font | DM Serif Display |
| Body Font | DM Sans |
| Mono Font | DM Mono |

Background gradient:
```
radial-gradient(circle at 0% 0%, rgba(38,82,230,.14), transparent 30%),
radial-gradient(circle at 100% 0%, rgba(211,161,74,.18), transparent 28%),
linear-gradient(180deg, #f6f1e9 0%, #eee6da 100%)
```

## 7. Environment Variables

```env
NOTION_API_KEY=
NOTION_WORKSHOPS_DB_ID=
NOTION_PEOPLE_DB_ID=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_SITE_URL=https://workshops.daydreameracademy.com
```

## 8. Non-Goals (v1)

- User accounts / login
- Admin dashboard (manage via Notion directly)
- Email confirmations (future: Resend)
- Waitlist for sold-out workshops
- Multi-currency support
- Discount codes (can add via Stripe later)

## 9. Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Data fetching | ISR (revalidate: 60s) | Fast pages, near-realtime Notion sync |
| Payments | Stripe Checkout (hosted) | No PCI scope, fastest to ship |
| Styling | Tailwind CSS | Already in stack, matches team velocity |
| Deployment | Vercel | Existing infra (mentor-mates team) |
| Domain | workshops.daydreameracademy.com | CNAME to Vercel |

## 10. Success Metrics

- Workshops are browsable and purchasable without manual intervention
- Payment flow completes end-to-end
- Data stays in sync with Notion without redeploys
