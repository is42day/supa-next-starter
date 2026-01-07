# Writing Platform Setup

## Installation Steps

### 1. Install Dependencies

```bash
pnpm install
pnpm add @radix-ui/react-dialog @radix-ui/react-select zod date-fns
pnpm add -D @types/date-fns
```

### 2. Set up Supabase

If you haven't already, create a Supabase project and get your credentials.

### 3. Run Migrations

You have two options to run the migrations:

#### Option A: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI if you haven't
npx supabase init

# Link to your project
npx supabase link --project-ref your-project-ref

# Run migrations
npx supabase db push
```

#### Option B: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the content from `supabase/migrations/20260107000001_initial_schema.sql`
4. Run the query
5. Then copy and paste the content from `supabase/migrations/20260107000002_rls_policies.sql`
6. Run that query

### 4. Environment Variables

Make sure your `.env.local` has:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

### 5. Create Your Profile

When you first sign up, you'll need to create a profile. The system will attempt to create one automatically, but you may need to set a custom handle in settings.

## Features Implemented So Far

- ✅ Database schema with migrations
- ✅ Row Level Security policies
- ✅ Type-safe database queries
- ✅ Dashboard page (`/app`) for listing works
- ✅ Create new work functionality
- 🚧 Work management page (in progress)
- 🚧 Chapter editor (in progress)
- 🚧 Reading mode (in progress)
- 🚧 Share links (planned)
- 🚧 Inline comments (planned)
- 🚧 Feedback system (planned)

## Development

```bash
pnpm dev
```

Visit `http://localhost:3000/app` after logging in to see your dashboard.
