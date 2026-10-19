import { useEffect } from 'react'
import { useNavigationStore } from '../store/navigationStore'
import { navigationApi } from '../api/navigationApi'

/**
 * useReplan: listens for blocked-edge changes and automatically re-routes
 * when the current route passes through a newly blocked edge.
 */
export function useReplan() {
  const {
    currentRoute,
    blockedEdgeIds,
    originNodeId,
    algorithm,
    accessibleOnly,
    setIsReplanning,
    applyReplan,
    setError,
  } = useNavigationStore()

  useEffect(() => {
    if (!currentRoute) return
    if (blockedEdgeIds.size === 0) return

    // Check if any blocked edge is on the current route
    const routeEdgeSet = new Set(currentRoute.edge_ids)
    const conflict = [...blockedEdgeIds].some((id) => routeEdgeSet.has(id))
    if (!conflict) return

    // Trigger replan
    setIsReplanning(true)
    const run = async () => {
      try {
        const newRoute = await navigationApi.replan({
          current_node_id: originNodeId,
          destination_node_id: currentRoute.destination_node_id,
          blocked_edge_ids: [...blockedEdgeIds],
          preferences: { algorithm, accessible_only: accessibleOnly, avoid_blocked: true },
        })
        applyReplan(newRoute)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Replan failed'
        setError(`⚠️ ${msg}`)
        setIsReplanning(false)
      }
    }

    run()
  }, [blockedEdgeIds, currentRoute, originNodeId, algorithm, accessibleOnly, setIsReplanning, applyReplan, setError])
}
