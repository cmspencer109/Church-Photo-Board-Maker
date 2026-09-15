import { useRef } from 'react'
import { Ruler, ZoomIn, ZoomOut } from 'lucide-react'

interface PhotoPanelProps {
  hasPhoto: boolean
  guidesOn: boolean
  loading: boolean
  onFile: (file: File) => void
  onZoom: (delta: number) => void
  onToggleGuides: () => void
}

export default function PhotoPanel({
  hasPhoto,
  guidesOn,
  loading,
  onFile,
  onZoom,
  onToggleGuides,
}: PhotoPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex w-full max-w-[600px] flex-col gap-4">
      <div>
        <label className="field-label" htmlFor="imageUpload">
          Upload an image
        </label>
        <input
          ref={inputRef}
          id="imageUpload"
          type="file"
          className="field"
          accept="image/*,.heic,.heif"
          autoComplete="off"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) onFile(file)
            // Allow re-selecting the same file after a failed conversion.
            event.target.value = ''
          }}
        />
        {loading && <p className="mt-2 text-sm text-body">Converting image…</p>}
      </div>

      {hasPhoto && (
        <div
          className="inline-flex self-start"
          role="group"
          aria-label="Photo controls"
        >
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onZoom(0.1)}
            aria-label="Zoom in"
          >
            <ZoomIn size={16} aria-hidden />
          </button>
          <button
            type="button"
            className="btn btn-primary -ml-px"
            onClick={() => onZoom(-0.1)}
            aria-label="Zoom out"
          >
            <ZoomOut size={16} aria-hidden />
          </button>
          <button
            type="button"
            className="btn btn-primary -ml-px"
            onClick={onToggleGuides}
            aria-pressed={guidesOn}
          >
            <Ruler size={16} aria-hidden />
            Guides
          </button>
        </div>
      )}
    </div>
  )
}
