import { Cross } from 'lucide-react'

export default function NavBar() {
  return (
    <header className="border-b border-line">
      <nav className="mx-auto flex max-w-7xl items-center px-4 py-6">
        <a
          href="/"
          className="flex items-center gap-2 font-serif text-xl font-semibold uppercase tracking-tight text-ink"
        >
          <Cross size={20} aria-hidden />
          Church Photo Board Maker
        </a>
      </nav>
    </header>
  )
}
