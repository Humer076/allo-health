# Allo Health - Inventory Reservation System

## Live Demo
[Add your Vercel URL after deployment]

## Features
- ✅ Reserve stock for 10 minutes
- ✅ Race-condition free with database locks
- ✅ Confirm or cancel reservations
- ✅ Auto-expiry via cron job
- ✅ Live countdown timer

## How expiry works in production
Vercel Cron job runs every minute hitting `/api/cron/release-expired` which finds expired pending reservations and releases them atomically.

## Concurrency strategy
Prisma transaction with row-level lock ensures that concurrent reserve requests for the last unit are serialized – only one succeeds.

## Local setup
1. Clone repo
2. Copy `.env.local.example` to `.env.local`
3. Set `DATABASE_URL` (Supabase/Neon PostgreSQL)
4. Run `npx prisma migrate dev`
5. Run `npx prisma db seed` (or manually add products/warehouses)
6. `npm run dev`

## Trade-offs
- No idempotency (bonus not attempted)
- Cron job instead of background worker (simpler for Vercel)
- GET endpoint for `/api/reservations/[id]` not implemented (frontend uses fallback)