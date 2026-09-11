import { motion, AnimatePresence } from 'framer-motion'
import { FiStar, FiX, FiLock } from 'react-icons/fi'

export default function RecentRooms({ rooms, onOpen, onFavourite, onRemove }) {
  if (!rooms.length) return null

  const sorted = [...rooms].sort((a, b) => {
    if (a.favourite !== b.favourite) return a.favourite ? -1 : 1
    return b.lastJoined - a.lastJoined
  })

  return (
    <div className="w-full max-w-sm mt-8">
      <p className="text-xs font-mono uppercase tracking-wider text-ink-faint dark:text-paper/40 mb-3">
        Recent rooms
      </p>
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {sorted.map((room) => (
            <motion.div
              key={room.roomId}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="group flex items-center justify-between card-surface px-4 py-3"
            >
              <button
                onClick={() => onOpen(room)}
                className="flex items-center gap-2.5 flex-1 text-left min-w-0"
              >
                <span className="font-mono text-sm tabular-nums text-ink dark:text-paper">
                  {room.roomId}
                </span>
                {room.hasPassword && (
                  <FiLock size={11} className="text-ink-faint dark:text-paper/40 shrink-0" />
                )}
                {room.nickname && (
                  <span className="text-sm text-ink-faint dark:text-paper/40 truncate">
                    {room.nickname}
                  </span>
                )}
              </button>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                <button
                  onClick={() => onFavourite(room.roomId)}
                  className="btn-icon h-7 w-7"
                  aria-label="Favourite room"
                >
                  <FiStar
                    size={14}
                    className={room.favourite ? 'fill-signal-amber text-signal-amber' : ''}
                  />
                </button>
                <button
                  onClick={() => onRemove(room.roomId)}
                  className="btn-icon h-7 w-7"
                  aria-label="Remove room"
                >
                  <FiX size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
