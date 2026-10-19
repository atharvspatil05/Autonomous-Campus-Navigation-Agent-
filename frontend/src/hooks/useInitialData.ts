import { useEffect } from 'react'
import { useNavigationStore } from '../store/navigationStore'
import { graphApi, locationsApi } from '../api/navigationApi'

/**
 * Loads graph data and locations on mount into the Zustand store.
 */
export function useInitialData() {
  const { setMapData, setLocations } = useNavigationStore()

  useEffect(() => {
    const load = async () => {
      try {
        const [graphData, locData] = await Promise.all([
          graphApi.getGraph(),
          locationsApi.getAll(),
        ])
        setMapData(graphData.nodes, graphData.edges)
        setLocations(locData.locations)
      } catch (err) {
        console.error('Failed to load initial map data:', err)
      }
    }
    load()
  }, [setMapData, setLocations])
}
