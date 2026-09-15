import {
  CARD,
  CONTENT_HEIGHT,
  CONTENT_TOP,
  DIVIDER,
  EXPORT_SCALE,
  PHOTO_FRAME,
  PLACEHOLDER_ASPECT,
  PLACEHOLDER_INSET_X,
  SPACER_HEIGHT,
  TEXT_CENTER_X,
  TEXT_CONTENT_WIDTH,
  TEXT_STYLES,
  TEXT_TOP,
  TEXT_X,
  type TextStyle,
} from './cardLayout'
import type { Adjustments, CardData, CropRect } from '../types'

export const CARD_FONT = 'Merriweather'

export function filterString(a: Adjustments): string {
  return `brightness(${a.brightness}%) contrast(${a.contrast}%) saturate(${a.saturate}%) hue-rotate(${a.hueRotate}deg)`
}

export interface RenderPhoto {
  source: CanvasImageSource
  /** The region of the source image visible in the frame, in natural pixels. */
  crop: CropRect
  adjustments: Adjustments
}

export interface RenderOptions {
  data: CardData
  /** 1 for the on-screen preview, EXPORT_SCALE for the downloaded JPEG. */
  scale: number
  photo?: RenderPhoto | null
  placeholder?: CanvasImageSource | null
  divider?: CanvasImageSource | null
  /**
   * Preview mode: the interactive cropper is layered over the photo frame in
   * the DOM, so the canvas must leave that region alone.
   */
  skipPhoto?: boolean
}

/* ------------------------------------------------------------------ text -- */

/**
 * Splits a field into rendered lines. Users type a literal `\n` to force a
 * break in the single-line inputs (the original app's convention, still
 * documented in the UI); the children textarea uses real newlines. Both work.
 *
 * An entirely empty field produces no lines at all, so the blocks below it
 * move up — matching how an empty div collapsed in the original template.
 */
function toLines(value: string): string[] {
  if (value === '') return []
  return value.replace(/\\n/g, '\n').split('\n')
}

function fontFor(style: TextStyle): string {
  return `${style.weight} ${style.size}px "${CARD_FONT}", serif`
}

/**
 * Greedy word wrap. A single word wider than the column is left to overflow
 * rather than force-broken, which is what the original CSS did.
 */
function wrapLine(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  if (text.trim() === '') return ['']
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const candidate = current === '' ? word : `${current} ${word}`
    if (current !== '' && ctx.measureText(candidate).width > maxWidth) {
      lines.push(current)
      current = word
    } else {
      current = candidate
    }
  }
  if (current !== '') lines.push(current)
  return lines.length > 0 ? lines : ['']
}

/**
 * Reproduces CSS half-leading: the text's content box is centred vertically
 * within the line box, and the glyphs sit on the baseline inside it.
 */
function baselineWithin(
  ctx: CanvasRenderingContext2D,
  style: TextStyle,
  lineTop: number,
): number {
  const m = ctx.measureText('Hg')
  const ascent = m.fontBoundingBoxAscent ?? style.size * 0.8
  const descent = m.fontBoundingBoxDescent ?? style.size * 0.2
  return lineTop + (style.lineHeight - (ascent + descent)) / 2 + ascent
}

/** Draws one text block and returns the y position after it. */
function drawBlock(
  ctx: CanvasRenderingContext2D,
  value: string,
  style: TextStyle,
  y: number,
): number {
  const source = toLines(value)
  if (source.length === 0) return y

  ctx.font = fontFor(style)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#000000'

  let cursor = y
  for (const rawLine of source) {
    const text = style.uppercase ? rawLine.toUpperCase() : rawLine
    for (const line of wrapLine(ctx, text, TEXT_CONTENT_WIDTH)) {
      if (line !== '') {
        ctx.fillText(line, TEXT_CENTER_X, baselineWithin(ctx, style, cursor))
      }
      cursor += style.lineHeight
    }
  }
  return cursor
}

