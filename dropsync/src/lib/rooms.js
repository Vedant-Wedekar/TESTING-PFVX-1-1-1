import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import { sha256 } from '../utils/hash'

/**
 * Ensures a room document exists. If it doesn't, creates it (optionally with
 * a hashed password). If it does, verifies the supplied password matches.
 * Returns { ok: true } or { ok: false, reason: 'wrong-password' | 'error' }.
 */
export async function joinOrCreateRoom(roomId, password) {
  const ref = doc(db, 'rooms', roomId)
  const snap = await getDoc(ref)

  if (!snap.exists()) {
    const passwordHash = password ? await sha256(password) : null
    await setDoc(ref, {
      roomId,
      passwordHash,
      createdAt: serverTimestamp(),
      lastActivity: serverTimestamp(),
    })
    return { ok: true, created: true }
  }

  const data = snap.data()
  if (data.passwordHash) {
    if (!password) return { ok: false, reason: 'password-required' }
    const hash = await sha256(password)
    if (hash !== data.passwordHash) return { ok: false, reason: 'wrong-password' }
  }
  return { ok: true, created: false }
}

export async function deleteRoom(roomId) {
  await deleteDoc(doc(db, 'rooms', roomId))
}

export async function touchRoom(roomId) {
  try {
    await setDoc(
      doc(db, 'rooms', roomId),
      { lastActivity: serverTimestamp() },
      { merge: true }
    )
  } catch {
    // non-critical
  }
}
