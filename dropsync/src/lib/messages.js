import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'
import { db, storage } from './firebase'
import imageCompression from 'browser-image-compression'

export const EXPIRY_OPTIONS = {
  '1h': 60 * 60 * 1000,
  '6h': 6 * 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  never: null,
}

const MAX_IMAGE_BYTES = 20 * 1024 * 1024 // 20MB pre-compression cap

function messagesCol(roomId) {
  return collection(db, 'rooms', roomId, 'messages')
}

export function listenToMessages(roomId, callback, onError) {
  const q = query(messagesCol(roomId), orderBy('createdAt', 'desc'))
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      callback(items)
    },
    (err) => onError?.(err)
  )
}

export async function addTextMessage(roomId, { content, device, expiryMs }) {
  if (!content?.trim()) return
  await addDoc(messagesCol(roomId), {
    type: 'text',
    content: content.slice(0, 20000),
    device: device || 'Unknown',
    createdAt: serverTimestamp(),
    expiresAt: expiryMs ? Timestamp.fromMillis(Date.now() + expiryMs) : null,
    pinned: false,
  })
}

export async function addImageMessage(
  roomId,
  file,
  { device, expiryMs, onProgress }
) {
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('Image exceeds the 20 MB limit.')
  }

  let toUpload = file
  try {
    if (file.size > 1.5 * 1024 * 1024) {
      toUpload = await imageCompression(file, {
        maxSizeMB: 1.5,
        maxWidthOrHeight: 2560,
        useWebWorker: true,
        initialQuality: 0.82,
      })
    }
  } catch {
    toUpload = file // fall back to original if compression fails
  }

  const path = `room-images/${roomId}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const storageRef = ref(storage, path)
  const task = uploadBytesResumable(storageRef, toUpload, {
    contentType: toUpload.type || file.type,
  })

  await new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      (snap) => {
        const pct = (snap.bytesTransferred / snap.totalBytes) * 100
        onProgress?.(pct)
      },
      reject,
      resolve
    )
  })

  const imageURL = await getDownloadURL(storageRef)

  await addDoc(messagesCol(roomId), {
    type: 'image',
    imageURL,
    storagePath: path,
    fileName: file.name,
    size: toUpload.size,
    device: device || 'Unknown',
    createdAt: serverTimestamp(),
    expiresAt: expiryMs ? Timestamp.fromMillis(Date.now() + expiryMs) : null,
    pinned: false,
  })
}

export async function deleteMessage(roomId, message) {
  if (message.type === 'image' && message.storagePath) {
    try {
      await deleteObject(ref(storage, message.storagePath))
    } catch {
      // object may already be gone
    }
  }
  await deleteDoc(doc(db, 'rooms', roomId, 'messages', message.id))
}

export async function togglePin(roomId, message) {
  await updateDoc(doc(db, 'rooms', roomId, 'messages', message.id), {
    pinned: !message.pinned,
  })
}

/** Deletes any messages in the loaded list whose expiresAt has passed. */
export async function purgeExpired(roomId, messages) {
  const now = Date.now()
  const expired = messages.filter(
    (m) => m.expiresAt && m.expiresAt.toMillis?.() < now
  )
  await Promise.all(expired.map((m) => deleteMessage(roomId, m)))
  return expired.length
}
