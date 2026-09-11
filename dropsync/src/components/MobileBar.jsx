import { FiPlus, FiCopy, FiSearch } from 'react-icons/fi'

export default function MobileBar({ onQuickPaste, onFocusSearch, onFocusUpload }) {
  return (
    <div className="sm:hidden fixed bottom-0 inset-x-0 z-20 glass border-t border-line dark:border-line-dark px-6 py-2.5 flex items-center justify-around">
      <button
        onClick={onFocusSearch}
        className="flex flex-col items-center gap-0.5 text-ink-faint dark:text-paper/40 py-1 px-3"
      >
        <FiSearch size={19} />
        <span className="text-[10px] font-medium">Search</span>
      </button>
      <button
        onClick={onFocusUpload}
        className="flex flex-col items-center gap-1 -mt-6 bg-pulse text-white h-14 w-14 rounded-full shadow-lg shadow-pulse/30 active:scale-95 transition"
      >
        <FiPlus size={24} className="mx-auto" />
      </button>
      <button
        onClick={onQuickPaste}
        className="flex flex-col items-center gap-0.5 text-ink-faint dark:text-paper/40 py-1 px-3"
      >
        <FiCopy size={19} />
        <span className="text-[10px] font-medium">Paste</span>
      </button>
    </div>
  )
}
