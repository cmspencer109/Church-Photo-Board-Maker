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
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 flex w-full items-center justify-between">
        <span className="panel-heading">Adjustments</span>
        {isModified && (
          <button
            type="button"
            className="btn btn-light px-2 py-1 opacity-70 hover:opacity-100"
            onClick={() => onChange(DEFAULT_ADJUSTMENTS)}
            aria-label="Reset all adjustments"
          >
            <RotateCcw size={14} aria-hidden />
          </button>
        )}
      </legend>

      {SLIDERS.map(({ key, label, min, max }) => (
        <div key={key}>
          <label
            className="field-label flex items-baseline justify-between"
            htmlFor={`${key}Slider`}
          >
            {label}
            <span className="font-normal tabular-nums text-body">
              {adjustments[key]}
            </span>
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
