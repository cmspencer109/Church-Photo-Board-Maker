import { useEffect, useState } from 'react'

/** Loads a bundled asset as an <img> ready to be drawn onto the card canvas. */
export function useStaticImage(src: string): HTMLImageElement | null {
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    let cancelled = false
    const element = new Image()
    element.onload = () => {
      if (!cancelled) setImage(element)
    }
    element.src = src
    return () => {
      cancelled = true
    }
  }, [src])

  return image
}
