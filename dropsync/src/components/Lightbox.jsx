import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiChevronLeft, FiChevronRight, FiDownload } from 'react-icons/fi'

export default function Lightbox({ images, activeId, onClose, onNavigate }) {
  const index = images.findIndex((m) => m.id === activeId)
  const active = images[index]

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight' && index < images.length - 1)
        onNavigate(images[index + 1].id)
      if (e.key === 'ArrowLeft' && index > 0) onNavigate(images[index - 1].id)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [index, images, onClose, onNavigate])

  if (!active) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center"
        onClick={onClose}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
        >
          <FiX size={20} />
        </button>
        <a
          href={active.imageURL}
          download={active.fileName}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-4 right-16 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
        >
          <FiDownload size={18} />
        </a>

        {index > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onNavigate(images[index - 1].id)
            }}
            className="absolute left-4 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            <FiChevronLeft size={20} />
          </button>
        )}
        {index < images.length - 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onNavigate(images[index + 1].id)
            }}
            className="absolute right-4 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            <FiChevronRight size={20} />
          </button>
        )}

        <motion.img
          key={active.id}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          src={active.imageURL}
          alt={active.fileName}
          onClick={(e) => e.stopPropagation()}
          className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
        />
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/60 text-xs font-mono">
          {index + 1} / {images.length}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
