import { create } from 'zustand'
import type { Location, MapEdge, MapNode, NavigateResponse, Route } from '../types'
import type { AlgorithmType } from '../types'

interface NavigationState {
  // Input
  query: string
  originNodeId: string
  algorithm: AlgorithmType
  accessibleOnly: boolean

  // Results
  response: NavigateResponse | null
  currentRoute: Route | null
  currentStep: number

  // Map state
  mapNodes: MapNode[]
  mapEdges: MapEdge[]
  blockedEdgeIds: Set<string>

  // Location data
  locations: Location[]

  // UI state
  isNavigating: boolean
  isReplanning: boolean
  error: string | null
  sidebarOpen: boolean
  showGraph: boolean

  // Actions
  setQuery: (q: string) => void
  setOriginNodeId: (id: string) => void
  setAlgorithm: (a: AlgorithmType) => void
  setAccessibleOnly: (v: boolean) => void
  setResponse: (r: NavigateResponse | null) => void
  setCurrentStep: (step: number) => void
  advanceStep: () => void
  setMapData: (nodes: MapNode[], edges: MapEdge[]) => void
  setLocations: (locs: Location[]) => void
  setIsNavigating: (v: boolean) => void
  setIsReplanning: (v: boolean) => void
  setError: (e: string | null) => void
  toggleSidebar: () => void
  toggleShowGraph: () => void
  addBlockedEdge: (edgeId: string) => void
  removeBlockedEdge: (edgeId: string) => void
  clearNavigation: () => void
  applyReplan: (route: Route) => void
}

export const useNavigationStore = create<NavigationState>((set) => ({
  query: '',
  originNodeId: 'n_main_gate',
  algorithm: 'ASTAR',
  accessibleOnly: false,

  response: null,
  currentRoute: null,
  currentStep: 0,

  mapNodes: [],
  mapEdges: [],
  blockedEdgeIds: new Set(),

  locations: [],

  isNavigating: false,
  isReplanning: false,
  error: null,
  sidebarOpen: true,
  showGraph: true,

  setQuery: (q) => set({ query: q }),
  setOriginNodeId: (id) => set({ originNodeId: id }),
  setAlgorithm: (a) => set({ algorithm: a }),
  setAccessibleOnly: (v) => set({ accessibleOnly: v }),

  setResponse: (r) => set({ response: r, currentRoute: r?.route ?? null, currentStep: 0 }),

  setCurrentStep: (step) => set({ currentStep: step }),
  advanceStep: () => set((s) => ({
    currentStep: Math.min(s.currentStep + 1, (s.currentRoute?.instructions.length ?? 1) - 1),
  })),

  setMapData: (nodes, edges) => set({ mapNodes: nodes, mapEdges: edges }),
  setLocations: (locs) => set({ locations: locs }),
  setIsNavigating: (v) => set({ isNavigating: v }),
  setIsReplanning: (v) => set({ isReplanning: v }),
  setError: (e) => set({ error: e }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleShowGraph: () => set((s) => ({ showGraph: !s.showGraph })),

  addBlockedEdge: (edgeId) =>
    set((s) => {
      const next = new Set(s.blockedEdgeIds)
      next.add(edgeId)
      // Reflect in mapEdges
      const mapEdges = s.mapEdges.map((e) => e.id === edgeId ? { ...e, is_blocked: true } : e)
      return { blockedEdgeIds: next, mapEdges }
    }),

  removeBlockedEdge: (edgeId) =>
    set((s) => {
      const next = new Set(s.blockedEdgeIds)
      next.delete(edgeId)
      const mapEdges = s.mapEdges.map((e) => e.id === edgeId ? { ...e, is_blocked: false } : e)
      return { blockedEdgeIds: next, mapEdges }
    }),

  clearNavigation: () => set({ response: null, currentRoute: null, currentStep: 0, error: null }),

  applyReplan: (route) => set({ currentRoute: route, currentStep: 0, isReplanning: false }),
}))
