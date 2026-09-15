import { CARD_FONT } from './renderCard'
import { TEXT_STYLES } from './cardLayout'

/**
 * Canvas draws with whatever font is resolved at the moment `fillText` runs —
 * there is no re-layout once a webfont arrives. So every face the card uses
 * must be loaded before we render, or the export silently falls back to a
 * serif and the line breaks land in the wrong places.
 *
 * This is the failure mode that made the old html-to-image export flaky.
 */
export async function ensureCardFontsReady(): Promise<void> {
  const faces = new Set(
    Object.values(TEXT_STYLES).map(
      (style) => `${style.weight} ${style.size}px "${CARD_FONT}"`,
    ),
  )

  await Promise.all([...faces].map((face) => document.fonts.load(face)))
  await document.fonts.ready
}
