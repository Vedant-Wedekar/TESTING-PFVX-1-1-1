import { forwardRef } from 'react'
import { FiSearch, FiX } from 'react-icons/fi'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'text', label: 'Text' },
  { key: 'image', label: 'Images' },
  { key: 'pinned', label: 'Pinned' },
]

const SORTS = [
  { key: 'newest', label: 'Newest' },
  { key: 'oldest', label: 'Oldest' },
]

const SearchFilterBar = forwardRef(function SearchFilterBar(
  { query, onQuery, filter, onFilter, sort, onSort },
  ref
) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3">
      <div className="relative flex-1">
        <FiSearch
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint dark:text-paper/30"
        />
        <input
          ref={ref}
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search text…"
          className="w-full bg-white dark:bg-surface-darkRaised border border-line dark:border-line-dark rounded-xl pl-9 pr-8 py-2 text-sm outline-none focus:ring-2 focus:ring-pulse/40 transition-shadow"
        />
        {query && (
          <button
            onClick={() => onQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-faint dark:text-paper/30 hover:text-ink dark:hover:text-paper"
          >
            <FiX size={14} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-1 bg-paper-dim dark:bg-white/5 rounded-lg p-1 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => onFilter(f.key)}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
              filter === f.key
                ? 'bg-white dark:bg-surface-darkRaised text-ink dark:text-paper shadow-sm'
                : 'text-ink-faint dark:text-paper/40 hover:text-ink dark:hover:text-paper'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <select
        value={sort}
        onChange={(e) => onSort(e.target.value)}
        className="bg-paper-dim dark:bg-white/5 rounded-lg px-2.5 py-2 text-xs font-medium outline-none cursor-pointer"
      >
        {SORTS.map((s) => (
          <option key={s.key} value={s.key}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  )
})

export default SearchFilterBar
