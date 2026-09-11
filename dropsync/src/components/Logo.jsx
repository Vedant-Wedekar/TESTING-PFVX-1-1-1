export default function Logo({ size = 'md' }) {
  const dims = size === 'lg' ? 'h-11 w-11' : 'h-8 w-8'
  const text = size === 'lg' ? 'text-2xl' : 'text-lg'
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div
        className={`${dims} rounded-[10px] bg-gradient-to-br from-pulse to-pulse-soft flex items-center justify-center shadow-soft relative`}
      >
        <span className="absolute inset-0 rounded-[10px] bg-pulse/40 animate-pulseDot" />
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-[55%] w-[55%] relative"
        >
          <path
            d="M12 3v9m0 0l-3.5-3.5M12 12l3.5-3.5M6 15.5c0 3 2.7 5.5 6 5.5s6-2.5 6-5.5"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span className={`${text} font-semibold tracking-tight`}>DropSync</span>
    </div>
  )
}
