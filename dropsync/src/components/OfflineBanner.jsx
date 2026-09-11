import { motion, AnimatePresence } from 'framer-motion'
import { FiWifiOff } from 'react-icons/fi'

export default function OfflineBanner({ online, queuedCount }) {
  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <div className="bg-signal-amber/10 text-signal-amber text-xs font-medium px-4 py-2 flex items-center justify-center gap-2">
            <FiWifiOff size={13} />
            You&apos;re offline — uploads will send automatically once reconnected
            {queuedCount > 0 && ` (${queuedCount} queued)`}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
