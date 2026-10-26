import { useEffect, useRef } from 'react'
import { useNavigationStore } from '../store/navigationStore'
import type { Instruction, MapNode } from '../types'

/**
 * Calculates distance between two lat/lng points in meters using Haversine formula
 */
function getHaversineDistanceM(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function speakInstruction(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  try {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.05
    utterance.pitch = 1.0
    window.speechSynthesis.speak(utterance)
  } catch {
    /* ignore */
  }
}

export function useWalkSimulation() {
  const {
    currentRoute,
    response,
    isWalking,
    isPausedWalking,
    walkSpeed,
    voiceEnabled,
    currentStep,
    setCurrentStep,
    setUserPosition,
    setWalkProgress,
    setHasArrived,
    setIsWalking,
  } = useNavigationStore()

  const animFrameRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(Date.now())
  const distanceRef = useRef<number>(0)
  const lastAnnouncedStepRef = useRef<number>(-1)

  // Reset simulation when route changes or walking stops
  useEffect(() => {
    if (!isWalking) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      distanceRef.current = 0
      lastAnnouncedStepRef.current = -1
    }
  }, [isWalking, currentRoute])

  useEffect(() => {
    if (!isWalking || isPausedWalking || !currentRoute || currentRoute.nodes.length < 2) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      return
    }

    const nodes: MapNode[] = currentRoute.nodes
    const instructions: Instruction[] = currentRoute.instructions

    // Precalculate cumulative distances for each segment
    const segmentDistances: number[] = []
    const cumulativeDistances: number[] = [0]
    let totalDist = 0

    for (let i = 0; i < nodes.length - 1; i++) {
      const d = Math.max(
        1,
        getHaversineDistanceM(
          nodes[i].lat,
          nodes[i].lng,
          nodes[i + 1].lat,
          nodes[i + 1].lng
        )
      )
      segmentDistances.push(d)
      totalDist += d
      cumulativeDistances.push(totalDist)
    }

    // Map each instruction to a cumulative distance threshold
    // based on its node_id
    const instructionDistanceMap: number[] = instructions.map((instr) => {
      const nodeIdx = nodes.findIndex((n) => n.id === instr.node_id)
      if (nodeIdx >= 0) {
        return cumulativeDistances[nodeIdx] ?? 0
      }
      return 0
    })

    // Base speed: 6 meters/sec * walkSpeed multiplier (1x, 2x, 4x)
    const baseMetersPerSecond = 8
    lastTimeRef.current = Date.now()

    // Announce first instruction if just starting
    if (lastAnnouncedStepRef.current === -1 && instructions.length > 0) {
      lastAnnouncedStepRef.current = 0
      if (voiceEnabled) {
        speakInstruction(instructions[0].description)
      }
    }

    const frame = () => {
      const now = Date.now()
      const deltaSec = Math.min((now - lastTimeRef.current) / 1000, 0.1)
      lastTimeRef.current = now

      const stepMeters = baseMetersPerSecond * walkSpeed * deltaSec
      distanceRef.current = Math.min(distanceRef.current + stepMeters, totalDist)

      const curDist = distanceRef.current
      const progressPct = totalDist > 0 ? (curDist / totalDist) * 100 : 0
      setWalkProgress(progressPct)

      // Find current segment
      let segIdx = 0
      while (
        segIdx < segmentDistances.length - 1 &&
        cumulativeDistances[segIdx + 1] < curDist
      ) {
        segIdx++
      }

      const segStartDist = cumulativeDistances[segIdx]
      const segLength = segmentDistances[segIdx]
      const segRatio = Math.max(
        0,
        Math.min(1, (curDist - segStartDist) / (segLength || 1))
      )

      const n1 = nodes[segIdx]
      const n2 = nodes[segIdx + 1]

      const currentLat = n1.lat + (n2.lat - n1.lat) * segRatio
      const currentLng = n1.lng + (n2.lng - n1.lng) * segRatio
      setUserPosition([currentLat, currentLng])

      // Determine active instruction step
      let activeInstrIdx = 0
      for (let i = instructionDistanceMap.length - 1; i >= 0; i--) {
        if (curDist >= instructionDistanceMap[i] - 4) {
          activeInstrIdx = i
          break
        }
      }

      if (activeInstrIdx !== currentStep) {
        setCurrentStep(activeInstrIdx)
      }

      // Voice announcement for new step
      if (activeInstrIdx !== lastAnnouncedStepRef.current) {
        lastAnnouncedStepRef.current = activeInstrIdx
        if (voiceEnabled && instructions[activeInstrIdx]) {
          speakInstruction(instructions[activeInstrIdx].description)
        }
      }

      // Reached destination
      if (curDist >= totalDist - 0.5) {
        setIsWalking(false)
        setHasArrived(true)
        const destName = response?.resolved_location?.name || 'your destination'
        if (voiceEnabled) {
          speakInstruction(`You have arrived at ${destName}`)
        }
        return
      }

      animFrameRef.current = requestAnimationFrame(frame)
    }

    animFrameRef.current = requestAnimationFrame(frame)
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [
    isWalking,
    isPausedWalking,
    walkSpeed,
    currentRoute,
    voiceEnabled,
    currentStep,
    setCurrentStep,
    setUserPosition,
    setWalkProgress,
    setHasArrived,
    setIsWalking,
    response,
  ])
}
