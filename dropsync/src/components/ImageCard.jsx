import { useState } from 'react'
import { FiDownload, FiTrash2, FiMaximize2, FiShare2, FiCopy, FiCheck } from 'react-icons/fi'
import { BsPinAngle, BsPinAngleFill } from 'react-icons/bs'
import toast from 'react-hot-toast'
import { timeAgo, formatBytes } from '../utils/time'

export default function ImageCard({ message, onDelete, onTogglePin, onOpenFullscreen }) {
  const [loaded, setLoaded] = useState(false)
  const [copied, setCopied] = useState(false)

  const download = async () => {
    try {
      const res = await fetch(message.imageURL)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = message.fileName || 'dropsync-image'
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Downloaded')
    } catch {
      window.open(message.imageURL, '_blank')
    }
  }

  const copyImage = async () => {
    try {
      const res = await fetch(message.imageURL)
      const blob = await res.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ])
      setCopied(true)
      toast.success('Image copied')
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('Copy not supported here')
    }
  }

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ url: message.imageURL })
      } catch {
        /* cancelled */
      }
    } else {
      copyImage()
    }
  }

  return (
    <div className="card-surface overflow-hidden animate-riseIn">
      <div
        className="relative bg-paper-dim dark:bg-white/5 cursor-zoom-in group"
        onClick={() => onOpenFullscreen(message)}
      >
        {!loaded && <div className="skeleton animate-shimmer aspect-video w-full" />}
        <img
          src={message.imageURL}
          alt={message.fileName || 'Shared image'}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`w-full max-h-80 object-cover transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0 absolute inset-0'
          }`}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <FiMaximize2
            size={20}
            className="text-white opacity-0 group-hover:opacity-90 drop-shadow transition-opacity"
          />
        </div>
        {message.pinned && (
          <BsPinAngleFill
            size={13}
            className="absolute top-2.5 right-2.5 text-white drop-shadow"
          />
        )}
      </div>

      <div className="p-3.5">
        <div className="flex items-center justify-between text-xs text-ink-faint dark:text-paper/40 font-mono mb-2">
          <span>{timeAgo(message.createdAt)}</span>
          <span>{formatBytes(message.size)}</span>
        </div>
        <div className="flex items-center justify-end gap-1">
          <button onClick={download} className="btn-icon" aria-label="Download image">
            <FiDownload size={15} />
          </button>
          <button onClick={copyImage} className="btn-icon" aria-label="Copy image">
            {copied ? <FiCheck size={15} className="text-signal-green" /> : <FiCopy size={15} />}
          </button>
          <button onClick={share} className="btn-icon" aria-label="Share image">
            <FiShare2 size={15} />
          </button>
          <button
            onClick={() => onTogglePin(message)}
            className="btn-icon"
            aria-label="Pin image"
          >
            {message.pinned ? <BsPinAngleFill size={15} className="text-pulse" /> : <BsPinAngle size={15} />}
          </button>
          <button
            onClick={() => onDelete(message)}
            className="btn-icon hover:text-signal-red"
            aria-label="Delete image"
          >
            <FiTrash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
