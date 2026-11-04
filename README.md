# Reversi

A Next.js Reversi game with a visual, interactive guide, local two-player mode, and a computer opponent. Game state currently lives in the browser session; no backend or account is required.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:3000. Run `npm run build` to check the production build. Deploy the repository to Vercel using its default Next.js settings.

The app includes a web manifest and service worker for installability and offline use after an initial visit. Service workers require HTTPS (or localhost) and are registered in production builds.

## Adding Convex

The game rules are currently client-side in `app/page.tsx`. Add the Convex client/provider and your schema when you're ready to persist games, profiles, or progress. The current game intentionally has no Convex dependency or placeholder credentials.

## Online games with Convex

1. Run `npx convex dev` and follow the prompts to create or connect a Convex project. This pushes the schema and game functions and writes `NEXT_PUBLIC_CONVEX_URL` to `.env.local`.
2. Restart `npm run dev`. Choose **Play → New game → Friend online**, create a game, and share its link. Each player keeps their seat in that browser’s local storage.
3. For Vercel, deploy the Convex functions to your production deployment (`npx convex deploy`) and set `NEXT_PUBLIC_CONVEX_URL` in Vercel to that production deployment’s URL, then redeploy the app.

Online games require a reachable Convex deployment. Invitation links let someone claim the open second seat; player keys remain on their respective devices. Clearing browser storage removes that device’s access to its seat.

## Search engine settings

Set `NEXT_PUBLIC_SITE_URL` to the preferred public origin (for example, `https://example.com`) in the production deployment and rebuild. This enables the canonical URL, social sharing image, and sitemap entry. Use the same origin that visitors should see; do not include a path or trailing slash. Without it, the app omits canonical and sitemap URLs rather than publishing a guessed domain.
