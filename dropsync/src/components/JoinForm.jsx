import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiArrowRight, FiLock, FiShuffle } from 'react-icons/fi'
import { generateRoomId } from '../utils/hash'

export default function JoinForm({ onJoin, loading }) {
  const [roomId, setRoomId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const cleaned = roomId.trim()
    if (!cleaned) return
    onJoin({ roomId: cleaned, password: password.trim() || null })
  }

  const randomize = () => setRoomId(generateRoomId())

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="card-surface p-6 sm:p-8 w-full max-w-sm"
    >
      <label className="text-xs font-mono uppercase tracking-wider text-ink-faint dark:text-paper/40">
        Room ID
      </label>
      <div className="mt-2 flex items-center gap-2">
        <input
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="1234"
          inputMode="numeric"
          autoFocus
          className="flex-1 font-mono text-2xl tracking-[0.2em] bg-paper-dim dark:bg-white/5 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pulse/50 transition-shadow"
        />
        <button
          type="button"
          onClick={randomize}
          title="Generate random room ID"
          className="btn-icon h-[52px] w-[52px] bg-paper-dim dark:bg-white/5"
        >
          <FiShuffle size={17} />
        </button>
      </div>

      <button
        type="button"
        onClick={() => setShowPassword((s) => !s)}
        className="mt-4 text-xs text-ink-faint dark:text-paper/40 hover:text-pulse transition-colors flex items-center gap-1"
      >
        <FiLock size={12} />
        {showPassword ? 'Remove password' : 'Add password (optional)'}
      </button>

      {showPassword && (
        <motion.input
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="mt-3 w-full bg-paper-dim dark:bg-white/5 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pulse/50 transition-shadow"
        />
      )}

      <button
        type="submit"
        disabled={!roomId.trim() || loading}
        className="mt-6 w-full flex items-center justify-center gap-2 bg-ink dark:bg-paper text-paper dark:text-ink font-medium py-3 rounded-xl hover:opacity-90 active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? 'Joining…' : 'Join room'}
        {!loading && <FiArrowRight size={16} />}
      </button>
    </motion.form>
  )
}
