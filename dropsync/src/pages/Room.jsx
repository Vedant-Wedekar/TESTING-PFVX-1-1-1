import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import toast from 'react-hot-toast'

import RoomHeader from '../components/RoomHeader'
import UploadZone from '../components/UploadZone'
import SearchFilterBar from '../components/SearchFilterBar'
import TextCard from '../components/TextCard'
import ImageCard from '../components/ImageCard'
import Lightbox from '../components/Lightbox'
import ShareModal from '../components/ShareModal'
import EmptyState from '../components/EmptyState'
import SkeletonCard from '../components/SkeletonCard'
import OfflineBanner from '../components/OfflineBanner'
import MobileBar from '../components/MobileBar'

import { joinOrCreateRoom, deleteRoom, touchRoom } from '../lib/rooms'
import {
  listenToMessages,
  deleteMessage,
  togglePin,
  purgeExpired,
  EXPIRY_OPTIONS,
} from '../lib/messages'
import { useUploadQueue } from '../hooks/useUploadQueue'
import {
  getRecentRooms,
  saveRecentRoom,
  removeRecentRoom,
  toggleFavouriteRoom,
  renameRoomLocally,
  getDeviceId,
  detectDeviceLabel,
} from '../utils/localRooms'

export default function Room() {
  const { roomId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const [status, setStatus] = useState('checking') // checking | ready | denied
  const [messages, setMessages] = useState([])
  const [loadingMessages, setLoadingMessages] = useState(true)

  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('newest')

  const [expiry, setExpiry] = useState('24h')
  const [lightboxId, setLightboxId] = useState(null)
  const [shareOpen, setShareOpen] = useState(false)
  const [favourite, setFavourite] = useState(false)

  const uploadZoneRef = useRef(null)
  const searchRef = useRef(null)
  const device = useMemo(() => detectDeviceLabel(), [])
  const { online, queuedCount, enqueueOrRun } = useUploadQueue(roomId)

  // --- Join / password gate ---
  useEffect(() => {
    let cancelled = false
    async function verify() {
      const suppliedPassword = location.state?.password || null
      const result = await joinOrCreateRoom(roomId, suppliedPassword)
      if (cancelled) return
      if (!result.ok) {
        if (result.reason === 'password-required' || result.reason === 'wrong-password') {
          const pw = window.prompt(
            result.reason === 'wrong-password'
              ? 'Wrong password. Try again:'
              : `Room ${roomId} needs a password:`
          )
          if (pw === null) {
            navigate('/')
            return
          }
          const retry = await joinOrCreateRoom(roomId, pw)
          if (!retry.ok) {
            toast.error('Could not join room.')
            navigate('/')
            return
          }
          saveRecentRoom({ roomId, hasPassword: true, password: pw })
        } else {
          toast.error('Could not join room.')
          navigate('/')
          return
        }
      } else {
        saveRecentRoom({ roomId, hasPassword: false })
      }
      setStatus('ready')
    }
    verify()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId])

  useEffect(() => {
    const rooms = getRecentRooms()
    const room = rooms.find((r) => r.roomId === roomId)
    setFavourite(!!room?.favourite)
  }, [roomId])

  // --- Realtime listener ---
  useEffect(() => {
    if (status !== 'ready') return
    const unsub = listenToMessages(
      roomId,
      (items) => {
        setMessages(items)
        setLoadingMessages(false)
      },
      () => toast.error('Lost connection to room.')
    )
    return unsub
  }, [roomId, status])

  // --- Periodic expiry cleanup ---
  useEffect(() => {
    if (status !== 'ready') return
    const run = () => purgeExpired(roomId, messages).catch(() => {})
    const interval = setInterval(run, 60 * 1000)
    return () => clearInterval(interval)
  }, [roomId, status, messages])

  // --- Keyboard shortcuts ---
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleText = async (text) => {
    try {
      await enqueueOrRun({
        kind: 'text',
        payload: { content: text, device, expiryMs: EXPIRY_OPTIONS[expiry] },
      })
      touchRoom(roomId)
    } catch {
      toast.error('Failed to send text.')
    }
  }

  const handleImages = async (files) => {
    for (const file of files) {
      const id = toast.loading(`Uploading ${file.name}…`)
      try {
        await enqueueOrRun({
          kind: 'image',
          file,
          payload: { device, expiryMs: EXPIRY_OPTIONS[expiry] },
        })
        toast.success('Uploaded', { id })
        touchRoom(roomId)
      } catch (err) {
        toast.error(err.message || 'Upload failed', { id })
      }
    }
  }

  const handleDelete = async (message) => {
    try {
      await deleteMessage(roomId, message)
      toast.success('Deleted')
    } catch {
      toast.error('Delete failed')
    }
  }

  const handleTogglePin = async (message) => {
    try {
      await togglePin(roomId, message)
    } catch {
      toast.error('Could not update pin')
    }
  }

  const handleDeleteRoom = async () => {
    try {
      await deleteRoom(roomId)
      removeRecentRoom(roomId)
      toast.success('Room deleted')
      navigate('/')
    } catch {
      toast.error('Could not delete room')
    }
  }

  const handleToggleFavourite = () => {
    toggleFavouriteRoom(roomId)
    setFavourite((f) => !f)
  }

  const handleRename = (name) => {
    renameRoomLocally(roomId, name)
  }

  const filtered = useMemo(() => {
    let list = messages
    if (filter === 'text') list = list.filter((m) => m.type === 'text')
    if (filter === 'image') list = list.filter((m) => m.type === 'image')
    if (filter === 'pinned') list = list.filter((m) => m.pinned)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (m) => m.type === 'text' && m.content.toLowerCase().includes(q)
      )
    }
    // pinned first, then sort by date
    const pinned = list.filter((m) => m.pinned)
    const rest = list.filter((m) => !m.pinned)
    const sortFn = (a, b) => {
      const at = a.createdAt?.toMillis?.() || 0
      const bt = b.createdAt?.toMillis?.() || 0
      return sort === 'newest' ? bt - at : at - bt
    }
    return [...pinned.sort(sortFn), ...rest.sort(sortFn)]
  }, [messages, filter, query, sort])

  const images = useMemo(() => messages.filter((m) => m.type === 'image'), [messages])

  if (status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-pulse border-t-transparent animate-spin" />
          <p className="text-sm text-ink-faint dark:text-paper/40 font-mono">
            connecting to room {roomId}…
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24 sm:pb-10">
      <RoomHeader
        roomId={roomId}
        online={online}
        favourite={favourite}
        onToggleFavourite={handleToggleFavourite}
        onRename={handleRename}
        onDeleteRoom={handleDeleteRoom}
        onShare={() => setShareOpen(true)}
        expiry={expiry}
        onExpiryChange={setExpiry}
      />

      <OfflineBanner online={online} queuedCount={queuedCount} />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-5 space-y-5">
        <div ref={uploadZoneRef}>
          <UploadZone onText={handleText} onImages={handleImages} disabled={!online && false} />
        </div>

        <SearchFilterBar
          ref={searchRef}
          query={query}
          onQuery={setQuery}
          filter={filter}
          onFilter={setFilter}
          sort={sort}
          onSort={setSort}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {loadingMessages ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : filtered.length === 0 ? (
            <div className="sm:col-span-2">
              <EmptyState filtered={!!query || filter !== 'all'} />
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {filtered.map((m) => (
                <motion.div
                  key={m.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className={m.type === 'text' ? 'sm:col-span-2' : ''}
                >
                  {m.type === 'text' ? (
                    <TextCard
                      message={m}
                      onDelete={handleDelete}
                      onTogglePin={handleTogglePin}
                    />
                  ) : (
                    <ImageCard
                      message={m}
                      onDelete={handleDelete}
                      onTogglePin={handleTogglePin}
                      onOpenFullscreen={(msg) => setLightboxId(msg.id)}
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </main>

      <MobileBar
        onFocusSearch={() => searchRef.current?.focus()}
        onFocusUpload={() =>
          uploadZoneRef.current?.querySelector('textarea')?.focus()
        }
        onQuickPaste={async () => {
          try {
            const text = await navigator.clipboard.readText()
            if (text) handleText(text)
          } catch {
            toast.error('Long-press the upload box to paste on mobile')
          }
        }}
      />

      {lightboxId && (
        <Lightbox
          images={images}
          activeId={lightboxId}
          onClose={() => setLightboxId(null)}
          onNavigate={setLightboxId}
        />
      )}

      <ShareModal roomId={roomId} open={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  )
}
