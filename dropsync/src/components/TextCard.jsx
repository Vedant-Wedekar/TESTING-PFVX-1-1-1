import { useState } from 'react'
import { FiCopy, FiTrash2, FiCheck, FiShare2 } from 'react-icons/fi'
import { BsPinAngle, BsPinAngleFill } from 'react-icons/bs'
import toast from 'react-hot-toast'
import { timeAgo } from '../utils/time'

const CODE_FENCE = /```([\s\S]*?)```/g

function renderContent(content) {
  const parts = []
  let lastIndex = 0
  let match
  let key = 0
  CODE_FENCE.lastIndex = 0
  while ((match = CODE_FENCE.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={key++} className="whitespace-pre-wrap break-words">
          {content.slice(lastIndex, match.index)}
        </span>
      )
    }
    parts.push(
      <pre
        key={key++}
        className="my-2 bg-ink text-paper dark:bg-black/40 rounded-lg p-3 text-xs font-mono overflow-x-auto"
      >
        <code>{match[1].trim()}</code>
      </pre>
    )
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < content.length) {
    parts.push(
      <span key={key++} className="whitespace-pre-wrap break-words">
        {content.slice(lastIndex)}
      </span>
    )
  }
  return parts.length ? parts : content
}

export default function TextCard({ message, onDelete, onTogglePin }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      toast.success('Copied')
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('Copy failed')
    }
  }

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: message.content })
      } catch {
        /* user cancelled */
      }
    } else {
      copy()
    }
  }

  return (
    <div className="card-surface p-4 sm:p-5 animate-riseIn">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-ink-faint dark:text-paper/40 font-mono">
          <span>{timeAgo(message.createdAt)}</span>
          {message.device && (
            <>
              <span>·</span>
              <span>{message.device}</span>
            </>
          )}
        </div>
        {message.pinned && (
          <BsPinAngleFill size={13} className="text-pulse shrink-0" />
        )}
      </div>

      <div className="mt-2.5 text-[15px] leading-relaxed text-ink dark:text-paper/90 max-h-72 overflow-y-auto">
        {renderContent(message.content)}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-line dark:border-line-dark">
        <span className="text-xs font-mono text-ink-faint dark:text-paper/30">
          {message.content.length} chars
        </span>
        <div className="flex items-center gap-1">
          <button onClick={copy} className="btn-icon" aria-label="Copy text">
            {copied ? <FiCheck size={15} className="text-signal-green" /> : <FiCopy size={15} />}
          </button>
          <button onClick={share} className="btn-icon" aria-label="Share text">
            <FiShare2 size={15} />
          </button>
          <button
            onClick={() => onTogglePin(message)}
            className="btn-icon"
            aria-label="Pin text"
          >
            {message.pinned ? <BsPinAngleFill size={15} className="text-pulse" /> : <BsPinAngle size={15} />}
          </button>
          <button
            onClick={() => onDelete(message)}
            className="btn-icon hover:text-signal-red"
            aria-label="Delete text"
          >
            <FiTrash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