function drawTextColumn(
  ctx: CanvasRenderingContext2D,
  opts: RenderOptions,
): void {
  const { data, divider } = opts

  // The solid rule dividing photo from text.
  ctx.fillStyle = '#000000'
  ctx.fillRect(TEXT_X, CONTENT_TOP, CARD.textBorder, CONTENT_HEIGHT)

  let y = TEXT_TOP

  if (data.role === 'member') {
    y = drawBlock(ctx, data.familyName, TEXT_STYLES.familyName, y)
    y += SPACER_HEIGHT
    y = drawBlock(ctx, data.parentsNames, TEXT_STYLES.parents, y)
    y += SPACER_HEIGHT
    drawBlock(ctx, data.childrensNames, TEXT_STYLES.children, y)
    return
  }

  y = drawBlock(ctx, data.leaderRole, TEXT_STYLES.leaderRole, y)
  y += SPACER_HEIGHT
  y = drawBlock(ctx, data.leaderName, TEXT_STYLES.leaderName, y)
  y += SPACER_HEIGHT
  if (divider) {
    ctx.drawImage(
      divider,
      TEXT_CENTER_X - DIVIDER.width / 2,
      y,
      DIVIDER.width,
      DIVIDER.height,
    )
  }
  y += DIVIDER.blockHeight
  y += SPACER_HEIGHT
  drawBlock(ctx, data.leaderTitle, TEXT_STYLES.leaderTitle, y)
}

/* ----------------------------------------------------------------- photo -- */

function drawPhoto(ctx: CanvasRenderingContext2D, opts: RenderOptions): void {
  if (opts.skipPhoto) return

  const { photo, placeholder } = opts

  if (photo) {
    ctx.save()
    ctx.beginPath()
    ctx.rect(
      PHOTO_FRAME.x,
      PHOTO_FRAME.y,
      PHOTO_FRAME.width,
      PHOTO_FRAME.height,
    )
    ctx.clip()
    ctx.filter = filterString(photo.adjustments)
    ctx.drawImage(
      photo.source,
      photo.crop.x,
      photo.crop.y,
      photo.crop.width,
      photo.crop.height,
      PHOTO_FRAME.x,
      PHOTO_FRAME.y,
      PHOTO_FRAME.width,
      PHOTO_FRAME.height,
    )
    ctx.restore()
    return
  }

  if (placeholder) {
    // Inset either side, bottom-anchored — see PLACEHOLDER_ASPECT.
    const width = PHOTO_FRAME.width - PLACEHOLDER_INSET_X * 2
    const height = width / PLACEHOLDER_ASPECT
    ctx.drawImage(
      placeholder,
      PHOTO_FRAME.x + PLACEHOLDER_INSET_X,
      PHOTO_FRAME.y + PHOTO_FRAME.height - height,
      width,
      height,
    )
  }
}

function drawTrimLine(ctx: CanvasRenderingContext2D): void {
  ctx.save()
  ctx.strokeStyle = CARD.trimLine.color
  ctx.lineWidth = CARD.trimLine.width
  ctx.setLineDash([...CARD.trimLine.dash])
  ctx.beginPath()
  ctx.moveTo(0, CARD.safeTop + 0.5)
  ctx.lineTo(CARD.width, CARD.safeTop + 0.5)
  ctx.stroke()
  ctx.restore()
}

/* ---------------------------------------------------------------- public -- */

export function renderCard(
  ctx: CanvasRenderingContext2D,
  opts: RenderOptions,
): void {
  const { scale } = opts
  ctx.save()
  ctx.setTransform(scale, 0, 0, scale, 0, 0)
  ctx.filter = 'none'

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, CARD.width, CARD.height)

  drawPhoto(ctx, opts)
  drawTrimLine(ctx)
  drawTextColumn(ctx, opts)

  ctx.restore()
}

/** Renders the card at full export resolution and returns it as a JPEG blob. */
export function renderCardToBlob(
  opts: Omit<RenderOptions, 'scale' | 'skipPhoto'>,
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = CARD.width * EXPORT_SCALE
  canvas.height = CARD.height * EXPORT_SCALE

  const ctx = canvas.getContext('2d')
  if (!ctx)
    throw new Error('Could not create a drawing context for the export.')

  renderCard(ctx, { ...opts, scale: EXPORT_SCALE })

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error('The browser could not encode the image.')),
      'image/jpeg',
      1,
    )
  })
}
