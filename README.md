# Church Photo Board Maker

Web tool for making printable member and leader cards for a church photo board.
Enter names, upload a photo, frame and colour-correct it, and download a
1800×1200 JPEG ready to print and pin up.

Live at **https://photoboard.mluther.org**

## Stack

| Concern | Choice |
| --- | --- |
| Build | [Vite](https://vite.dev) 8 + TypeScript |
| UI | React 19 |
| Styling | Tailwind CSS 4, themed to match [Bootswatch Lux](https://bootswatch.com/lux/) |
| Photo framing | [react-easy-crop](https://github.com/ValentinH/react-easy-crop) |
| HEIC support | [heic-to](https://github.com/hoppergee/heic-to), lazily loaded |
| Icons | [lucide-react](https://lucide.dev) |
| Fonts | Merriweather + Nunito Sans, self-hosted via Fontsource |
| Hosting | Cloudflare Workers (static assets) |
| Packages | pnpm |

## Running locally

```bash
pnpm install
pnpm dev
```

pnpm's version is pinned by the `packageManager` field, so it self-selects the
right release. The first install asks you to approve native build scripts for
`esbuild` and `workerd`; these are pre-approved in `pnpm-workspace.yaml`.

Other scripts:

```bash
pnpm build      # typecheck, then build to dist/
pnpm preview    # serve the production build locally
pnpm typecheck  # types only
```

## Deploying

```bash
pnpm deploy
```

That builds and runs `wrangler deploy`, which uploads `dist/` to Cloudflare.
You'll need to `pnpm exec wrangler login` once first.

### Custom domain

`wrangler.jsonc` claims `photoboard.mluther.org` as a custom domain. For that
to work, the `mluther.org` zone must be on the same Cloudflare account — once
it is, Cloudflare creates and manages the DNS record itself, so there is
nothing to add by hand. If the zone lives elsewhere, either move it to
Cloudflare or drop the `routes` block and use the `*.workers.dev` URL.

## How the card is rendered

The printed card is **drawn directly onto a canvas**, not screenshotted from
the DOM. Everything flows from one place:

- `src/lib/cardLayout.ts` — the card's geometry and type scale, in a 600×400
  design space. The export is the same numbers at 3×, giving exactly 1800×1200.
- `src/lib/renderCard.ts` — draws a card at any scale from that spec.

The live preview and the downloaded JPEG call the *same* renderer, so the
preview cannot drift from what prints. The only part of the preview that isn't
canvas is the photo itself, which is the interactive cropper layered over the
photo frame; its crop region feeds straight into the export.

Two things worth knowing if you ever adjust the layout:

- **Printer calibration.** `CARD.textPadLeft` / `textPadRight` are deliberately
  asymmetric (5px / 15px), nudging the text block left of true centre to
  correct for drift on the printer these are produced on. Retune that pair,
  not the centre point, if you change printers.
- **The placeholder is bottom-anchored.** `family-placeholder.webp` is a
  pencil sketch whose figures are cropped at the shins and run to the bottom
  edge, so it sits on the bottom of the photo frame rather than centred.
  Swapping in different art means revisiting `PLACEHOLDER_ASPECT` and that
  choice in `renderCard.ts`.
- **Fonts must be loaded before drawing.** Canvas has no re-layout: if a
  webfont arrives after `fillText`, the text is silently already wrong.
  `src/lib/fonts.ts` awaits every face the card uses before any render. This is
  why the fonts are self-hosted rather than pulled from a CDN.

## Matching the original design

The Lux look was reproduced by measuring the old build's *computed* styles
rather than eyeballing screenshots, so a few values look odd but are
deliberate:

- The grid is `51fr 106fr 51fr`, not `1fr 2fr 1fr`. Bootstrap's `col-md-3/6/3`
  sit on a row that overhangs the container's padding, so the real content
  columns are 306/636/306 either side of 24px gutters.
- Body text is `font-weight: 400`, though Lux declares 200. Lux only ever
  loaded Nunito Sans 400 and 600, so its 200 had no face to resolve to and
  always rendered at 400.
- No `-webkit-font-smoothing: antialiased`. Lux doesn't set it, and it renders
  noticeably thinner and lighter than the platform default.
- Buttons carry a 48px minimum height, matching Bootstrap's `inline-block` +
  24px line-height, which an icon-only flex button would otherwise collapse.
- The card's content starts 1px below the dashed trim line (y=51, height 349),
  because that line is a border on a border-box element.

## Text entry

- Type `\n` in any single-line field to force a line break.
- The children box takes real newlines.
- Long lines wrap automatically inside the text column.

## Notes from the rewrite

This replaced a [Sergey](https://sergey.cool)-built static site deployed to
surge.sh. Things that changed beyond the framework:

- `html-to-image` is gone. It was the source of the intermittent "try
  uploading a smaller image" failures; the canvas renderer is deterministic and
  has no image-size ceiling.
- jQuery was loaded on every page and never used. Removed.
- Font Awesome was pulled from a personal, account-tied kit URL — a live
  dependency on that account staying active. Replaced with bundled icons.
- Alpine, Cropper.js, html-to-image, heic2any and the fonts all came from CDNs
  with no lockfile. Everything is now a pinned dependency.
- The card is responsive; the old fixed 600px layout overflowed on phones.
