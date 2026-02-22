# Summit

> Find Your Guide. Reach Your Peak.

Adventure guide marketplace connecting travelers with certified outdoor guides.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# 3. Set up database
# Go to Supabase SQL Editor and run:
# supabase/migrations/001_initial_schema.sql

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Storage:** Cloudflare R2
- **Payments:** Stripe Connect
- **Email:** Resend
- **Styling:** Tailwind CSS
- **Hosting:** Vercel

## Project Structure

```
src/
├── app/           # Pages and API routes
├── components/    # React components
├── lib/           # Utilities and clients
└── types/         # TypeScript types
```

## Development with Claude Code

This project is optimized for development with Claude Code. See `CLAUDE.md` for full context.

```bash
# Start Claude Code in this directory
claude
```

## Environment Variables

See `.env.example` for required variables.

## License

MIT
