export interface LoadedPhoto {
  /** Object URL for the decoded image; revoke it when replaced. */
  url: string
  image: HTMLImageElement
}

function decode(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Image could not be decoded.'))
    image.src = url
  })
}

async function decodeBlob(blob: Blob): Promise<LoadedPhoto> {
  const url = URL.createObjectURL(blob)
  try {
    return { url, image: await decode(url) }
  } catch (cause) {
    URL.revokeObjectURL(url)
    throw cause
  }
}

/** ISO-BMFF brands that indicate a HEIC/HEIF still image. */
const HEIC_BRANDS = new Set([
  'heic', 'heix', 'hevc', 'hevx',
  'heim', 'heis', 'hevm', 'hevs',
  'mif1', 'msf1',
])

/**
 * Cheap HEIC detection from the file's own bytes, so we never load the decoder
 * just to find out we didn't need it.
 */
async function looksLikeHeic(file: File): Promise<boolean> {
  if (file.type === 'image/heic' || file.type === 'image/heif') return true
  if (/\.(heic|heif)$/i.test(file.name)) return true

  try {
    const header = new Uint8Array(await file.slice(0, 12).arrayBuffer())
    if (header.length < 12) return false
    const ascii = (start: number, end: number) =>
      String.fromCharCode(...header.subarray(start, end))
    return ascii(4, 8) === 'ftyp' && HEIC_BRANDS.has(ascii(8, 12))
  } catch {
    return false
  }
}

/**
 * Reads an uploaded file into an <img>.
 *
 * iPhones shoot HEIC by default, so handling it matters — but the decoder is a
 * multi-megabyte WASM bundle. Two things keep it off the critical path:
 * it is only ever fetched for a file that really is HEIC, and even then only
 * after the browser has had a go itself (Safari decodes HEIC natively, and
 * Safari is where most of these files come from).
 */
export async function loadPhoto(file: File): Promise<LoadedPhoto> {
  const maybeHeic = await looksLikeHeic(file)

  try {
    return await decodeBlob(file)
  } catch (cause) {
    if (!maybeHeic) {
      throw new Error('That file could not be read as an image.')
    }

    const { heicTo } = await import('heic-to')
    const converted = await heicTo({
      blob: file,
      type: 'image/jpeg',
      quality: 0.92,
    })
    return await decodeBlob(converted)
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  // Give the browser a beat to start the download before releasing the blob.
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

/** `Luther_2026-09-15.jpg` — same convention as the original app. */
export function cardFilename(name: string): string {
  const date = new Date().toISOString().split('T')[0]
  const safe = name.trim().replace(/\s+/g, '_').replace(/[^\w-]/g, '') || 'photo'
  return `${safe}_${date}.jpg`
}
