import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiMoreVertical,
  FiShare2,
  FiStar,
  FiEdit2,
  FiTrash2,
  FiClock,
  FiArrowLeft,
} from 'react-icons/fi'
import { BsStarFill } from 'react-icons/bs'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import SyncPulse from './SyncPulse'
import { EXPIRY_OPTIONS } from '../lib/messages'

const EXPIRY_LABELS = { '1h': '1 hour', '6h': '6 hours', '24h': '24 hours', never: 'Never' }

export default function RoomHeader({
  roomId,
  online,
  favourite,
  onToggleFavourite,
  onRename,
  onDeleteRoom,
  onShare,
  expiry,
  onExpiryChange,
}) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  return (
    <header className="sticky top-0 z-20 glass border-b border-line dark:border-line-dark">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate('/')}
            className="btn-icon shrink-0"
            aria-label="Back to home"
          >
            <FiArrowLeft size={17} />
          </button>
          <div className="hidden sm:block">
            <Logo size="sm" />
          </div>
          <div className="h-6 w-px bg-line dark:bg-line-dark hidden sm:block" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-semibold text-base tracking-wider">
                {roomId}
              </span>
              {favourite && <BsStarFill size={12} className="text-signal-amber" />}
            </div>
            <SyncPulse online={online} label={online ? 'Live' : 'Reconnecting'} />
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <button onClick={onShare} className="btn-icon" aria-label="Share room">
            <FiShare2 size={16} />
          </button>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="btn-icon"
              aria-label="Room options"
            >
              <FiMoreVertical size={16} />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 card-surface py-1.5 overflow-hidden"
                >
                  <button
                    onClick={() => {
                      onToggleFavourite()
                      setMenuOpen(false)
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm hover:bg-paper-dim dark:hover:bg-white/5 transition-colors"
                  >
                    <FiStar size={14} />
                    {favourite ? 'Remove favourite' : 'Add to favourites'}
                  </button>
                  <button
                    onClick={() => {
                      const name = window.prompt('Rename this room (only visible to you)')
                      if (name !== null) onRename(name)
                      setMenuOpen(false)
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm hover:bg-paper-dim dark:hover:bg-white/5 transition-colors"
                  >
                    <FiEdit2 size={14} />
                    Rename locally
                  </button>

                  <div className="px-3.5 pt-2 pb-1.5 text-[11px] font-mono uppercase tracking-wider text-ink-faint dark:text-paper/30 flex items-center gap-1.5">
                    <FiClock size={11} />
                    Auto-delete uploads
                  </div>
                  <div className="px-2 pb-1.5 flex flex-wrap gap-1">
                    {Object.keys(EXPIRY_OPTIONS).map((key) => (
                      <button
                        key={key}
                        onClick={() => onExpiryChange(key)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                          expiry === key
                            ? 'bg-pulse text-white'
                            : 'bg-paper-dim dark:bg-white/5 text-ink-faint dark:text-paper/40 hover:text-ink dark:hover:text-paper'
                        }`}
                      >
                        {EXPIRY_LABELS[key]}
                      </button>
                    ))}
                  </div>

                  <div className="h-px bg-line dark:bg-line-dark my-1" />

                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      if (window.confirm('Delete this room and every upload in it? This cannot be undone.')) {
                        onDeleteRoom()
                      }
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-signal-red hover:bg-signal-red/5 transition-colors"
                  >
                    <FiTrash2 size={14} />
                    Delete room
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}
