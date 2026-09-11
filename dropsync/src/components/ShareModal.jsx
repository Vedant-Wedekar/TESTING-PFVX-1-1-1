import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { FiX, FiCopy } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function ShareModal({ roomId, open, onClose }) {
  const url = `${window.location.origin}/room/${roomId}`

  const copyLink = async () => {
    await navigator.clipboard.writeText(url)
    toast.success('Room link copied')
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-5"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="card-surface p-6 w-full max-w-xs text-center relative"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 btn-icon"
            >
              <FiX size={16} />
            </button>
            <p className="text-sm font-medium mb-4">Share this room</p>
            <div className="bg-white p-4 rounded-xl inline-block">
              <QRCodeSVG value={url} size={160} fgColor="#15161A" />
            </div>
            <p className="mt-4 font-mono text-lg tracking-widest">{roomId}</p>
            <button
              onClick={copyLink}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-ink dark:bg-paper text-paper dark:text-ink text-sm font-medium py-2.5 rounded-xl hover:opacity-90 transition"
            >
              <FiCopy size={14} />
              Copy room link
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
