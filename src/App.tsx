import { useCallback, useEffect, useRef, useState } from 'react'
import type { Area, Point } from 'react-easy-crop'

import NavBar from './components/NavBar'
import InfoPanel from './components/InfoPanel'
import PhotoPanel from './components/PhotoPanel'
import AdjustmentsPanel from './components/AdjustmentsPanel'
import CardPreview from './components/CardPreview'
import { useStaticImage } from './components/useStaticImage'

import { ensureCardFontsReady } from './lib/fonts'
import { cardFilename, downloadBlob, loadPhoto, type LoadedPhoto } from './lib/loadImage'
import { renderCardToBlob } from './lib/renderCard'
import {
  DEFAULT_ADJUSTMENTS,
  EMPTY_CARD,
  type Adjustments,
  type CardData,
} from './types'

const MIN_ZOOM = 1
const MAX_ZOOM = 8
const CENTERED: Point = { x: 0, y: 0 }

export default function App() {
  const [data, setData] = useState<CardData>(EMPTY_CARD)
  const [adjustments, setAdjustments] = useState<Adjustments>(DEFAULT_ADJUSTMENTS)
  const [guidesOn, setGuidesOn] = useState(false)

  const [photo, setPhoto] = useState<LoadedPhoto | null>(null)
  const [crop, setCrop] = useState<Point>(CENTERED)
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)

  const [loadingPhoto, setLoadingPhoto] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const placeholder = useStaticImage('/images/people-placeholder.svg')
  const divider = useStaticImage('/images/fancy-divider.png')

  // Release the previous object URL whenever the photo is replaced or we unmount.
  const photoRef = useRef<LoadedPhoto | null>(null)
  useEffect(() => {
    photoRef.current = photo
  }, [photo])
  useEffect(
    () => () => {
      if (photoRef.current) URL.revokeObjectURL(photoRef.current.url)
    },
    [],
  )

  const updateField = useCallback(
    <K extends keyof CardData>(key: K, value: CardData[K]) => {
      setData((previous) => ({ ...previous, [key]: value }))
    },
    [],
  )

  const handleFile = useCallback(async (file: File) => {
    setLoadingPhoto(true)
    setError(null)
    try {
      const next = await loadPhoto(file)
      setPhoto((previous) => {
        if (previous) URL.revokeObjectURL(previous.url)
        return next
      })
      setCrop(CENTERED)
      setZoom(1)
      setAdjustments(DEFAULT_ADJUSTMENTS)
      setGuidesOn(true)
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'That image could not be opened. Try a different file.',
      )
    } finally {
      setLoadingPhoto(false)
    }
  }, [])

  const handleZoom = useCallback((delta: number) => {
    setZoom((current) =>
      Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number((current + delta).toFixed(2)))),
    )
  }, [])

  const handleDownload = useCallback(async () => {
    setBusy(true)
    setError(null)
    try {
      await ensureCardFontsReady()
      const blob = await renderCardToBlob({
        data,
        placeholder,
        divider,
        photo:
          photo && croppedArea
            ? { source: photo.image, crop: croppedArea, adjustments }
            : null,
      })
      const name = data.role === 'member' ? data.familyName : data.leaderName
      downloadBlob(blob, cardFilename(name))
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Could not create the image. Please try again.',
      )
    } finally {
      setBusy(false)
    }
  }, [data, placeholder, divider, photo, croppedArea, adjustments])

  return (
    <>
      <NavBar />

      <main className="mx-auto max-w-7xl px-4 py-8">
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lux border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,600px)_minmax(0,1fr)]">
          <div className="lg:order-2 flex flex-col items-center gap-4">
            <CardPreview
              data={data}
              photo={photo}
              crop={crop}
              zoom={zoom}
              adjustments={adjustments}
              guidesOn={guidesOn}
              placeholder={placeholder}
              divider={divider}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={setCroppedArea}
            />
            <PhotoPanel
              hasPhoto={photo !== null}
              guidesOn={guidesOn}
              loading={loadingPhoto}
              onFile={(file) => void handleFile(file)}
              onZoom={handleZoom}
              onToggleGuides={() => setGuidesOn((on) => !on)}
            />
          </div>

          <div className="lg:order-1">
            <InfoPanel
              data={data}
              busy={busy}
              onChange={updateField}
              onDownload={() => void handleDownload()}
            />
          </div>

          <div className="lg:order-3">
            {photo && (
              <AdjustmentsPanel
                adjustments={adjustments}
                onChange={setAdjustments}
              />
            )}
          </div>
        </div>
      </main>
    </>
  )
}
