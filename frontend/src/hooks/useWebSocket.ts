import { useEffect } from 'react'
import { useNavigationStore } from '../store/navigationStore'
import type { WSEvent } from '../types'

export function useWebSocket() {
  const { addBlockedEdge, removeBlockedEdge, setIsReplanning } = useNavigationStore()

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const wsUrl = `${protocol}://${window.location.host}/api/v1/ws/navigation`
    let ws: WebSocket | null = null
    let retryTimer: ReturnType<typeof setTimeout> | null = null
    let retryCount = 0

    const connect = () => {
      ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        console.log('[WS] Connected')
        retryCount = 0
      }

      ws.onmessage = (evt) => {
        try {
          const msg: WSEvent = JSON.parse(evt.data)
          if (msg.event === 'edge_blocked') {
            addBlockedEdge(msg.edge_id)
            setIsReplanning(true)
          } else if (msg.event === 'edge_unblocked') {
            removeBlockedEdge(msg.edge_id)
          }
        } catch {/* ignore malformed */}
      }

      ws.onclose = () => {
        if (retryCount < 5) {
          const delay = Math.min(1000 * 2 ** retryCount, 30_000)
          retryTimer = setTimeout(connect, delay)
          retryCount++
        }
      }

      ws.onerror = () => ws?.close()
    }

    connect()
    const pingInterval = setInterval(() => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30_000)

    return () => {
      clearInterval(pingInterval)
      if (retryTimer) clearTimeout(retryTimer)
      ws?.close()
    }
  }, [addBlockedEdge, removeBlockedEdge, setIsReplanning])
}
