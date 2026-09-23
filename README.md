# SktechGamer Giveaway

SktechGamer Giveaway is a Next.js app for managing a creator giveaway with Google sign-in, YouTube subscription verification, and admin tracking. It is built with the App Router, Prisma, and Neon Postgres.

## Overview

This project lets users:

- sign in with Google
- verify they are subscribed to the configured SktechGamer YouTube channel
- submit a giveaway entry
- view their current participation status
- allow an admin to review entries and counts from the protected admin dashboard

## Tech stack

- Next.js App Router
- TypeScript
- Prisma ORM
- PostgreSQL via Neon
- NextAuth for Google authentication
- YouTube Data API v3

## Project structure

- app/page.tsx — public landing page
- app/admin/page.tsx — admin dashboard
- app/api/auth/[...nextauth]/route.ts — auth routes
- app/api/giveaway/entry/route.ts — giveaway submission logic
- app/api/giveaway/count/route.ts — participant count endpoint
- app/api/youtube/verify/route.ts — YouTube subscription verification
- auth.ts — auth configuration
- auth.config.ts — auth and proxy config
- prisma/schema.prisma — Prisma schema
- lib/prisma.ts — Prisma client
- proxy.ts — admin route protection
- types/next-auth.d.ts — session typing

## Setup

Requirements:

- Node.js 20.9+
- PostgreSQL database (Neon recommended)
- Google Cloud project with OAuth enabled
- YouTube Data API v3 enabled

1. Install dependencies:
   npm install

2. Create a local environment file:
   copy `.env.example` to `.env.local`

3. Add your database connection string:
   DATABASE_URL=your_neon_postgres_connection_string

4. Apply the database schema:
   npm run db:deploy

5. Create a Google OAuth app in Google Cloud.

6. Enable the YouTube Data API v3.

7. Add the redirect URI:
   http://localhost:3000/api/auth/callback/google

8. Add your Google client credentials to `.env.local`:
   GOOGLE_CLIENT_ID
   GOOGLE_CLIENT_SECRET

9. Set your SktechGamer YouTube channel ID:
   YOUTUBE_CHANNEL_ID=UC...

10. Set the admin email:
    ADMIN_EMAIL=your-google-account@example.com

11. Generate an Auth secret:
    openssl rand -base64 32

12. Start the app:
    npm run dev

13. Open the app in the browser:
    http://localhost:3000

## Environment variables

Example values to include in `.env.local`:

- DATABASE_URL
- AUTH_SECRET
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- YOUTUBE_CHANNEL_ID
- ADMIN_EMAIL
- NEXTAUTH_URL=http://localhost:3000

## YouTube verification

The app requests the following Google OAuth scope:
https://www.googleapis.com/auth/youtube.readonly

After logging in, it checks the YouTube API with a subscription query to confirm the user is subscribed to the configured SktechGamer channel.

## Admin and giveaway behavior

- Public pages show the participant count and current user result.
- Admin-only screens are protected and can access the full participant list.
- Discord, Instagram, and Facebook information are self-declared in this version and are not independently verified by the app.

## Production notes

For production deployments, use a persistent database and a production auth/session configuration instead of local development defaults. Set `DATABASE_URL` in your deployment environment and run:

npm run db:deploy

## Planned improvements

- additional giveaway fields such as Riot ID and Discord/Instagram/Facebook verification CTA
- stronger uniqueness checks for participant data
- enhanced admin actions such as search, winner selection, and rerolls
- winner history tracking and analytics
