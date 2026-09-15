import type { CardData, Role } from '../types'

interface InfoPanelProps {
  data: CardData
  busy: boolean
  onChange: <K extends keyof CardData>(key: K, value: CardData[K]) => void
  onDownload: () => void
}

const ROLES: { value: Role; label: string }[] = [
  { value: 'member', label: 'Member' },
  { value: 'leader', label: 'Leader' },
]

export default function InfoPanel({
  data,
  busy,
  onChange,
  onDownload,
}: InfoPanelProps) {
  const canDownload =
    data.role === 'member'
      ? data.familyName !== '' && data.parentsNames !== ''
      : data.leaderName !== '' && data.leaderRole !== ''

  return (
    <section className="flex flex-col gap-4">
      <div className="inline-flex" role="group" aria-label="Card type">
        {ROLES.map(({ value, label }, index) => (
          <button
            key={value}
            type="button"
            aria-pressed={data.role === value}
            onClick={() => onChange('role', value)}
            className={[
              'btn btn-toggle',
              data.role === value ? 'btn-toggle-on' : 'btn-toggle-off',
              index > 0 ? '-ml-0.5' : '',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {data.role === 'member' ? (
        <>
          <div>
            <label className="field-label" htmlFor="familyName">
              Family Name
            </label>
            <input
              id="familyName"
              className="field"
              autoComplete="off"
              placeholder="Luther"
              value={data.familyName}
              onChange={(event) => onChange('familyName', event.target.value)}
            />
          </div>

          <div>
            <label className="field-label flex items-baseline justify-between" htmlFor="parents">
              Parents
              <small className="field-hint">\n for new line</small>
            </label>
            <input
              id="parents"
              className="field"
              autoComplete="off"
              placeholder="Martin &amp; Katie"
              value={data.parentsNames}
              onChange={(event) => onChange('parentsNames', event.target.value)}
            />
          </div>

          <div>
            <label className="field-label" htmlFor="children">
              Children
            </label>
            <textarea
              id="children"
              className="field resize-y"
              autoComplete="off"
              rows={6}
              placeholder={'Hans\nElizabeth\nMagdalene\nMartin\nPaul\nMargaret'}
              value={data.childrensNames}
              onChange={(event) => onChange('childrensNames', event.target.value)}
            />
          </div>
        </>
      ) : (
        <>
          <div>
            <label className="field-label" htmlFor="leaderName">
              Full Name
            </label>
            <input
              id="leaderName"
              className="field"
              autoComplete="off"
              placeholder="Martin Luther"
              value={data.leaderName}
              onChange={(event) => onChange('leaderName', event.target.value)}
            />
          </div>

          <div>
            <label className="field-label" htmlFor="leaderRole">
              Role
            </label>
            <input
              id="leaderRole"
              className="field"
              autoComplete="off"
              list="suggestedRoles"
              placeholder="Enter a role"
              value={data.leaderRole}
              onChange={(event) => onChange('leaderRole', event.target.value)}
            />
            <datalist id="suggestedRoles">
              <option value="Councilman" />
              <option value="Pastor" />
            </datalist>
          </div>

          <div>
            <label className="field-label" htmlFor="leaderTitle">
              Title
            </label>
            <input
              id="leaderTitle"
              className="field"
              autoComplete="off"
              placeholder="Chairman of ..."
              value={data.leaderTitle}
              onChange={(event) => onChange('leaderTitle', event.target.value)}
            />
          </div>
        </>
      )}

      <button
        type="button"
        className="btn btn-success self-start"
        disabled={!canDownload || busy}
        onClick={onDownload}
      >
        {busy ? 'Working…' : 'Download'}
      </button>
    </section>
  )
}
