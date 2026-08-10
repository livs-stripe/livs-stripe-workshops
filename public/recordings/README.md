# Workshop screen recordings

Animated GIFs dropped in here play inline inside workshop steps. They auto-loop
silently, lazy-load when scrolled into view, and expand to a lightbox on click.
No video player, no controls — just a looping demonstration of the Dashboard
action the step describes.

## How a recording gets wired to a step

Each workshop step can carry a `gif` field (see `WorkshopGif` in
`lib/workshop-modules.ts`). Add a `src` pointing at a file in this folder:

```ts
gif: {
  screen: 'Connect → Accounts',      // breadcrumb shown in the frame chrome
  caption: 'Creating an Express connected account via the API',
  src: '/recordings/connect/03-oauth-onboarding/02-create-account-link.gif',
  alt: 'Creating a connected account and generating an Account Link',
  aspectRatio: '16/9',               // optional, defaults to 16/9
}
```

When `src` is omitted, the step renders a branded placeholder frame instead, so
steps read cleanly before a recording exists. To add a recording, capture the
GIF, save it at the path below, and set `src` on the step — no code changes.

## Naming convention

```
/public/recordings/{theme-id}/{module-index}-{module-slug}/{step-index}-{step-slug}.gif
```

Examples:

```
/recordings/fraud_radar/01-introduction/01-what-is-fraud.gif
/recordings/connect/03-oauth-onboarding/02-create-account-link.gif
/recordings/billing/05-customer-portal/01-portal-config.gif
```

Theme IDs match `lib/themes.ts`: `fraud_radar`, `online_payments`, `billing`,
`connect`, `disputes`.

## Capturing GIFs

- **macOS:** [Kap](https://getkap.co) — export as looping GIF.
- **Windows:** [ScreenToGif](https://www.screentogif.com).
- **Any OS:** any tool that exports a silently looping GIF.

Keep each file **under 10 MB** so pages stay fast on Vercel. Record at a
16:9-ish window, trim dead frames, and cap width around 1280px. Vercel's image
optimizer strips GIF animation, so these are served as plain `<img>` tags and
are never run through `next/image` optimization.
