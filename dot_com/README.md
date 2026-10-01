# devographics.com

One-page Astro site listing all Devographics surveys and their editions.

Survey and edition data is fetched from the Devographics API at build time
(see `src/lib/data.ts`), so the site needs to be rebuilt to pick up changes
(new editions, survey opening/closing, results release).

It reuses the monorepo's shared packages:

- `@devographics/fetch`: GraphQL fetcher and the surveys/locale queries
- `@devographics/types`: metadata types and status enums
- `@devographics/icons/surveys`: survey logos (rendered server-side, no client JS)

## Commands

```sh
pnpm install
pnpm dev      # http://localhost:3600
pnpm build    # outputs to ./dist
```

Optionally set `API_URL` (see `.env.example`) to point to a local API.
