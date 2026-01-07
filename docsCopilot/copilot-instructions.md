# Copilot Instructions for SupaNext Starter

## Architecture Overview

This is a Next.js 16 (App Router) + Supabase starter with TypeScript, using the `@supabase/ssr` package for authentication that works seamlessly across client, server, and middleware.

**Critical Architecture Patterns:**

- **Dual Supabase Clients**: Always use `@/supabase/client` for client components and `@/supabase/server` for server components/actions. Never reuse server clients across requests (Fluid compute compatibility).
- **Proxy-Based Auth**: The [proxy.ts](proxy.ts) middleware ([src/supabase/proxy.ts](src/supabase/proxy.ts)) handles session refreshing via `getClaims()` and protects routes. Protected paths redirect unauthenticated users to `/auth/login`.
- **Route Protection**: `/protected/*` routes require authentication. The proxy middleware checks user claims and redirects if no session exists.

## Testing Strategy

- **Framework**: Vitest + React Testing Library + MSW v2
- **MSW Setup**: Mock API handlers in [src/mocks/handlers.ts](src/mocks/handlers.ts), auto-started in [vitest.setup.ts](vitest.setup.ts) via [src/mocks/server.ts](src/mocks/server.ts)
- **Test Utilities**: Use [src/test/test-utils.tsx](src/test/test-utils.tsx) for rendering with providers (QueryClient, etc.)
- **Key Pattern**: Use `axios` for API calls in hooks (not `fetch`) to ensure MSW can intercept during tests. See [src/hooks/useGetMessage.ts](src/hooks/useGetMessage.ts).

**Example**: Override MSW handlers per-test using `server.use()` - see [src/components/react-query-example.test.tsx](src/components/react-query-example.test.tsx).

## Component Patterns

- **Client vs Server Components**: Auth forms and React Query components are client-only ('use client'). Pages and layouts are server components by default.
- **Providers**: Root layout wraps with `ThemeProvider` (next-themes) and `ReactQueryProvider` (TanStack Query). See [src/app/layout.tsx](src/app/layout.tsx).
- **shadcn/ui**: Components in [src/components/ui/](src/components/ui/) use CVA + tailwind-merge via [src/utils/tailwind.ts](src/utils/tailwind.ts) `cn()` helper.
- **Auth Flow**: Forms like [src/components/login-form.tsx](src/components/login-form.tsx) use `createClient()` from `@/supabase/client` and manage local state for loading/errors.

## Development Workflow

**Commands:**
- `pnpm dev` - Start dev server
- `pnpm test` - Run Vitest in watch mode
- `pnpm test:ci` - Single test run
- `pnpm lint-fix` - ESLint auto-fix
- `pnpm type-check` - TypeScript validation

**Environment Setup:**
- Copy `.env.local.example` to `.env.local`
- Required: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- The [src/utils/env.ts](src/utils/env.ts) `hasEnvVars` check can be removed after initial setup

## Key Conventions

- **Import Alias**: Use `@/` for all src imports (configured in [tsconfig.json](tsconfig.json))
- **Package Manager**: Use `pnpm` (enforced via packageManager field)
- **ESLint 9**: Uses flat config in [eslint.config.mjs](eslint.config.mjs) with Next.js core-web-vitals
- **Styling**: Tailwind v4 with Prettier plugin for class sorting
- **Formatting**: Husky + lint-staged runs on pre-commit

## Gotchas

1. **Supabase Server Client**: Never store in globals - recreate per request/component
2. **Proxy Middleware**: Don't run code between `createServerClient` and `getClaims()` - critical for session management
3. **MSW + fetch**: Next.js patches `fetch`, so use `axios` in client hooks for MSW interception
4. **Cookie Handling**: The proxy's `setAll` catches errors from Server Components (expected behavior)
5. **Auth Redirects**: Modify [src/supabase/proxy.ts](src/supabase/proxy.ts) logic to change protected route behavior

## Testing New Features

When adding components:
1. Co-locate tests next to components (`.test.tsx`)
2. Use custom `render` from test-utils for provider wrapping
3. Add MSW handlers to [src/mocks/handlers.ts](src/mocks/handlers.ts) for API mocking
4. For React Query hooks, disable retry in test QueryClient (see test-utils)
