/**
 * The printed card's geometry, in "card units" — a 600x400 design space that
 * mirrors the original CSS template exactly. Everything downstream (the live
 * preview and the exported JPEG) renders from these numbers at a scale factor,
 * so the two can never drift apart.
 */

/** CSS points -> CSS pixels. The original template sized all type in pt. */
const pt = (n: number) => (n * 4) / 3

export const CARD_WIDTH = 600
export const CARD_HEIGHT = 400

/** Export at 3x for a 1800x1200 JPEG, matching the original output size. */
export const EXPORT_SCALE = 3

export const CARD = {
  width: CARD_WIDTH,
  height: CARD_HEIGHT,
  /** Blank trim strip above the dashed cut line. */
  safeTop: CARD_HEIGHT * 0.125, // 50
  safeHeight: CARD_HEIGHT * 0.875, // 350
  photoWidth: CARD_WIDTH * 0.625, // 375
  textWidth: CARD_WIDTH * 0.375, // 225
  /** Solid black rule separating photo from text. */
  textBorder: 2,
  textPadTop: 53,
  /**
   * Deliberately asymmetric: shifts the text block 5px left of true centre to
   * compensate for drift on the printer these cards are produced on.
   * Adjust this pair if you recalibrate against a new printer.
   */
  textPadLeft: 5,
  textPadRight: 15,
  /** Dashed trim guide printed at the top of the safe area. */
  trimLine: { width: 1, dash: [4, 3], color: '#999999' },
} as const

/**
 * The trim line is a 1px top border on the safe area, and the safe area is
 * border-box, so the card's content actually begins 1px below it and is 1px
 * shorter. Measured off the original: content top 51, height 349.
 */
export const CONTENT_TOP = CARD.safeTop + CARD.trimLine.width // 51
export const CONTENT_HEIGHT = CARD.safeHeight - CARD.trimLine.width // 349

/** x of the text column's left edge. */
export const TEXT_X = CARD.photoWidth
/** Inner width available to text, after the rule and both paddings. */
export const TEXT_CONTENT_WIDTH =
  CARD.textWidth - CARD.textBorder - CARD.textPadLeft - CARD.textPadRight // 203
/** Horizontal centre that text is laid out around (includes the printer nudge). */
export const TEXT_CENTER_X =
  TEXT_X + CARD.textBorder + CARD.textPadLeft + TEXT_CONTENT_WIDTH / 2 // 483.5
/** y where the first line of text begins. */
export const TEXT_TOP = CONTENT_TOP + CARD.textPadTop // 104

export interface TextStyle {
  size: number
  lineHeight: number
  weight: 400 | 900
  uppercase?: boolean
  /** Preserve blank lines rather than collapsing them (the children list). */
  preserveBlankLines?: boolean
}

export const TEXT_STYLES = {
  familyName: { size: pt(18), lineHeight: pt(23.4), weight: 900, uppercase: true },
  parents: { size: pt(18), lineHeight: pt(23.4), weight: 400 },
  children: { size: pt(15), lineHeight: pt(19.5), weight: 400, preserveBlankLines: true },
  // The original left line-height unset here, inheriting Bootstrap's 1.5.
  leaderRole: { size: pt(12), lineHeight: pt(12) * 1.5, weight: 900, uppercase: true },
  leaderName: { size: pt(18), lineHeight: pt(23.4), weight: 400 },
  leaderTitle: { size: pt(15), lineHeight: pt(19.5), weight: 400 },
} as const satisfies Record<string, TextStyle>

/** Blank spacer line between text blocks (was an `&nbsp;` div at 10pt/13pt). */
export const SPACER_HEIGHT = pt(13)

/**
 * The ornamental rule on leader cards. Source art is 1080x540, i.e. 2:1.
 * `blockHeight` is the vertical space the image occupied in the original CSS:
 * it sat inline on the text baseline, so the line box it created was its own
 * height plus the descender gap below the baseline (~4.3px at the inherited
 * 16px/1.5 strut). Reproducing that keeps the leader title's y position intact.
 */
export const DIVIDER = { width: 52, height: 26, blockHeight: 30.3 }

/** Placeholder art shown until a photo is uploaded. Source viewBox is 347x241. */
export const PLACEHOLDER_ASPECT = 347 / 241

export const PHOTO_FRAME = {
  x: 0,
  y: CONTENT_TOP,
  width: CARD.photoWidth,
  height: CONTENT_HEIGHT,
}

/** Aspect ratio the cropper must honour so the crop fills the photo frame. */
export const PHOTO_ASPECT = PHOTO_FRAME.width / PHOTO_FRAME.height

/**
 * The red alignment guide: a band across the top of the card whose lower edge
 * is where the top of the subject's head should sit.
 */
export const GUIDE = { heightPct: 25, labelPaddingTopPct: 13 }
