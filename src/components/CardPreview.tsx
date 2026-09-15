import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Cropper from 'react-easy-crop'
import type { Area, Point } from 'react-easy-crop'
import 'react-easy-crop/react-easy-crop.css'

import {
  CARD_HEIGHT,
  CARD_WIDTH,
  GUIDE,
  PHOTO_ASPECT,
  PHOTO_FRAME,
} from '../lib/cardLayout'
import { filterString, renderCard } from '../lib/renderCard'
import { ensureCardFontsReady } from '../lib/fonts'
import type { LoadedPhoto } from '../lib/loadImage'
import type { Adjustments, CardData } from '../types'

const pct = (value: number, total: number) => `${(value / total) * 100}%`

interface CardPreviewProps {
  data: CardData
  photo: LoadedPhoto | null
  crop: Point
  zoom: number
  adjustments: Adjustments
  guidesOn: boolean
  placeholder: HTMLImageElement | null
  divider: HTMLImageElement | null
  onCropChange: (crop: Point) => void
  onZoomChange: (zoom: number) => void
  onCropComplete: (area: Area) => void
}

/**
 * The live card. Everything except the photo is painted by the same
 * `renderCard` routine that produces the download, so what you see is what
 * prints. The interactive cropper is layered over the photo frame, and the
 * canvas skips that region while it is present.
 */
export default function CardPreview({
  data,
  photo,
  crop,
  zoom,
  adjustments,
  guidesOn,
  placeholder,
  divider,
  onCropChange,
  onZoomChange,
  onCropComplete,
}: CardPreviewProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [width, setWidth] = useState(CARD_WIDTH)
  const [fontsReady, setFontsReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    void ensureCardFontsReady().then(() => {
      if (!cancelled) setFontsReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // The card keeps its 3:2 proportions but shrinks to fit narrow screens.
  useLayoutEffect(() => {
    const element = wrapperRef.current
    if (!element) return

    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.min(CARD_WIDTH, entry.contentRect.width))
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const scale = (width / CARD_WIDTH) * (window.devicePixelRatio || 1)
    canvas.width = Math.round(CARD_WIDTH * scale)
    canvas.height = Math.round(CARD_HEIGHT * scale)

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    renderCard(ctx, {
      data,
      scale,
      placeholder,
      divider,
      skipPhoto: photo !== null,
    })
  }, [data, width, placeholder, divider, photo, fontsReady])

  const height = width * (CARD_HEIGHT / CARD_WIDTH)

  return (
    <div ref={wrapperRef} className="w-full max-w-[600px]">
      <div
        className="relative overflow-hidden bg-white shadow-[0_1px_2px_rgba(0,0,0,0.07),0_2px_4px_rgba(0,0,0,0.07),0_4px_8px_rgba(0,0,0,0.07),0_8px_16px_rgba(0,0,0,0.07),0_16px_32px_rgba(0,0,0,0.07),0_32px_64px_rgba(0,0,0,0.07)]"
        style={{ width, height }}
      >
        <canvas
          ref={canvasRef}
          style={{ width, height, display: 'block' }}
          aria-label="Preview of the printable photo card"
        />

        {photo && (
          <div
            className="absolute"
            style={{
              left: pct(PHOTO_FRAME.x, CARD_WIDTH),
              top: pct(PHOTO_FRAME.y, CARD_HEIGHT),
              width: pct(PHOTO_FRAME.width, CARD_WIDTH),
              height: pct(PHOTO_FRAME.height, CARD_HEIGHT),
              filter: filterString(adjustments),
            }}
          >
            <Cropper
              image={photo.url}
              crop={crop}
              zoom={zoom}
              aspect={PHOTO_ASPECT}
              objectFit="cover"
              showGrid={false}
              minZoom={1}
              maxZoom={8}
              zoomSpeed={0.2}
              onCropChange={onCropChange}
              onZoomChange={onZoomChange}
              onCropComplete={(_area, pixels) => onCropComplete(pixels)}
              style={{
                containerStyle: { backgroundColor: '#ffffff' },
                cropAreaStyle: {
                  border: 'none',
                  boxShadow: 'none',
                  color: 'transparent',
                },
              }}
            />
          </div>
        )}

        {guidesOn && (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-20 italic"
            style={{
              height: `${GUIDE.heightPct}%`,
              paddingTop: `${GUIDE.labelPaddingTopPct}%`,
              paddingLeft: 3 * (width / CARD_WIDTH),
              fontSize: 14 * (width / CARD_WIDTH),
              color: 'red',
              borderBottom: '1px solid rgba(255, 0, 0, 0.75)',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
            }}
          >
            Align with top of head
          </div>
        )}
      </div>
    </div>
  )
}
