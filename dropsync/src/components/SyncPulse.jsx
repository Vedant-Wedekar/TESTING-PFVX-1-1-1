export default function SyncPulse({ online = true, label }) {
  return (
    <div className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-faint dark:text-paper/50">
      <span className="relative flex h-2 w-2">
        <span
          className={`absolute inline-flex h-full w-full rounded-full ${
            online ? 'bg-signal-green' : 'bg-signal-amber'
          } ${online ? 'animate-pulseDot' : ''}`}
        />
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            online ? 'bg-signal-green' : 'bg-signal-amber'
          }`}
        />
      </span>
      {label && <span>{label}</span>}
    </div>
  )
}
