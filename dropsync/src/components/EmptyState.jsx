export default function EmptyState({ filtered }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <svg width="88" height="88" viewBox="0 0 88 88" fill="none" className="mb-4 opacity-80">
        <rect x="14" y="20" width="60" height="48" rx="10" className="fill-paper-dim dark:fill-white/5" />
        <path
          d="M30 44h28M30 54h18"
          stroke="currentColor"
          className="text-ink-faint dark:text-paper/25"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="44" cy="20" r="6" className="fill-pulse" />
      </svg>
      <p className="text-sm font-medium text-ink dark:text-paper">
        {filtered ? 'Nothing matches' : 'Room is empty'}
      </p>
      <p className="text-xs text-ink-faint dark:text-paper/40 mt-1 max-w-[220px]">
        {filtered
          ? 'Try a different search or filter.'
          : 'Paste text or drop an image above to get started.'}
      </p>
    </div>
  )
}
