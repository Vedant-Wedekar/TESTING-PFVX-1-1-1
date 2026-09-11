import { useCallback, useEffect, useRef, useState } from 'react'
import { useOnlineStatus } from './useOnlineStatus'
import { addTextMessage, addImageMessage } from '../lib/messages'
import toast from 'react-hot-toast'

/**
 * Wraps text/image uploads so that if the device is offline, jobs are
 * queued in memory and automatically flushed the moment connectivity
 * returns, instead of failing silently.
 */
export function useUploadQueue(roomId) {
  const online = useOnlineStatus()
  const [queue, setQueue] = useState([])
  const wasOffline = useRef(false)

  const runJob = useCallback(
    async (job) => {
      if (job.kind === 'text') {
        await addTextMessage(roomId, job.payload)
      } else {
        await addImageMessage(roomId, job.file, job.payload)
      }
    },
    [roomId]
  )

  const flush = useCallback(async () => {
    setQueue((current) => {
      if (current.length === 0) return current
      ;(async () => {
        for (const job of current) {
          try {
            await runJob(job)
          } catch {
            toast.error('A queued upload failed to send.')
          }
        }
        setQueue([])
        toast.success('Queued uploads sent.')
      })()
      return current
    })
  }, [runJob])

  useEffect(() => {
    if (!online) wasOffline.current = true
    if (online && wasOffline.current) {
      wasOffline.current = false
      flush()
    }
  }, [online, flush])

  const enqueueOrRun = useCallback(
    async (job) => {
      if (!online) {
        setQueue((q) => [...q, job])
        toast('Offline — queued, will send when back online.', { icon: '📶' })
        return
      }
      await runJob(job)
    },
    [online, runJob]
  )

  return { online, queuedCount: queue.length, enqueueOrRun }
}
