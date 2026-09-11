import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import JoinForm from '../components/JoinForm'
import RecentRooms from '../components/RecentRooms'
import { joinOrCreateRoom } from '../lib/rooms'
import {
  getRecentRooms,
  saveRecentRoom,
  removeRecentRoom,
  toggleFavouriteRoom,
} from '../utils/localRooms'

export default function Home() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [rooms, setRooms] = useState([])

  useEffect(() => {
    setRooms(getRecentRooms())
  }, [])

  const attemptJoin = async ({ roomId, password }) => {
    setLoading(true)
    try {
      const result = await joinOrCreateRoom(roomId, password)
      if (!result.ok) {
        if (result.reason === 'password-required') {
          toast.error('This room needs a password.')
        } else if (result.reason === 'wrong-password') {
          toast.error('Wrong password.')
        } else {
          toast.error('Could not join room.')
        }
        setLoading(false)
        return
      }
      saveRecentRoom({ roomId, hasPassword: !!password, password })
      navigate(`/room/${roomId}`, { state: { password } })
    } catch (err) {
      toast.error('Connection error. Check your setup.')
      setLoading(false)
    }
  }

  const openRoom = (room) => {
    if (room.hasPassword && !room.password) {
      const pw = window.prompt(`Password for room ${room.roomId}`)
      if (pw === null) return
      attemptJoin({ roomId: room.roomId, password: pw })
      return
    }
    attemptJoin({ roomId: room.roomId, password: room.password })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-5 sm:px-8 py-5">
        <Logo />
        <ThemeToggle />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-5 pb-16">
        <div className="text-center mb-8 max-w-sm">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Paste on one. Appear on all.
          </h1>
          <p className="mt-2 text-sm text-ink-faint dark:text-paper/50 leading-relaxed">
            A private room that syncs text and images between your devices,
            instantly. No account, nothing to install.
          </p>
        </div>

        <JoinForm onJoin={attemptJoin} loading={loading} />

        <RecentRooms
          rooms={rooms}
          onOpen={openRoom}
          onFavourite={(id) => setRooms(toggleFavouriteRoom(id))}
          onRemove={(id) => setRooms(removeRecentRoom(id))}
        />
      </main>

      <footer className="text-center pb-6 text-xs text-ink-faint dark:text-paper/30 font-mono">
        rooms are ephemeral — nothing to sign in to
      </footer>
    </div>
  )
}
