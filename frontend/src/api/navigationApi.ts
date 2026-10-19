import apiClient from './client'
import type {
  GraphData,
  Location,
  NavigateRequest,
  NavigateResponse,
  ReplanRequest,
  Route,
} from '../types'

export const navigationApi = {
  navigate: async (req: NavigateRequest): Promise<NavigateResponse> => {
    const { data } = await apiClient.post<NavigateResponse>('/navigation/navigate', req)
    return data
  },

  replan: async (req: ReplanRequest): Promise<Route> => {
    const { data } = await apiClient.post<Route>('/navigation/replan', req)
    return data
  },

  resolveLocation: async (query: string): Promise<{ location: Location | null; confidence: number; alternatives: unknown[] }> => {
    const { data } = await apiClient.post('/navigation/resolve-location', { query })
    return data
  },

  blockEdge: async (edgeId: string, isBlocked: boolean) => {
    const { data } = await apiClient.patch(`/navigation/graph/edges/${edgeId}/block`, { is_blocked: isBlocked })
    return data
  },
}

export const graphApi = {
  getGraph: async (): Promise<GraphData> => {
    const { data } = await apiClient.get<GraphData>('/graph')
    return data
  },

  getStats: async () => {
    const { data } = await apiClient.get('/graph/stats')
    return data
  },

  getBlockedEdges: async () => {
    const { data } = await apiClient.get('/graph/blocked-edges')
    return data
  },
}

export const locationsApi = {
  getAll: async (params?: { category?: string; accessible?: boolean; q?: string }): Promise<{ locations: Location[]; count: number }> => {
    const { data } = await apiClient.get('/locations', { params })
    return data
  },

  getById: async (id: string): Promise<Location> => {
    const { data } = await apiClient.get(`/locations/${id}`)
    return data
  },
}
