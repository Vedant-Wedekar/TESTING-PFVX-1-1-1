// Lightweight client-side hashing for optional room passwords.
// Note: this is obfuscation, not real authentication — see README security notes.
export async function sha256(text) {
  const enc = new TextEncoder().encode(text)
  const buf = await crypto.subtle.digest('SHA-256', enc)
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function generateRoomId(length = 6) {
  const digits = '0123456789'
  let id = ''
  for (let i = 0; i < length; i++) {
    id += digits[Math.floor(Math.random() * digits.length)]
  }
  return id
}
