const RECENT_KEY = 'dropsync.recentRooms'
const DEVICE_KEY = 'dropsync.deviceId'
const THEME_KEY = 'dropsync.theme'

export function getDeviceId() {
  let id = localStorage.getItem(DEVICE_KEY)
  if (!id) {
    id = crypto.randomUUID().slice(0, 8)
    localStorage.setItem(DEVICE_KEY, id)
  }
  return id
}

export function detectDeviceLabel() {
  const ua = navigator.userAgent
  if (/iPhone|Android.*Mobile/i.test(ua)) return 'Mobile'
  if (/iPad|Android/i.test(ua)) return 'Tablet'
  return 'Laptop'
}

export function getRecentRooms() {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveRecentRoom({ roomId, nickname, hasPassword, password }) {
  const rooms = getRecentRooms()
  const existing = rooms.find((r) => r.roomId === roomId)
  const entry = {
    roomId,
    nickname: nickname || existing?.nickname || '',
    hasPassword: !!hasPassword,
    password: password || existing?.password || '',
    favourite: existing?.favourite || false,
    lastJoined: Date.now(),
  }
  const filtered = rooms.filter((r) => r.roomId !== roomId)
  const updated = [entry, ...filtered].slice(0, 12)
  localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
  return updated
}

export function removeRecentRoom(roomId) {
  const rooms = getRecentRooms().filter((r) => r.roomId !== roomId)
  localStorage.setItem(RECENT_KEY, JSON.stringify(rooms))
  return rooms
}

export function toggleFavouriteRoom(roomId) {
  const rooms = getRecentRooms().map((r) =>
    r.roomId === roomId ? { ...r, favourite: !r.favourite } : r
  )
  localStorage.setItem(RECENT_KEY, JSON.stringify(rooms))
  return rooms
}

export function renameRoomLocally(roomId, nickname) {
  const rooms = getRecentRooms().map((r) =>
    r.roomId === roomId ? { ...r, nickname } : r
  )
  localStorage.setItem(RECENT_KEY, JSON.stringify(rooms))
  return rooms
}

export function getStoredTheme() {
  return localStorage.getItem(THEME_KEY)
}

export function setStoredTheme(theme) {
  localStorage.setItem(THEME_KEY, theme)
}
