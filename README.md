# Escate Tech Gamer Giveaway

This project uses Next.js App Router for both frontend and backend. Next.js is designed as a full-stack React framework, and the App Router supports route handlers and server-side logic. See the official docs: https://nextjs.org/docs

## Structure

app/
  page.tsx                         User UI
  layout.tsx                       Root layout
  globals.css                     UI styling
  admin/page.tsx                   Admin-only page
  api/auth/[...nextauth]/route.ts  Google OAuth callbacks
  api/youtube/verify/route.ts      YouTube subscription API check

auth.ts                            Google OAuth + Auth.js configuration
auth.config.ts                     Auth/proxy config
proxy.ts                           Admin route protection
types/next-auth.d.ts               Session typing

## Setup

Requirements: Node.js 20.9+ is recommended by current Next.js docs.

1. Install dependencies:
   npm install

2. Copy:
   .env.example -> .env.local

3. Create a Neon PostgreSQL database and add its connection string as
   DATABASE_URL in .env.local.

4. Apply the initial database migration:
   npm run db:deploy

5. Create a Google Cloud project.

6. Enable YouTube Data API v3.

7. Create an OAuth 2.0 Client ID of type Web application.

8. Add this Authorized redirect URI:
   http://localhost:3000/api/auth/callback/google

9. Put your Google Client ID and Secret into .env.local.

10. Put your permanent SkTechGamer YouTube Channel ID (UC...) into:
   YOUTUBE_CHANNEL_ID

11. Set ADMIN_EMAIL to the Google account that should access /admin.

12. Generate AUTH_SECRET:
   openssl rand -base64 32

13. Start:
   npm run dev

14. Open:
   http://localhost:3000

## Important YouTube OAuth detail

The Google OAuth request asks for:
https://www.googleapis.com/auth/youtube.readonly

After Google login, the backend calls YouTube Data API:
subscriptions.list({
  part: ["snippet"],
  mine: true,
  forChannelId: YOUTUBE_CHANNEL_ID,
  maxResults: 1
})

A returned subscription item means the authenticated YouTube account is subscribed to the configured channel.

## Giveaway database

The giveaway entry is saved in PostgreSQL through Prisma. The public page only
receives the participant count and the current user's submission result.
Participant records are available only to an authorized administrator at
`/admin`. Discord, Instagram, and Facebook are self-declared in this version;
the application does not claim to verify those memberships.

For production deployment, set `DATABASE_URL` in Vercel and run:

   npm run db:deploy

## Next modules

The intended next expansion is:

Step 2 giveaway entry
- Riot ID
- Discord join CTA
- Instagram follow CTA
- Facebook follow CTA
- Giveaway question

Backend/database
- participant table
- unique Riot ID / Google account / YouTube channel ID constraints
- entry timestamp
- verified subscription timestamp

Admin
- protected /admin dashboard
- participant count
- searchable entries
- random winner picker
- reroll
- winner history

For production, use a persistent database and a production session/auth setup rather than local development defaults.
