/**
 * A solid Latin cross, drawn here rather than pulled from an icon set: the
 * original used a Font Awesome kit tied to a personal account, and lucide only
 * ships a Greek (plus-shaped) cross. Proportions follow the 0.75em-wide,
 * 1em-tall box icon fonts use, so it sits correctly beside the wordmark.
 */
function Cross({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 384 512"
      className={className}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="144" y="0" width="96" height="512" rx="16" />
      <rect x="48" y="96" width="288" height="96" rx="16" />
    </svg>
  )
}

export default function NavBar() {
  return (
    <header>
      <nav className="mx-auto max-w-[1320px] px-3 py-4">
        <a
          href="/"
          className="inline-flex items-center gap-3 py-[0.3125rem] text-xl/[1.5] font-semibold uppercase text-ink"
        >
          <Cross className="h-5 w-[0.9375rem] shrink-0" />
          Church Photo Board Maker
        </a>
      </nav>
    </header>
  )
}
