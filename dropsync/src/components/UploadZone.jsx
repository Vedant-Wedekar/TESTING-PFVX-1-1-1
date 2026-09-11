import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiUploadCloud, FiImage } from 'react-icons/fi'
import toast from 'react-hot-toast'

const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']

export default function UploadZone({ onText, onImages, disabled }) {
  const [dragging, setDragging] = useState(false)
  const [textValue, setTextValue] = useState('')
  const dragCounter = useRef(0)
  const fileInputRef = useRef(null)
  const zoneRef = useRef(null)

  const handleFiles = useCallback(
    (fileList) => {
      const files = Array.from(fileList).filter((f) =>
        ACCEPTED.includes(f.type)
      )
      if (!files.length) {
        toast.error('Only PNG, JPEG, WEBP or GIF images are supported.')
        return
      }
      onImages(files)
    },
    [onImages]
  )

  // Global paste handler (Ctrl+V) — text or clipboard image
  useEffect(() => {
    const handler = (e) => {
      if (disabled) return
      const active = document.activeElement
      // Let the textarea handle its own text paste natively; we only
      // intercept when the target isn't a text input, or when an image
      // is present in the clipboard.
      const items = e.clipboardData?.items
      if (!items) return

      const imageItems = Array.from(items).filter((it) =>
        it.type.startsWith('image/')
      )
      if (imageItems.length) {
        e.preventDefault()
        const files = imageItems
          .map((it) => it.getAsFile())
          .filter(Boolean)
        if (files.length) onImages(files)
        return
      }

      if (active?.tagName !== 'TEXTAREA' && active?.tagName !== 'INPUT') {
        const text = e.clipboardData.getData('text/plain')
        if (text) {
          e.preventDefault()
          onText(text)
        }
      }
    }
    window.addEventListener('paste', handler)
    return () => window.removeEventListener('paste', handler)
  }, [onText, onImages, disabled])

  const onDragEnter = (e) => {
    e.preventDefault()
    dragCounter.current += 1
    setDragging(true)
  }
  const onDragLeave = (e) => {
    e.preventDefault()
    dragCounter.current -= 1
    if (dragCounter.current <= 0) setDragging(false)
  }
  const onDragOver = (e) => e.preventDefault()
  const onDrop = (e) => {
    e.preventDefault()
    dragCounter.current = 0
    setDragging(false)
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files)
  }

  const submitText = () => {
    if (!textValue.trim()) return
    onText(textValue)
    setTextValue('')
  }

  return (
    <div
      ref={zoneRef}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="relative"
    >
      <div
        className={`card-surface p-4 sm:p-5 transition-all ${
          dragging ? 'ring-2 ring-pulse border-pulse' : ''
        }`}
      >
        <textarea
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submitText()
          }}
          placeholder="Type or paste text… (⌘/Ctrl + Enter to send)"
          rows={3}
          className="w-full resize-none bg-transparent outline-none placeholder:text-ink-faint dark:placeholder:text-paper/30 text-[15px] leading-relaxed"
        />
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-line dark:border-line-dark">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 text-xs font-medium text-ink-faint dark:text-paper/40 hover:text-pulse transition-colors"
          >
            <FiImage size={14} />
            Add image
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-ink-faint dark:text-paper/30">
              {textValue.length} chars
            </span>
            <button
              onClick={submitText}
              disabled={!textValue.trim() || disabled}
              className="text-xs font-semibold bg-pulse text-white px-3.5 py-1.5 rounded-lg hover:bg-pulse-soft transition disabled:opacity-30"
            >
              Send
            </button>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED.join(',')}
          multiple
          hidden
          onChange={(e) => e.target.files?.length && handleFiles(e.target.files)}
        />
      </div>

      <AnimatePresence>
        {dragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-2xl bg-pulse-bg/95 dark:bg-pulse/20 border-2 border-dashed border-pulse flex flex-col items-center justify-center gap-2 pointer-events-none z-10"
          >
            <FiUploadCloud size={28} className="text-pulse" />
            <p className="text-sm font-medium text-pulse">Drop to upload</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
