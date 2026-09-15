import { RotateCcw } from 'lucide-react'
import { DEFAULT_ADJUSTMENTS, type Adjustments } from '../types'

interface Slider {
  key: keyof Adjustments
  label: string
  min: number
  max: number
}

const SLIDERS: Slider[] = [
  { key: 'brightness', label: 'Brightness', min: 50, max: 150 },
  { key: 'contrast', label: 'Contrast', min: 75, max: 125 },
  { key: 'saturate', label: 'Saturation', min: 75, max: 125 },
  { key: 'hueRotate', label: 'Color Shift', min: -25, max: 25 },
]

interface AdjustmentsPanelProps {
  adjustments: Adjustments
  onChange: (adjustments: Adjustments) => void
}

export default function AdjustmentsPanel({
  adjustments,
  onChange,
}: AdjustmentsPanelProps) {
  const isModified = SLIDERS.some(
    ({ key }) => adjustments[key] !== DEFAULT_ADJUSTMENTS[key],
  )

  return (
    <fieldset>
      <legend className="mb-2 flex w-full items-baseline justify-between">
        <span className="panel-heading">Adjustments</span>
        {/*
          Kept in the layout and hidden rather than unmounted, as the original
          did, so revealing it doesn't shift the sliders down.
        */}
        <button
          type="button"
          className="btn btn-secondary pr-0 opacity-50"
          style={{ visibility: isModified ? 'visible' : 'hidden' }}
          onClick={() => onChange(DEFAULT_ADJUSTMENTS)}
          aria-label="Reset all adjustments"
          aria-hidden={!isModified}
          tabIndex={isModified ? undefined : -1}
        >
          <RotateCcw size={16} aria-hidden />
        </button>
      </legend>

      {SLIDERS.map(({ key, label, min, max }) => (
        <div key={key}>
          <label className="field-label" htmlFor={`${key}Slider`}>
            {label} <span className="tabular-nums">{adjustments[key]}</span>
          </label>
          <input
            id={`${key}Slider`}
            type="range"
            min={min}
            max={max}
            step={1}
            value={adjustments[key]}
            onChange={(event) =>
              onChange({ ...adjustments, [key]: Number(event.target.value) })
            }
            // Double-click a slider to reset just that one, as before.
            onDoubleClick={() =>
              onChange({ ...adjustments, [key]: DEFAULT_ADJUSTMENTS[key] })
            }
          />
        </div>
      ))}
    </fieldset>
  )
}
